'use client'
import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect } from 'react'
import { useIncidents } from '@/hooks/useIncidents'
import { useIncidentStore } from '@/store/incidentStore'
import { useUserStore } from '@/store/userStore'
import IncidentFeed from '@/components/incidents/IncidentFeed'
import IncidentReportForm from '@/components/incidents/IncidentReportForm'
import IncidentDetail from '@/components/incidents/IncidentDetail'
import { Incident } from '@/types/incident'
import { INCIDENT_EMOJIS, INCIDENT_TYPES, INCIDENT_LABELS } from '@/lib/constants'
import Link from 'next/link'
import {
  PanelRight, PanelRightClose, LogOut, MapPin, Star,
  AlertTriangle, Users, ChevronRight,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const MapContainer = dynamic(() => import('@/components/map/MapContainer'), { ssr: false })

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function MapPage() {
  const { incidents, selectedIncident, filterType, setSelectedIncident, setFilterType, updateIncident } = useIncidentStore()
  const { fetchIncidents } = useIncidents()
  const { user, logout } = useUserStore()

  async function handleLogout() {
    logout()
    await signOut({ callbackUrl: '/' })
  }

  const [reportCoords, setReportCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showFeed, setShowFeed] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!user) return
    setReportCoords({ lat, lng })
  }, [user])

  const filtered = filterType ? incidents.filter(i => i.type === filterType) : incidents

  // Severity breakdown for stats
  const criticalCount = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length
  const verifiedCount = incidents.filter(i => i.isVerified).length

  const resolvedUser = mounted ? user : null

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* ── Header ── */}
      <header className="nav-blur border-b border-white/[0.06] px-4 h-11 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[15px] font-semibold tracking-tight text-white hover:text-white/60 transition-colors duration-200">
            Pune Traffic
          </Link>
          <div className="flex items-center gap-1.5 surface rounded-full px-2.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] live-ring" />
            <span className="text-[11px] text-[#30d158] font-semibold tracking-wide">LIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active count pill */}
          <div className="hidden sm:flex items-center gap-1 surface rounded-full px-3 py-1">
            <MapPin className="w-3 h-3 text-[#ff9500]" />
            <span className="text-xs text-white/40">
              <span className="text-white font-semibold">{incidents.length}</span> active
            </span>
          </div>

          {mounted && resolvedUser ? (
            <div className="flex items-center gap-1.5">
              {/* Avatar */}
              <div className="hidden sm:flex items-center gap-1.5 surface rounded-full pl-1 pr-3 py-0.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: 'rgba(255,149,0,0.25)', color: '#ff9500' }}
                >
                  {resolvedUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-white/50">{resolvedUser.name.split(' ')[0]}</span>
                <span className="text-[10px] text-[#ff9500] font-semibold">⭐{resolvedUser.reputationScore}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs text-white/25 hover:text-white/50 transition-colors duration-200 surface rounded-full px-2.5 py-1"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : mounted ? (
            <Link href="/auth/login" className="btn-apple text-xs px-3.5 py-1.5">
              Sign In
            </Link>
          ) : null}

          <button
            onClick={() => setShowFeed(!showFeed)}
            className="hidden sm:flex items-center justify-center w-7 h-7 surface rounded-lg text-white/30 hover:text-white/60 transition-colors duration-200"
          >
            {showFeed ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* ── Map ── */}
        <div className="flex-1 relative">
          <MapContainer
            incidents={filtered}
            onMapClick={handleMapClick}
            onIncidentClick={setSelectedIncident}
          />

          {/* Filter chips */}
          <div
            className="absolute top-3 left-3 right-3 flex gap-1.5 overflow-x-auto pointer-events-auto"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            <button
              onClick={() => setFilterType(null)}
              className={`flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight shadow-lg transition-all duration-200 ${
                !filterType ? 'bg-[#ff9500] text-black' : 'nav-blur border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              All <span className="opacity-50">({incidents.length})</span>
            </button>
            {INCIDENT_TYPES.map(t => {
              const count = incidents.filter(i => i.type === t).length
              if (count === 0) return null
              const active = filterType === t
              return (
                <button
                  key={t}
                  onClick={() => setFilterType(active ? null : t)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight shadow-lg transition-all duration-200 ${
                    active ? 'bg-[#ff9500] text-black' : 'nav-blur border border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <span>{INCIDENT_EMOJIS[t]}</span>
                  <span className="hidden sm:inline">{INCIDENT_LABELS[t]}</span>
                  <span className="opacity-50">({count})</span>
                </button>
              )
            })}
          </div>

          {/* Bottom hint */}
          {mounted && (resolvedUser ? (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 nav-blur border border-white/[0.08] rounded-full px-4 py-2 text-xs text-white/40 pointer-events-none flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[#ff9500]" />
              Tap anywhere on the map to report an incident
            </div>
          ) : (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 nav-blur border border-white/[0.08] rounded-full px-4 py-2 text-xs flex items-center gap-1.5">
              <Link href="/auth/login" className="text-[#ff9500] font-semibold hover:text-[#ffb340] transition-colors">
                Sign in
              </Link>
              <span className="text-white/40">to report incidents</span>
            </div>
          ))}
        </div>

        {/* ── Sidebar ── */}
        <div
          className={`${showFeed ? 'w-72 xl:w-80' : 'w-0'} hidden sm:flex flex-col transition-all duration-300 overflow-hidden border-l border-white/[0.06] flex-shrink-0`}
          style={{ background: 'rgba(5,5,5,0.98)', backdropFilter: 'blur(20px)' }}
        >
          {/* User card */}
          {mounted && resolvedUser ? (
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: 'rgba(255,149,0,0.15)', border: '1px solid rgba(255,149,0,0.25)', color: '#ff9500' }}
                >
                  {resolvedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white truncate">{getGreeting()}, {resolvedUser.name.split(' ')[0]}</p>
                  <p className="text-[11px] text-white/35 truncate">{resolvedUser.email}</p>
                </div>
              </div>
              {/* Reputation bar */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1 surface rounded-full px-2.5 py-1">
                  <Star className="w-3 h-3 text-[#ffd60a]" />
                  <span className="text-[11px] text-white/60 font-medium">{resolvedUser.reputationScore} rep</span>
                </div>
                <div className="flex items-center gap-1 surface rounded-full px-2.5 py-1">
                  <Users className="w-3 h-3 text-[#30d158]" />
                  <span className="text-[11px] text-white/60 font-medium capitalize">{resolvedUser.role}</span>
                </div>
              </div>
            </div>
          ) : mounted ? (
            /* Not logged in — prompt */
            <div
              className="mx-3 mt-3 mb-3 rounded-2xl p-3.5"
              style={{ background: 'rgba(255,149,0,0.06)', border: '1px solid rgba(255,149,0,0.15)' }}
            >
              <p className="text-[12px] font-semibold text-white/70 mb-1">Sign in to contribute</p>
              <p className="text-[11px] text-white/35 mb-2.5 leading-relaxed">
                Report incidents, confirm sightings and earn reputation.
              </p>
              <Link
                href="/auth/login"
                className="flex items-center justify-between text-[12px] font-semibold text-[#ff9500] hover:text-[#ffb340] transition-colors duration-200"
              >
                Sign in or create account
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : null}

          {/* Quick stats */}
          <div className="px-3 py-2.5 border-b border-white/[0.05] grid grid-cols-3 gap-1.5">
            <div className="surface rounded-xl p-2 text-center">
              <p className="text-base font-black text-white">{incidents.length}</p>
              <p className="text-[9px] text-white/30 mt-0.5 uppercase tracking-wide">Active</p>
            </div>
            <div className="surface rounded-xl p-2 text-center">
              <p className="text-base font-black" style={{ color: '#ff453a' }}>{criticalCount}</p>
              <p className="text-[9px] text-white/30 mt-0.5 uppercase tracking-wide">Urgent</p>
            </div>
            <div className="surface rounded-xl p-2 text-center">
              <p className="text-base font-black" style={{ color: '#30d158' }}>{verifiedCount}</p>
              <p className="text-[9px] text-white/30 mt-0.5 uppercase tracking-wide">Verified</p>
            </div>
          </div>

          {/* Feed header */}
          <div className="px-4 py-2.5 flex items-center justify-between flex-shrink-0">
            <h2 className="text-[12px] font-semibold text-white/60 uppercase tracking-widest">Live Feed</h2>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(255,149,0,0.12)', color: '#ff9500', border: '1px solid rgba(255,149,0,0.2)' }}
            >
              {filtered.length}
            </span>
          </div>

          {/* Incident list */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <IncidentFeed incidents={filtered} onSelect={setSelectedIncident} />
          </div>

          {/* Bottom tip */}
          {mounted && resolvedUser && (
            <div className="px-3 pb-3">
              <div
                className="rounded-2xl p-3 flex items-start gap-2.5"
                style={{ background: 'rgba(255,149,0,0.06)', border: '1px solid rgba(255,149,0,0.12)' }}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#ff9500] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-white/60 mb-0.5">See something?</p>
                  <p className="text-[10px] text-white/30 leading-relaxed">Tap the map to report it. Each report earns you reputation.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {reportCoords && (
        <IncidentReportForm
          lat={reportCoords.lat}
          lng={reportCoords.lng}
          onSuccess={() => { setReportCoords(null); fetchIncidents() }}
          onCancel={() => setReportCoords(null)}
        />
      )}

      {selectedIncident && (
        <IncidentDetail
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onVote={(id, patch) => { updateIncident(id, patch); setSelectedIncident({ ...selectedIncident, ...patch } as Incident) }}
        />
      )}
    </div>
  )
}
