import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export async function getAreas(_req: Request, res: Response) {
  const areas = await prisma.area.findMany({ orderBy: { name: 'asc' } })
  return res.json({ success: true, areas })
}

export async function getTrafficPrediction(req: Request, res: Response) {
  const { areaId } = req.params
  const area = await prisma.area.findUnique({ where: { id: areaId } })
  if (!area) {
    return res.status(404).json({ success: false, error: { code: 'AREA_NOT_FOUND', message: 'Area not found' } })
  }

  const now = new Date()
  const predictions = []

  for (let h = 0; h < 6; h++) {
    const targetHour = (now.getHours() + h) % 24
    const targetDay = now.getDay()

    const snapshots = await prisma.trafficSnapshot.findMany({
      where: { areaId, hourOfDay: targetHour, dayOfWeek: targetDay },
      orderBy: { snapshotAt: 'desc' },
      take: 10,
    })

    const avgPct = snapshots.length
      ? Math.round(snapshots.reduce((s: number, snap: { congestionPct: number | null }) => s + (snap.congestionPct ?? 50), 0) / snapshots.length)
      : 40

    let congestion = 'low'
    if (avgPct >= 70) congestion = 'heavy'
    else if (avgPct >= 45) congestion = 'medium'

    const hour = `${String(targetHour).padStart(2, '0')}:00`
    predictions.push({ hour, congestion, congestionPct: avgPct })
  }

  const best = predictions.reduce((a, b) => (a.congestionPct < b.congestionPct ? a : b))

  return res.json({
    success: true,
    areaName: area.name,
    predictions,
    bestTimeToTravel: best.hour,
    confidence: 65,
  })
}
