'use client'

import { TipPromptDialog } from '@components'
import { Button, Card, IconButton } from '@components/ui'
import { Calendar, Plus, Trash } from '@components/ui/icons'
import { FEELING_TAGS } from '@lib/feelings'
import { useAnalysisDraftStore } from '@store'
import { ChargeType } from '@types'
import { cn } from '@utils/cn'
import { formatDateTime, normalizeNumberInput } from '@utils/format'
import { motion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Dynamically import Map component to prevent SSR issues
const Map = dynamic(() => import('@components/map'), { ssr: false })

type FeelingTag = (typeof FEELING_TAGS)[number]

export default function ResultPage() {
  const router = useRouter()
  const { location, receipt, setReceipt, file, place } = useAnalysisDraftStore()
  const [isEditMode, setIsEditMode] = useState(false)
  const [originalReceipt, setOriginalReceipt] = useState<typeof receipt | null>(null)
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingTag | null>(null)
  const [memo, setMemo] = useState('')
  const [showTipPrompt, setShowTipPrompt] = useState(false)
  const [tipPromptShown, setTipPromptShown] = useState(false)

  useEffect(() => {
    if (!receipt) {
      router.back()
    }
  }, [receipt, router])

  // Show tip prompt for restaurant/coffee categories without existing tip
  useEffect(() => {
    if (!receipt || tipPromptShown) return

    const tipCategories = ['restaurant', 'coffee', 'bar']
    const hasTipCategory = tipCategories.includes(receipt.category)
    const hasTip = receipt.charges?.some(
      (charge) => charge.type === ChargeType.TIP || charge.label?.toLowerCase().includes('tip')
    )

    if (hasTipCategory && !hasTip) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setShowTipPrompt(true)
        setTipPromptShown(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [receipt, tipPromptShown])

  const handleAddTip = (tipAmount: number) => {
    if (!receipt) return

    const tipCharge = {
      type: ChargeType.TIP,
      label: 'Tip',
      amount: tipAmount,
    }

    const updatedCharges = [...(receipt.charges || []), tipCharge]
    const itemsTotal =
      receipt.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0
    const chargesTotal = updatedCharges.reduce((sum, charge) => sum + charge.amount, 0)
    const newTotal = itemsTotal + chargesTotal

    setReceipt({ ...receipt, charges: updatedCharges, total: newTotal })
    setShowTipPrompt(false)
  }

  const handleEditItem = (index: number, field: 'name' | 'quantity' | 'price', value: string) => {
    if (!receipt?.items) return

    const updatedItems = [...receipt.items]
    if (field === 'quantity' || field === 'price') {
      const numValue = parseFloat(value) || 0
      updatedItems[index] = { ...updatedItems[index], [field]: numValue }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value }
    }

    // Recalculate total
    const itemsTotal = updatedItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
    const chargesTotal = receipt.charges?.reduce((sum, charge) => sum + charge.amount, 0) || 0
    const newTotal = itemsTotal + chargesTotal

    setReceipt({ ...receipt, items: updatedItems, total: newTotal })
  }

  const handleDeleteItem = (index: number) => {
    if (!receipt?.items) return
    const updatedItems = receipt.items.filter((_, idx) => idx !== index)

    // Recalculate total after deletion
    const itemsTotal = updatedItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
    const chargesTotal = receipt.charges?.reduce((sum, charge) => sum + charge.amount, 0) || 0
    const newTotal = itemsTotal + chargesTotal

    setReceipt({ ...receipt, items: updatedItems, total: newTotal })
  }

  const handleAddItem = () => {
    if (!receipt?.items) return

    const newItem = {
      name: '',
      quantity: 1,
      price: 0,
    }

    const updatedItems = [...receipt.items, newItem]
    setReceipt({ ...receipt, items: updatedItems })
  }

  const handleEditCharge = (index: number, field: 'type' | 'amount', value: string) => {
    if (!receipt?.charges) return

    const updatedCharges = [...receipt.charges]
    if (field === 'amount') {
      const numValue = parseFloat(value) || 0
      updatedCharges[index] = { ...updatedCharges[index], [field]: numValue }
    } else {
      updatedCharges[index] = { ...updatedCharges[index], [field]: value as ChargeType }
    }

    // Recalculate total
    const itemsTotal =
      receipt.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0
    const chargesTotal = updatedCharges.reduce((sum, charge) => sum + charge.amount, 0)
    const newTotal = itemsTotal + chargesTotal

    setReceipt({ ...receipt, charges: updatedCharges, total: newTotal })
  }

  const handleDeleteCharge = (index: number) => {
    if (!receipt?.charges) return
    const updatedCharges = receipt.charges.filter((_, idx) => idx !== index)

    // Recalculate total after deletion
    const itemsTotal =
      receipt.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0
    const chargesTotal = updatedCharges.reduce((sum, charge) => sum + charge.amount, 0)
    const newTotal = itemsTotal + chargesTotal

    setReceipt({ ...receipt, charges: updatedCharges, total: newTotal })
  }

  const handleAddCharge = () => {
    const newCharge = {
      type: ChargeType.TAX,
      label: '',
      amount: 0,
    }

    const updatedCharges = [...(receipt?.charges || []), newCharge]
    setReceipt({ ...receipt!, charges: updatedCharges })
  }

  const handleSave = async () => {
    try {
      if (isEditMode) {
        setIsEditMode(false)
        setOriginalReceipt(null)
        return
      }

      if (!receipt || !place) return
      if (!file) {
        alert('No image file found. Please scan or upload again.')
        return
      }

      const receiptPayload = {
        ...receipt,
        feeling: selectedFeeling,
        memo: memo.trim() || null,
        items: receipt.items?.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        charges: receipt.charges?.map((charge) => ({
          label: charge.label,
          amount: charge.amount,
        })),
      }

      const formData = new FormData()
      formData.append('image', file)
      formData.append('receipt', JSON.stringify(receiptPayload))
      formData.append('place', JSON.stringify(place))
      console.log(place, '<--- place data being sent to backend')

      const response = await fetch('/api/receipts', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save receipt')
      }

      setIsEditMode(false)
      setOriginalReceipt(null)
      alert('Receipt has been saved!')
      router.push('/')
    } catch (error) {
      console.error('Error saving receipt:', error)
      // alert(error instanceof Error ? error.message : 'An error occurred while saving.')
    }
  }

  const handleEdit = () => {
    // 원본 데이터 백업
    setOriginalReceipt(receipt)
    setIsEditMode(true)
  }

  const handleCancel = () => {
    // 원본 데이터로 복구
    if (originalReceipt) {
      setReceipt(originalReceipt)
    }
    setOriginalReceipt(null)
    setIsEditMode(false)
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
      <Card className="h-64">
        {location ? (
          <Map location={location} zoom={16} className="h-64 w-full" />
        ) : (
          <div className="h-64 w-full flex flex-col items-center justify-center bg-gray-100 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-3 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-sm font-medium">위치를 불러오지 못했습니다</p>
            <p className="text-xs mt-1">영수증에 주소 정보가 없습니다</p>
          </div>
        )}
      </Card>

      {/* Receipt Card */}
      <Card className="p-6 space-y-4">
        {/* Vendor Info */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">{receipt.vendor}</h2>
          {receipt.address && <p className="text-sm text-gray-600 mt-1">{receipt.address}</p>}
        </div>

        {/* Date & Time */}
        <div className="flex gap-4 text-sm text-gray-600">
          {receipt.purchased_at && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDateTime(receipt.purchased_at)}</span>
            </div>
          )}
        </div>

        {/* Items */}
        {receipt.items && receipt.items.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Items</h3>
              {isEditMode && (
                <Button
                  variant="ghost"
                  onClick={handleAddItem}
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {receipt.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-800">
                  {isEditMode ? (
                    <>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleEditItem(idx, 'quantity', normalizeNumberInput(e.target.value))
                        }
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
                        value={item.price}
                        onChange={(e) =>
                          handleEditItem(idx, 'price', normalizeNumberInput(e.target.value))
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                        step="0.01"
                        min="0"
                      />
                      <IconButton
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 shadow-none"
                        aria-label="Delete item"
                      >
                        <Trash className="w-4 h-4" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-gray-800">
                        {item.quantity > 1 ? `${item.quantity}x ` : ''}
                        {item.name}
                      </span>
                      <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charges */}
        {/* TODO: show details ex PST, GST */}
        {((receipt.charges && receipt.charges.length > 0) || isEditMode) && (
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Charges</h3>
              {isEditMode && (
                <Button
                  variant="ghost"
                  onClick={handleAddCharge}
                  className="text-xs font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Charge
                </Button>
              )}
            </div>
            {receipt.charges?.map((charge, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-800">
                {isEditMode ? (
                  <>
                    <select
                      value={charge.type}
                      onChange={(e) => handleEditCharge(idx, 'type', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded capitalize"
                    >
                      {Object.values(ChargeType).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={charge.amount}
                      onChange={(e) =>
                        handleEditCharge(idx, 'amount', normalizeNumberInput(e.target.value))
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                      step="0.01"
                      min="0"
                    />
                    <IconButton
                      onClick={() => handleDeleteCharge(idx)}
                      className="p-1 text-red-500 hover:bg-red-50 shadow-none"
                      aria-label="Delete charge"
                    >
                      <Trash className="w-4 h-4" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-gray-600 capitalize">{charge.type}</span>
                    <span className="text-gray-900">${charge.amount.toFixed(2)}</span>
                  </>
                )}
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
      </Card>

      {/* Feeling Tags */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">How did this purchase feel?</h3>
        <div className="flex flex-wrap gap-2">
          {FEELING_TAGS.map((tag) => (
            <Button
              key={tag}
              variant="tag"
              size="sm"
              selected={selectedFeeling === tag}
              onClick={() => setSelectedFeeling(selectedFeeling === tag ? null : tag)}
            >
              {tag}
            </Button>
          ))}
        </div>

        {/* Memo */}
        <div className="pt-2">
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Add a note about this purchase..."
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
        </div>
      </Card>

      {/* Bottom Actions */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={isEditMode ? handleCancel : handleEdit}
          className={cn(
            'w-full py-3 bg-white rounded-2xl shadow-sm text-gray-800 font-medium',
            isEditMode && 'border border-gray-200'
          )}
        >
          {isEditMode ? 'Cancel' : 'Edit'}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full py-3 bg-blue-600 text-white rounded-2xl shadow-sm font-medium"
        >
          {isEditMode ? 'Apply' : 'Save'}
        </motion.button>
      </div>

      {/* Tip Prompt Dialog */}
      <TipPromptDialog
        isOpen={showTipPrompt}
        onClose={() => setShowTipPrompt(false)}
        onSave={handleAddTip}
        subtotal={receipt?.subtotal}
      />
    </div>
  )
}
