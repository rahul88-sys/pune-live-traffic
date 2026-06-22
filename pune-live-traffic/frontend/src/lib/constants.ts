export const PUNE_CENTER: [number, number] = [18.5204, 73.8567]
export const DEFAULT_ZOOM = 13

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

export const INCIDENT_LABELS: Record<string, string> = {
  traffic_jam: 'Traffic Jam',
  road_block: 'Road Block',
  waterlogging: 'Waterlogging',
  pothole: 'Pothole',
  accident: 'Accident',
  procession: 'Procession',
  construction: 'Construction',
  other: 'Other',
}

export const INCIDENT_EMOJIS: Record<string, string> = {
  traffic_jam: '🚗',
  road_block: '🚧',
  waterlogging: '💧',
  pothole: '🕳️',
  accident: '🚨',
  procession: '🎉',
  construction: '🏗️',
  other: '⚠️',
}

export const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export const INCIDENT_MARKER_COLORS: Record<string, string> = {
  traffic_jam: '#F97316',
  road_block: '#EF4444',
  waterlogging: '#3B82F6',
  pothole: '#78716C',
  accident: '#DC2626',
  procession: '#A855F7',
  construction: '#F59E0B',
  other: '#6B7280',
}
