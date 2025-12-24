import type { ParsedReceipt } from '@types'
import { create } from 'zustand'

type DraftState = {
  draft: ParsedReceipt | null

  setDraft: (draft: ParsedReceipt) => void
  updateDraft: (partial: Partial<ParsedReceipt>) => void
  clearDraft: () => void
}

export const useReceiptDraftStore = create<DraftState>((set) => ({
  draft: null,

  setDraft: (draft) => set({ draft }),

  updateDraft: (partial) =>
    set((state) => ({
      draft: state.draft ? ({ ...state.draft, ...partial } as ParsedReceipt) : null,
    })),

  clearDraft: () => set({ draft: null }),
}))
