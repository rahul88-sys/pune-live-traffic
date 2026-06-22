import { Router } from 'express'
import { getAreas, getTrafficPrediction } from '../controllers/areas.controller'

const router = Router()

router.get('/', getAreas)
router.get('/:areaId/predict', getTrafficPrediction)

export default router
