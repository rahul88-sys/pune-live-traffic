'use client'
import { useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { useIncidentStore } from '@/store/incidentStore'
import { PUNE_CENTER } from '@/lib/constants'

export function useIncidents(lat = PUNE_CENTER[0], lng = PUNE_CENTER[1], radius = 15) {
  const { setIncidents, addIncident, removeIncident, updateIncident } = useIncidentStore()

  const fetchIncidents = useCallback(async () => {
    try {
      const { data } = await api.get('/incidents', { params: { lat, lng, radius } })
      if (data.success) setIncidents(data.incidents)
    } catch (err) {
      console.error('Failed to fetch incidents', err)
    }
  }, [lat, lng, radius, setIncidents])

  useEffect(() => {
    fetchIncidents()
    const interval = setInterval(fetchIncidents, 60_000)
    return () => clearInterval(interval)
  }, [fetchIncidents])

  return { fetchIncidents, addIncident, removeIncident, updateIncident }
}
