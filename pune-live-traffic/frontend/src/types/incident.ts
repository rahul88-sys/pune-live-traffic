export type IncidentType =
  | 'traffic_jam'
  | 'road_block'
  | 'waterlogging'
  | 'pothole'
  | 'accident'
  | 'procession'
  | 'construction'
  | 'other'

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Incident {
  id: string
  type: IncidentType
  severity: IncidentSeverity
  title?: string
  description?: string
  lat: number
  lng: number
  locationName?: string
  waterLevel?: string
  upvoteCount: number
  downvoteCount: number
  isVerified: boolean
  isResolved: boolean
  status: string
  distanceKm?: number
  expiresAt: string
  createdAt: string
  reporter?: { name: string; reputationScore: number }
  photos: string[]
}

export interface CreateIncidentPayload {
  type: IncidentType
  severity?: IncidentSeverity
  title?: string
  description?: string
  lat: number
  lng: number
  waterLevel?: string
  photoUrls?: string[]
}
