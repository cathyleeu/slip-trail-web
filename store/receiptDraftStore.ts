import type { ParsedReceipt } from '@types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type DraftState = {
  draft: ParsedReceipt | null
  setDraft: (draft: ParsedReceipt) => void
  updateDraft: (partial: Partial<ParsedReceipt>) => void
  clearDraft: () => void
}

export const useReceiptDraftStore = create(
  persist<DraftState>(
    (set) => ({
      draft: null,

      setDraft: (draft) => set({ draft }),

      updateDraft: (partial) =>
        set((state) => ({
          draft: state.draft ? ({ ...state.draft, ...partial } as ParsedReceipt) : null,
        })),

      clearDraft: () => set({ draft: null }),
    }),
    {
      name: 'receipt-draft',
    }
  )
)
