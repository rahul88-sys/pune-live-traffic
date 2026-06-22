'use client'
import { Incident } from '@/types/incident'
import { INCIDENT_EMOJIS, INCIDENT_LABELS } from '@/lib/constants'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useUserStore } from '@/store/userStore'
import { X, MapPin, Clock, ThumbsUp, ThumbsDown, CheckCircle, Star, Droplets } from 'lucide-react'

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

const SEV_BADGE: Record<string, { color: string; bg: string }> = {
  critical: { color: '#ff453a', bg: 'rgba(255,69,58,0.12)' },
  high:     { color: '#ff9500', bg: 'rgba(255,149,0,0.12)' },
  medium:   { color: '#ffd60a', bg: 'rgba(255,214,10,0.12)' },
  low:      { color: '#30d158', bg: 'rgba(48,209,88,0.12)' },
}

interface Props {
  incident: Incident
  onClose: () => void
  onVote: (id: string, patch: Partial<Incident>) => void
}

export default function IncidentDetail({ incident, onClose, onVote }: Props) {
  const { user } = useUserStore()
  const sev = SEV_BADGE[incident.severity] ?? SEV_BADGE.medium

  async function handleVote(voteType: 'up' | 'down') {
    if (!user) { toast.error('Sign in to vote'); return }
    try {
      const { data } = await api.post(`/incidents/${incident.id}/vote`, { voteType })
      onVote(incident.id, { upvoteCount: data.upvoteCount, isVerified: data.isVerified })
      toast.success(voteType === 'up' ? 'Confirmed!' : 'Reported as inaccurate')
    } catch {
      toast.error('Failed to vote')
    }
  }

  async function handleResolve() {
    if (!user) { toast.error('Sign in to resolve'); return }
    try {
      await api.patch(`/incidents/${incident.id}/resolve`)
      toast.success('Marked as resolved')
      onClose()
    } catch {
      toast.error('Cannot resolve this incident')
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-[9999] p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-[420px] rounded-3xl overflow-hidden fade-up-modal"
        style={{
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {INCIDENT_EMOJIS[incident.type]}
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white tracking-tight">
                {INCIDENT_LABELS[incident.type]}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{ color: sev.color, background: sev.bg }}
                >
                  {incident.severity}
                </span>
                {incident.isVerified && (
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                    style={{ color: '#30d158', background: 'rgba(48,209,88,0.12)' }}
                  >
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 transition-colors duration-200 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {incident.locationName && (
            <div className="flex items-center gap-2 text-[13px] text-white/50">
              <MapPin className="w-3.5 h-3.5 text-[#ff9500] flex-shrink-0" />
              {incident.locationName}
            </div>
          )}

          {incident.description && (
            <p
              className="text-[13px] text-white/60 rounded-2xl p-3.5 leading-relaxed"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {incident.description}
            </p>
          )}

          {incident.waterLevel && (
            <div
              className="flex items-center gap-2 text-[13px] rounded-2xl p-3.5"
              style={{ background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.15)', color: '#64d2ff' }}
            >
              <Droplets className="w-4 h-4 flex-shrink-0" />
              Water level:{' '}
              <strong className="capitalize">{incident.waterLevel.replace('_', ' ')}</strong>
            </div>
          )}

          {incident.photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
              {incident.photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="h-24 w-32 object-cover rounded-2xl flex-shrink-0"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-white/25 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(incident.createdAt)}
            </span>
            {incident.reporter && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-[#ffd60a]" />
                {incident.reporter.name} · {incident.reporter.reputationScore} rep
              </span>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div
          className="px-5 pb-5 flex gap-2 pt-1 border-t border-white/[0.05]"
          style={{ paddingTop: '12px' }}
        >
          <button
            onClick={() => handleVote('up')}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-200 hover:opacity-80"
            style={{ background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)', color: '#30d158' }}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            {incident.upvoteCount} Confirm
          </button>
          <button
            onClick={() => handleVote('down')}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl text-[13px] transition-all duration-200 hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            {incident.downvoteCount}
          </button>
          <button
            onClick={handleResolve}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-200 hover:opacity-80"
            style={{ background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.2)', color: '#0a84ff' }}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Resolved
          </button>
        </div>
      </div>
    </div>
  )
}
