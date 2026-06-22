'use client'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Incident } from '@/types/incident'
import { PUNE_CENTER, DEFAULT_ZOOM, INCIDENT_EMOJIS, INCIDENT_MARKER_COLORS } from '@/lib/constants'

interface MapContainerProps {
  incidents: Incident[]
  onMapClick: (lat: number, lng: number) => void
  onIncidentClick: (incident: Incident) => void
}

function createIncidentIcon(type: string) {
  const color = INCIDENT_MARKER_COLORS[type] || '#6B7280'
  const emoji = INCIDENT_EMOJIS[type] || '⚠️'
  return L.divIcon({
    className: '',
    html: `
      <div style="
        position:relative;
        width:40px;height:40px;
      ">
        <div style="
          position:absolute;inset:0;
          background:${color};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:2px solid rgba(255,255,255,0.9);
          box-shadow:0 4px 12px rgba(0,0,0,0.4), 0 0 0 4px ${color}30;
        "></div>
        <span style="
          position:absolute;inset:0;
          display:flex;align-items:center;justify-content:center;
          font-size:17px;
          transform:translateY(-3px);
          filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5));
        ">${emoji}</span>
      </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -44],
  })
}

export default function MapContainer({ incidents, onMapClick, onIncidentClick }: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: PUNE_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    })

    // Dark CartoDB tiles — matches the black UI
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }
    ).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    map.on('click', (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [onMapClick])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const currentIds = new Set(incidents.map((i) => i.id))
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) { marker.remove(); markersRef.current.delete(id) }
    })

    incidents.forEach((incident) => {
      if (markersRef.current.has(incident.id)) return
      const marker = L.marker([incident.lat, incident.lng], { icon: createIncidentIcon(incident.type) })
        .addTo(map)
        .on('click', () => onIncidentClick(incident))

      marker.bindTooltip(
        `<div style="background:#1c1c1e;color:#f5f5f7;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:8px 12px;font-size:13px;font-weight:500;letter-spacing:-0.01em;">
          ${INCIDENT_EMOJIS[incident.type]} ${incident.locationName || incident.type}
          ${incident.isVerified ? '<br/><span style="color:#30d158;font-size:11px;">✓ Verified</span>' : `<br/><span style="color:rgba(255,255,255,0.4);font-size:11px;">👍 ${incident.upvoteCount} confirmations</span>`}
        </div>`,
        { permanent: false, direction: 'top', className: 'leaflet-tooltip-custom', opacity: 1 }
      )
      markersRef.current.set(incident.id, marker)
    })
  }, [incidents, onIncidentClick])

  return <div ref={containerRef} className="w-full h-full" />
}
