import { Router } from 'express'
import multer from 'multer'
import { uploadIncidentPhoto } from '../controllers/upload.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.post('/incident-photo', requireAuth, upload.single('file'), uploadIncidentPhoto)

export default router
