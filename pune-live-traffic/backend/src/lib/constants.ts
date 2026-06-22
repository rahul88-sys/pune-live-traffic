export const INCIDENT_TYPES = [
  'traffic_jam',
  'road_block',
  'waterlogging',
  'pothole',
  'accident',
  'procession',
  'construction',
  'other',
] as const

export const INCIDENT_SEVERITY = ['low', 'medium', 'high', 'critical'] as const

export const WATER_LEVELS = ['ankle', 'knee', 'car_level', 'impassable'] as const

export const INCIDENT_EXPIRY_HOURS = 2

export const VERIFIED_UPVOTE_THRESHOLD = 3

export const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 }

export const DEFAULT_SEARCH_RADIUS_KM = 10
