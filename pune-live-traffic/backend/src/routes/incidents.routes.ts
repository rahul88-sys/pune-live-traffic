import { Router } from 'express'
import {
  getIncidents,
  createIncident,
  getIncidentById,
  voteIncident,
  resolveIncident,
  deleteIncident,
} from '../controllers/incidents.controller'
import { requireAuth, optionalAuth } from '../middleware/auth.middleware'

const router = Router()

router.get('/', optionalAuth, getIncidents)
router.post('/', requireAuth, createIncident)
router.get('/:id', getIncidentById)
router.post('/:id/vote', requireAuth, voteIncident)
router.patch('/:id/resolve', requireAuth, resolveIncident)
router.delete('/:id', requireAuth, deleteIncident)

export default router
