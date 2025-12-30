'use client'

import { useMapDraftStore, useReceiptDraftStore } from '@store'
import { motion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Dynamically import Map component to prevent SSR issues
const Map = dynamic(() => import('@components/map'), { ssr: false })

export default function ResultPage() {
  const router = useRouter()
  const { draft: receipt, setDraft } = useReceiptDraftStore()
  const { location } = useMapDraftStore()
  const [isEditMode, setIsEditMode] = useState(false)

  // TODO: integrate Edit and Save functionality later
  // TODO: add tip section

  useEffect(() => {
    if (!receipt) {
      router.push('/camera')
    }
  }, [receipt, router])

  const handleEditItem = (index: number, field: 'name' | 'qty' | 'unit_price', value: string) => {
    if (!receipt?.items) return

    const updatedItems = [...receipt.items]
    if (field === 'qty' || field === 'unit_price') {
      const numValue = parseFloat(value) || 0
      updatedItems[index] = { ...updatedItems[index], [field]: numValue }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value }
    }

    setDraft({ ...receipt, items: updatedItems })
  }

  const handleDeleteItem = (index: number) => {
    if (!receipt?.items) return
    const updatedItems = receipt.items.filter((_, idx) => idx !== index)
    setDraft({ ...receipt, items: updatedItems })
  }

  const handleSave = () => {
    setIsEditMode(false)
    // TODO: API call to save changes
    alert('Changes saved!')
  }

  if (!receipt) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Failed to load receipt details</p>
          <button
            onClick={() => router.push('/camera')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4 space-y-4 flex-1 flex flex-col">
      {/* Map */}
      {location && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <Map location={location} zoom={16} className="h-64 w-full" />
        </motion.div>
      )}

      {/* Receipt Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-4"
      >
        {/* Vendor Info */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">{receipt.vendor}</h2>
          {receipt.address && <p className="text-sm text-gray-600 mt-1">{receipt.address}</p>}
        </div>

        {/* Date & Time */}
        <div className="flex gap-4 text-sm text-gray-600">
          {receipt.purchased_at && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{receipt.purchased_at}</span>
            </div>
          )}
        </div>

        {/* Items */}
        {receipt.items && receipt.items.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Items</h3>
            <div className="space-y-2">
              {receipt.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {isEditMode ? (
                    <>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleEditItem(idx, 'qty', e.target.value)}
                        className="w-12 px-2 py-1 border border-gray-300 rounded text-center"
                        min="1"
                      />
                      <span className="text-gray-400">x</span>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleEditItem(idx, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded"
                      />
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleEditItem(idx, 'unit_price', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                        step="0.01"
                        min="0"
                      />
                      <button
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-gray-800">
                        {item.qty > 1 ? `${item.qty}x ` : ''}
                        {item.name}
                      </span>
                      <span className="font-medium text-gray-900">
                        ${item.unit_price.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charges */}
        {/* TODO: show details ex PST, GST */}
        {receipt.charges && receipt.charges.length > 0 && (
          <div className="border-t border-gray-100 pt-3 space-y-2">
            {receipt.charges.map((charge, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600 capitalize">{charge.type}</span>
                <span className="text-gray-900">${charge.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-blue-600">
            ${receipt.total ? receipt.total.toFixed(2) : '0.00'}
          </span>
        </div>
      </motion.div>

      {/* Bottom Actions */}
      <div className="grid grid-cols-2 gap-4">
        {isEditMode ? (
          <>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditMode(false)}
              className="w-full py-3 bg-white rounded-2xl shadow-sm text-gray-800 font-medium border border-gray-200"
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="w-full py-3 bg-blue-600 text-white rounded-2xl shadow-sm font-medium"
            >
              Save
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditMode(true)}
              className="w-full py-3 bg-white rounded-2xl shadow-sm text-gray-800 font-medium"
            >
              Edit
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => alert('Save functionality coming soon')}
              className="w-full py-3 bg-blue-600 text-white rounded-2xl shadow-sm font-medium"
            >
              Save
            </motion.button>
          </>
        )}
      </div>
    </div>
  )
}
