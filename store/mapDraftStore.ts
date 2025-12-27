import type { GeoLocation } from '@types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type MapDraftState = {
  location: GeoLocation | null
  setLocation: (location: GeoLocation | null) => void
  updateLocation: (partial: Partial<GeoLocation>) => void
  clearLocation: () => void
}

export const useMapDraftStore = create(
  persist<MapDraftState>(
    (set) => ({
      location: null,

      setLocation: (location) => set({ location }),

      updateLocation: (partial) =>
        set((state) => ({
          location: state.location ? ({ ...state.location, ...partial } as GeoLocation) : null,
        })),

      clearLocation: () => set({ location: null }),
    }),
    {
      name: 'map-draft',
    }
  )
)
