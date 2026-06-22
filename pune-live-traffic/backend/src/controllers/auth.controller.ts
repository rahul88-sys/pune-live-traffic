import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signToken } from '../lib/jwt'
import { registerSchema, loginSchema } from '../validators/auth.validator'
import https from 'https'

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
  }
  const { email, password, name } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(409).json({ success: false, error: { code: 'EMAIL_TAKEN', message: 'Email already registered' } })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, name, password: hashed, provider: 'email' },
    select: { id: true, email: true, name: true, role: true, reputationScore: true },
  })

  const token = signToken({ userId: user.id, role: user.role })
  return res.status(201).json({ success: true, token, user })
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
  }
  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } })
  }

  const token = signToken({ userId: user.id, role: user.role })
  return res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, reputationScore: user.reputationScore },
  })
}

// Verify a Google access token and return the profile
function fetchGoogleProfile(accessToken: string): Promise<{ sub: string; email: string; name: string; picture?: string }> {
  return new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/oauth2/v3/userinfo`
    https.get(
      { hostname: 'www.googleapis.com', path: '/oauth2/v3/userinfo', headers: { Authorization: `Bearer ${accessToken}` } },
      (resp) => {
        let data = ''
        resp.on('data', (chunk) => (data += chunk))
        resp.on('end', () => {
          try { resolve(JSON.parse(data)) } catch { reject(new Error('Invalid JSON from Google')) }
        })
      }
    ).on('error', reject)
  })
}

export async function googleAuth(req: Request, res: Response) {
  const { accessToken } = req.body
  if (!accessToken) {
    return res.status(400).json({ success: false, error: { message: 'accessToken required' } })
  }

  let profile: { sub: string; email: string; name: string; picture?: string }
  try {
    profile = await fetchGoogleProfile(accessToken)
  } catch {
    return res.status(401).json({ success: false, error: { message: 'Could not verify Google token' } })
  }

  if (!profile.email) {
    return res.status(401).json({ success: false, error: { message: 'Google did not return an email' } })
  }

  // Upsert: find by email, update provider info; create if new
  let user = await prisma.user.findUnique({ where: { email: profile.email } })
  if (user) {
    user = await prisma.user.update({
      where: { email: profile.email },
      data: {
        provider: 'google',
        providerId: profile.sub,
        avatarUrl: profile.picture ?? user.avatarUrl ?? undefined,
      },
    })
  } else {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        provider: 'google',
        providerId: profile.sub,
        avatarUrl: profile.picture,
      },
    })
  }

  const token = signToken({ userId: user.id, role: user.role })
  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      reputationScore: user.reputationScore,
      avatarUrl: user.avatarUrl,
    },
  })
}

export async function getMe(req: Request & { user?: { userId: string } }, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, avatarUrl: true, role: true, reputationScore: true, totalReports: true, createdAt: true },
  })
  if (!user) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } })
  return res.json({ success: true, user })
}
