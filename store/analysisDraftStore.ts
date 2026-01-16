import type { GeoLocation, ParsedReceipt } from '@types'
import { create } from 'zustand'

function safeRevokeObjectUrl(url: string | null) {
  if (!url) return
  if (url.startsWith('blob:')) URL.revokeObjectURL(url)
}

type AnalysisDraftState = {
  file: File | null
  receipt: ParsedReceipt | null
  location: GeoLocation | null
  previewUrl: string | null
  draftPath: string | null
  imageFile: File | null

  // setters
  setFile: (file: File | null) => void
  setReceipt: (draft: ParsedReceipt) => void
  setLocation: (location: GeoLocation | null) => void
  setPreviewUrl: (url: string) => void
  setDraftPath: (path: string | null) => void

  updateReceipt: (partial: Partial<ParsedReceipt>) => void

  // Helpers
  setPreviewFromFile: (file: File) => void
  clearPreview: () => void
  reset: () => void
}

export const useAnalysisDraftStore = create<AnalysisDraftState>((set, get) => ({
  file: null,
  receipt: null,
  location: null,
  previewUrl: null,
  draftPath: null,
  imageFile: null,

  setFile: (file) => set({ file }),
  setReceipt: (receipt) => set({ receipt }),
  setLocation: (location) => set({ location }),
  setPreviewUrl: (url) =>
    set((state) => {
      // Prevent leaking blob URLs
      safeRevokeObjectUrl(state.previewUrl)
      return { previewUrl: url }
    }),
  setDraftPath: (draftPath) => set({ draftPath }),

  updateReceipt: (partial) =>
    set((state) => ({
      receipt: state.receipt ? ({ ...state.receipt, ...partial } as ParsedReceipt) : null,
    })),

  setPreviewFromFile: (file) => {
    const url = URL.createObjectURL(file)
    get().setPreviewUrl(url)
  },

  clearPreview: () => {
    const url = get().previewUrl
    safeRevokeObjectUrl(url)
    set({ previewUrl: null })
  },

  reset: () => {
    const { previewUrl } = get()
    safeRevokeObjectUrl(previewUrl)
    set({
      file: null,
      receipt: null,
      location: null,
      previewUrl: null,
      draftPath: null,
      imageFile: null,
    })
  },
}))
