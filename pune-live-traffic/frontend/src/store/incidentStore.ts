import { create } from 'zustand'
import { Incident } from '@/types/incident'

interface IncidentStore {
  incidents: Incident[]
  selectedIncident: Incident | null
  filterType: string | null
  setIncidents: (incidents: Incident[]) => void
  addIncident: (incident: Incident) => void
  removeIncident: (id: string) => void
  updateIncident: (id: string, patch: Partial<Incident>) => void
  setSelectedIncident: (incident: Incident | null) => void
  setFilterType: (type: string | null) => void
}

export const useIncidentStore = create<IncidentStore>((set) => ({
  incidents: [],
  selectedIncident: null,
  filterType: null,
  setIncidents: (incidents) => set({ incidents }),
  addIncident: (incident) => set((s) => ({ incidents: [incident, ...s.incidents] })),
  removeIncident: (id) => set((s) => ({ incidents: s.incidents.filter((i) => i.id !== id) })),
  updateIncident: (id, patch) =>
    set((s) => ({ incidents: s.incidents.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
  setSelectedIncident: (incident) => set({ selectedIncident: incident }),
  setFilterType: (type) => set({ filterType: type }),
}))
