'use client'

import { Button } from '@components/ui'
import { AnimatePresence, motion } from 'motion/react'
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
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null)

  const handlePercentageClick = (percentage: number) => {
    setSelectedPercentage(percentage)
    if (subtotal) {
      const calculated = (subtotal * percentage) / 100
      setTipAmount(calculated.toFixed(2))
    }
  }

  const handleInputChange = (value: string) => {
    setTipAmount(value)
    setSelectedPercentage(null) // Clear percentage selection when manually entering
  }

  const handleSave = () => {
    const amount = parseFloat(tipAmount)
    if (!isNaN(amount) && amount > 0) {
      onSave(amount)
      setTipAmount('')
      setSelectedPercentage(null)
    }
  }

  const handleCancel = () => {
    setTipAmount('')
    setSelectedPercentage(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <h2 className="text-xl font-bold text-gray-900">Add a tip?</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Would you like to add a tip to this receipt?
                </p>
              </div>

              {/* Quick percentage buttons */}
              {subtotal && subtotal > 0 && (
                <div className="flex gap-2 justify-center">
                  {TIP_PERCENTAGES.map((pct) => (
                    <button
                      key={pct}
                      onClick={() => handlePercentageClick(pct)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedPercentage === pct
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              )}

              {/* Tip input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  $
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={tipAmount}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 text-center text-2xl font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button variant="ghost" onClick={handleCancel} className="flex-1 py-3">
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
