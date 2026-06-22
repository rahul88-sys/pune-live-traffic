'use client'
import { useState } from 'react'
import { INCIDENT_TYPES, INCIDENT_EMOJIS, INCIDENT_LABELS } from '@/lib/constants'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { CreateIncidentPayload, IncidentType } from '@/types/incident'
import { X, MapPin, ArrowRight } from 'lucide-react'

interface Props {
  lat: number
  lng: number
  onSuccess: () => void
  onCancel: () => void
}

const SEVERITY_OPTIONS = [
  { value: 'low',      label: 'Low',      color: '#30d158' },
  { value: 'medium',   label: 'Medium',   color: '#ffd60a' },
  { value: 'high',     label: 'High',     color: '#ff9500' },
  { value: 'critical', label: 'Critical', color: '#ff453a' },
]

export default function IncidentReportForm({ lat, lng, onSuccess, onCancel }: Props) {
  const [type, setType] = useState<IncidentType>('traffic_jam')
  const [severity, setSeverity] = useState('medium')
  const [description, setDescription] = useState('')
  const [waterLevel, setWaterLevel] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: CreateIncidentPayload = { type, severity: severity as never, description, lat, lng }
      if (type === 'waterlogging' && waterLevel) payload.waterLevel = waterLevel
      await api.post('/incidents', payload)
      toast.success('Incident reported! Thank you 🙏')
      onSuccess()
    } catch {
      toast.error('Failed to report. Please sign in first.')
    } finally {
      setLoading(false)
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
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-white/[0.07]">
          <div>
            <h2 className="text-[15px] font-semibold text-white tracking-tight">Report Incident</h2>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#ff9500]" />
              <span className="text-[11px] text-white/30">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 transition-colors duration-200"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Type grid */}
          <div>
            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">Incident Type</p>
            <div className="grid grid-cols-4 gap-2">
              {INCIDENT_TYPES.map((t) => {
                const active = type === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t as IncidentType)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200"
                    style={{
                      background: active ? 'rgba(255,149,0,0.12)' : 'rgba(255,255,255,0.04)',
                      border: active ? '1px solid rgba(255,149,0,0.35)' : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <span className="text-xl leading-none">{INCIDENT_EMOJIS[t]}</span>
                    <span
                      className="text-[10px] text-center leading-tight font-medium"
                      style={{ color: active ? '#ff9500' : 'rgba(255,255,255,0.35)' }}
                    >
                      {INCIDENT_LABELS[t]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Severity */}
          <div>
            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">Severity</p>
            <div className="grid grid-cols-4 gap-2">
              {SEVERITY_OPTIONS.map((s) => {
                const active = severity === s.value
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSeverity(s.value)}
                    className="py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200"
                    style={{
                      background: active ? `${s.color}18` : 'rgba(255,255,255,0.04)',
                      border: active ? `1px solid ${s.color}40` : '1px solid rgba(255,255,255,0.07)',
                      color: active ? s.color : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Water level */}
          {type === 'waterlogging' && (
            <div>
              <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">Water Level</p>
              <select
                value={waterLevel}
                onChange={(e) => setWaterLevel(e.target.value)}
                className="input-apple w-full px-4 py-3"
              >
                <option value="">Select level…</option>
                <option value="ankle">Ankle deep</option>
                <option value="knee">Knee deep</option>
                <option value="car_level">Car level</option>
                <option value="impassable">Impassable</option>
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">
              Details <span className="normal-case font-normal text-white/20">(optional)</span>
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Help other commuters with more context…"
              rows={2}
              maxLength={300}
              className="input-apple w-full px-4 py-3 resize-none"
            />
            <p className="text-right text-[10px] text-white/20 mt-1">{description.length}/300</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-2xl text-[13px] font-semibold text-white/40 hover:text-white/60 transition-colors duration-200"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-apple flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px]"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  Reporting…
                </>
              ) : (
                <>Report <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
