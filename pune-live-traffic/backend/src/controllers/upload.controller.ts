import { Response } from 'express'
import { put } from '@vercel/blob'
import { AuthRequest } from '../middleware/auth.middleware'

export async function uploadIncidentPhoto(req: AuthRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file provided' } })
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(req.file.mimetype)) {
    return res.status(422).json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Only JPEG, PNG, WEBP allowed' } })
  }

  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(422).json({ success: false, error: { code: 'FILE_TOO_LARGE', message: 'Max file size is 5MB' } })
  }

  const filename = `incident-photos/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '-')}`

  const blob = await put(filename, req.file.buffer, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  return res.status(201).json({ success: true, url: blob.url })
}
