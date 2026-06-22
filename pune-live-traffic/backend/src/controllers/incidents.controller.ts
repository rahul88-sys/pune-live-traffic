import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { createIncidentSchema, getIncidentsSchema, voteSchema } from '../validators/incident.validator'
import { INCIDENT_EXPIRY_HOURS, VERIFIED_UPVOTE_THRESHOLD } from '../lib/constants'
import { getSocketServer } from '../lib/socket'

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function getIncidents(req: AuthRequest, res: Response) {
  const parsed = getIncidentsSchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
  }
  const { lat, lng, radius, type, severity, limit, offset } = parsed.data

  const where: Record<string, unknown> = { status: 'active' }
  if (type) where.type = { in: type.split(',') }
  if (severity) where.severity = { in: severity.split(',') }

  const all = await prisma.incident.findMany({
    where,
    include: {
      user: { select: { name: true, reputationScore: true } },
      photos: { select: { blobUrl: true }, take: 3 },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  type RawIncident = (typeof all)[0]
  type IncidentWithDist = RawIncident & { distanceKm: number }
  const withDist: IncidentWithDist[] = all.map((i: RawIncident) => ({ ...i, distanceKm: distanceKm(lat, lng, i.lat, i.lng) }))
  const nearby = withDist
    .filter((i) => i.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(offset, offset + limit)

  return res.json({
    success: true,
    count: nearby.length,
    incidents: nearby.map((i) => ({
      ...i,
      reporter: i.user ? { name: i.user.name, reputationScore: i.user.reputationScore } : null,
      photos: i.photos.map((p: { blobUrl: string }) => p.blobUrl),
      user: undefined,
    })),
  })
}

export async function createIncident(req: AuthRequest, res: Response) {
  const parsed = createIncidentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
  }
  const { photoUrls, ...data } = parsed.data
  const expiresAt = new Date(Date.now() + INCIDENT_EXPIRY_HOURS * 60 * 60 * 1000)

  const incident = await prisma.incident.create({
    data: {
      ...data,
      userId: req.user?.userId,
      expiresAt,
      photos: photoUrls?.length
        ? { create: photoUrls.map((url: string) => ({ blobUrl: url, uploadedBy: req.user?.userId })) }
        : undefined,
    },
    include: { photos: { select: { blobUrl: true } } },
  })

  if (req.user?.userId) {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { totalReports: { increment: 1 }, reputationScore: { increment: 10 } },
    })
  }

  const io = getSocketServer()
  io?.emit('incident:new', { ...incident, photos: incident.photos.map((p: { blobUrl: string }) => p.blobUrl) })

  return res.status(201).json({
    success: true,
    incident: { id: incident.id, type: incident.type, status: incident.status, expiresAt: incident.expiresAt },
    message: 'Incident reported. Thank you for keeping Pune safe!',
  })
}

export async function getIncidentById(req: AuthRequest, res: Response) {
  const incident = await prisma.incident.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { name: true, reputationScore: true } },
      photos: { select: { blobUrl: true } },
    },
  })
  if (!incident) {
    return res.status(404).json({ success: false, error: { code: 'INCIDENT_NOT_FOUND', message: 'Incident not found or expired' } })
  }
  return res.json({ success: true, incident })
}

export async function voteIncident(req: AuthRequest, res: Response) {
  const parsed = voteSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
  }
  const { voteType } = parsed.data
  const userId = req.user!.userId
  const incidentId = req.params.id

  const existing = await prisma.incidentVote.findUnique({
    where: { incidentId_userId: { incidentId, userId } },
  })

  if (existing) {
    if (existing.voteType === voteType) {
      await prisma.incidentVote.delete({ where: { incidentId_userId: { incidentId, userId } } })
    } else {
      await prisma.incidentVote.update({
        where: { incidentId_userId: { incidentId, userId } },
        data: { voteType },
      })
    }
  } else {
    await prisma.incidentVote.create({ data: { incidentId, userId, voteType } })
  }

  const [upvotes, downvotes] = await Promise.all([
    prisma.incidentVote.count({ where: { incidentId, voteType: 'up' } }),
    prisma.incidentVote.count({ where: { incidentId, voteType: 'down' } }),
  ])

  const isVerified = upvotes >= VERIFIED_UPVOTE_THRESHOLD
  const updated = await prisma.incident.update({
    where: { id: incidentId },
    data: { upvoteCount: upvotes, downvoteCount: downvotes, isVerified },
  })

  const io = getSocketServer()
  if (isVerified) io?.emit('incident:verified', { id: incidentId, upvoteCount: upvotes })

  return res.json({ success: true, upvoteCount: updated.upvoteCount, isVerified, message: 'Vote recorded' })
}

export async function resolveIncident(req: AuthRequest, res: Response) {
  const incident = await prisma.incident.findUnique({ where: { id: req.params.id } })
  if (!incident) {
    return res.status(404).json({ success: false, error: { code: 'INCIDENT_NOT_FOUND', message: 'Incident not found' } })
  }

  const isOwner = incident.userId === req.user?.userId
  const isAdmin = req.user?.role === 'admin' || req.user?.role === 'authority'
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot resolve this incident' } })
  }

  await prisma.incident.update({
    where: { id: req.params.id },
    data: { status: 'resolved', isResolved: true, resolvedAt: new Date() },
  })

  const io = getSocketServer()
  io?.emit('incident:removed', { id: req.params.id })

  return res.json({ success: true, message: 'Incident marked as resolved' })
}

export async function deleteIncident(req: AuthRequest, res: Response) {
  const incident = await prisma.incident.findUnique({ where: { id: req.params.id } })
  if (!incident) {
    return res.status(404).json({ success: false, error: { code: 'INCIDENT_NOT_FOUND', message: 'Incident not found' } })
  }
  const isOwner = incident.userId === req.user?.userId
  const isAdmin = req.user?.role === 'admin'
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot delete this incident' } })
  }
  await prisma.incident.delete({ where: { id: req.params.id } })
  const io = getSocketServer()
  io?.emit('incident:removed', { id: req.params.id })
  return res.json({ success: true, message: 'Incident deleted' })
}
