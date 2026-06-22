import { z } from 'zod'
import { INCIDENT_TYPES, INCIDENT_SEVERITY, WATER_LEVELS } from '../lib/constants'

export const createIncidentSchema = z.object({
  type: z.enum(INCIDENT_TYPES),
  severity: z.enum(INCIDENT_SEVERITY).optional().default('medium'),
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  waterLevel: z.enum(WATER_LEVELS).optional(),
  photoUrls: z.array(z.string().url()).optional().default([]),
})

export const getIncidentsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(50).optional().default(10),
  type: z.string().optional(),
  severity: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
})

export const voteSchema = z.object({
  voteType: z.enum(['up', 'down']),
})
