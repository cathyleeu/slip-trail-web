'use client'

import { BaseDialog } from '@components/ui'
import Button from '@components/ui/Button'
import { useState } from 'react'

type TipPromptDialogProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (tipAmount: number) => void
  subtotal?: number | null
}

const TIP_PERCENTAGES = [15, 18, 20, 25]

export function TipPromptDialog({ isOpen, onClose, onSave, subtotal }: TipPromptDialogProps) {
  const [tipAmount, setTipAmount] = useState('')
  const [selectedPct, setSelectedPct] = useState<number | null>(null)

  const handlePctClick = (pct: number) => {
    setSelectedPct(pct)
    if (subtotal) setTipAmount(((subtotal * pct) / 100).toFixed(2))
  }

  const handleInputChange = (value: string) => {
    setTipAmount(value)
    setSelectedPct(null)
  }

  const handleSave = () => {
    const amount = parseFloat(tipAmount)
    if (!isNaN(amount) && amount > 0) {
      onSave(amount)
      setTipAmount('')
      setSelectedPct(null)
    }
  }

  const handleClose = () => {
    setTipAmount('')
    setSelectedPct(null)
    onClose()
  }

  return (
    <BaseDialog isOpen={isOpen} onClose={handleClose}>
      <div className="bg-surface rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <h2 className="text-xl font-bold text-fg">Add a tip?</h2>
            <p className="text-sm text-fg-muted mt-1">
              Would you like to add a tip to this receipt?
            </p>
          </div>

          {subtotal && subtotal > 0 && (
            <div className="flex gap-2 justify-center">
              {TIP_PERCENTAGES.map((pct) => (
                <Button
                  key={pct}
                  size="sm"
                  variant={selectedPct === pct ? 'filled' : 'ghost'}
                  onClick={() => handlePctClick(pct)}
                  className="px-3 py-2"
                >
                  {pct}%
                </Button>
              ))}
            </div>
          )}

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle text-lg">
              $
            </span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={tipAmount}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full pl-8 pr-4 py-3 text-center text-2xl font-semibold border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-fg"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose} className="flex-1 py-3">
              Skip
            </Button>
            <Button
              onClick={handleSave}
              disabled={!tipAmount || parseFloat(tipAmount) <= 0}
              className="flex-1 py-3"
            >
              Add Tip
            </Button>
          </div>
        </div>
      </div>
    </BaseDialog>
  )
}
