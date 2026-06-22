'use client'
import { Incident } from '@/types/incident'
import { INCIDENT_EMOJIS, INCIDENT_LABELS } from '@/lib/constants'
import { MapPin, ThumbsUp, Clock, CheckCircle2 } from 'lucide-react'

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

const SEV: Record<string, { left: string; badge: string; badgeBg: string }> = {
  critical: { left: '#ff453a', badge: 'text-[#ff453a]', badgeBg: 'rgba(255,69,58,0.12)' },
  high:     { left: '#ff9500', badge: 'text-[#ff9500]', badgeBg: 'rgba(255,149,0,0.12)' },
  medium:   { left: '#ffd60a', badge: 'text-[#ffd60a]', badgeBg: 'rgba(255,214,10,0.12)' },
  low:      { left: '#30d158', badge: 'text-[#30d158]', badgeBg: 'rgba(48,209,88,0.12)' },
}

interface Props {
  incidents: Incident[]
  onSelect: (incident: Incident) => void
}

export default function IncidentFeed({ incidents, onSelect }: Props) {
  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)' }}
        >
          <CheckCircle2 className="w-5 h-5 text-[#30d158]" />
        </div>
        <p className="text-[13px] font-semibold text-white/70">Roads are clear!</p>
        <p className="text-xs text-white/25 mt-1">No incidents reported nearby</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {incidents.map((incident) => {
        const sev = SEV[incident.severity] ?? SEV.medium
        return (
          <button
            key={incident.id}
            onClick={() => onSelect(incident)}
            className="text-left w-full rounded-xl p-3 transition-all duration-200 hover:bg-white/5 group"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderLeft: `2.5px solid ${sev.left}`,
            }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {INCIDENT_EMOJIS[incident.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span className="text-[13px] font-semibold text-white/85 tracking-tight">
                    {INCIDENT_LABELS[incident.type]}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${sev.badge}`}
                    style={{ background: sev.badgeBg }}
                  >
                    {incident.severity}
                  </span>
                  {incident.isVerified && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-[#30d158]"
                      style={{ background: 'rgba(48,209,88,0.12)' }}
                    >
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/30 truncate mb-1.5">
                  {incident.locationName || `${incident.lat.toFixed(4)}, ${incident.lng.toFixed(4)}`}
                </p>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-0.5 text-[11px] text-white/30">
                    <ThumbsUp className="w-3 h-3" /> {incident.upvoteCount}
                  </span>
                  {incident.distanceKm !== undefined && (
                    <span className="flex items-center gap-0.5 text-[11px] text-white/30">
                      <MapPin className="w-3 h-3" />
                      {incident.distanceKm < 1
                        ? `${Math.round(incident.distanceKm * 1000)}m`
                        : `${incident.distanceKm.toFixed(1)}km`}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5 text-[11px] text-white/20 ml-auto">
                    <Clock className="w-3 h-3" />
                    {timeAgo(incident.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
