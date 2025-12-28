import { create } from 'zustand'

type ReceiptImageState = {
  imageUrl: string | null
  setImageUrl: (url: string | null) => void
  clearImageUrl: () => void
}

export const useReceiptImageStore = create<ReceiptImageState>((set, get) => ({
  imageUrl: null,

  setImageUrl: (url) => {
    // release previous ObjectURL memory
    const prev = get().imageUrl
    if (prev && prev.startsWith('blob:')) {
      URL.revokeObjectURL(prev)
    }
    set({ imageUrl: url })
  },

  clearImageUrl: () => {
    const url = get().imageUrl
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
    set({ imageUrl: null })
  },
}))
