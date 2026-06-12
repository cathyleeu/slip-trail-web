'use client'

import { LocationSearch, TipPromptDialog } from '@components'
import { Button, Card, IconButton, Toast, useToast } from '@components/ui'
import { Calendar, Plus, Trash } from '@components/ui/icons'
import { getCategoryEmoji, getCategoryLabel } from '@lib/categories'
import { RECEIPT_CATEGORIES } from '@lib/constants'
import { FEELING_TAGS } from '@lib/feelings'
import { useAnalysisDraftStore } from '@store'
import { ChargeType, type ParsedReceipt, type ReceiptCharge, type ReceiptItem } from '@types'
import { cn } from '@utils/cn'
import { formatDateTime, normalizeNumberInput } from '@utils/format'
import { motion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const Map = dynamic(() => import('@components/map'), { ssr: false })

type FeelingTag = (typeof FEELING_TAGS)[number]

function toDatetimeLocalValue(iso?: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

function fromDatetimeLocalValue(value: string): string {
  return value ? `${value}:00.000Z` : ''
}

export default function ResultPage() {
  const router = useRouter()
  const { location, locationStatus, receipt, setReceipt, setLocation, setPlace, file, place, reset } =
    useAnalysisDraftStore()
  const [isEditMode, setIsEditMode] = useState(false)
  const [originalReceipt, setOriginalReceipt] = useState<typeof receipt | null>(null)
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingTag | null>(null)
  const [memo, setMemo] = useState('')
  const [showTipPrompt, setShowTipPrompt] = useState(false)
  const [tipPromptShown, setTipPromptShown] = useState(false)
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const { toastState, showToast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const hasSavedRef = useRef(false)

  useEffect(() => {
    if (!receipt && !hasSavedRef.current) router.back()
  }, [receipt, router])

  useEffect(() => {
    if (!receipt || tipPromptShown) return
    const tipCategories = ['restaurant', 'coffee', 'bar']
    const hasTipCategory = tipCategories.includes(receipt.category)
    const hasTip = receipt.charges?.some(
      (charge: ReceiptCharge) => charge.type === ChargeType.TIP || charge.label?.toLowerCase().includes('tip')
    )
    if (hasTipCategory && !hasTip) {
      const timer = setTimeout(() => {
        setShowTipPrompt(true)
        setTipPromptShown(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [receipt, tipPromptShown])

  const handleAddTip = (tipAmount: number) => {
    if (!receipt) return
    const tipCharge = { type: ChargeType.TIP, label: 'Tip', amount: tipAmount }
    const updatedCharges = [...(receipt.charges || []), tipCharge]
    const itemsTotal = receipt.items?.reduce((sum: number, item: ReceiptItem) => sum + item.quantity * item.price, 0) || 0
    const chargesTotal = updatedCharges.reduce((sum: number, charge: ReceiptCharge) => sum + charge.amount, 0)
    setReceipt({ ...receipt, charges: updatedCharges, total: itemsTotal + chargesTotal })
    setShowTipPrompt(false)
  }

  const handleEditItem = (index: number, field: 'name' | 'quantity' | 'price', value: string) => {
    if (!receipt?.items) return
    const updatedItems = [...receipt.items]
    if (field === 'quantity' || field === 'price') {
      updatedItems[index] = { ...updatedItems[index], [field]: parseFloat(value) || 0 }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value }
    }
    const itemsTotal = updatedItems.reduce((sum: number, item: ReceiptItem) => sum + item.quantity * item.price, 0)
    const chargesTotal = receipt.charges?.reduce((sum: number, charge: ReceiptCharge) => sum + charge.amount, 0) || 0
    setReceipt({ ...receipt, items: updatedItems, total: itemsTotal + chargesTotal })
  }

  const handleDeleteItem = (index: number) => {
    if (!receipt?.items) return
    const updatedItems = receipt.items.filter((_: ReceiptItem, idx: number) => idx !== index)
    const itemsTotal = updatedItems.reduce((sum: number, item: ReceiptItem) => sum + item.quantity * item.price, 0)
    const chargesTotal = receipt.charges?.reduce((sum: number, charge: ReceiptCharge) => sum + charge.amount, 0) || 0
    setReceipt({ ...receipt, items: updatedItems, total: itemsTotal + chargesTotal })
  }

  const handleEditVendor = (value: string) => {
    if (!receipt) return
    setReceipt({ ...receipt, vendor: value })
  }

  const handleEditCategory = (value: string) => {
    if (!receipt) return
    setReceipt({ ...receipt, category: value as ParsedReceipt['category'] })
  }

  const handleEditPurchasedAt = (value: string) => {
    if (!receipt) return
    setReceipt({ ...receipt, purchased_at: fromDatetimeLocalValue(value) })
  }

  const handleAddItem = () => {
    if (!receipt?.items) return
    const updatedItems = [...receipt.items, { name: '', quantity: 1, price: 0 }]
    setReceipt({ ...receipt, items: updatedItems })
  }

  const handleEditCharge = (index: number, field: 'type' | 'amount', value: string) => {
    if (!receipt?.charges) return
    const updatedCharges = [...receipt.charges]
    if (field === 'amount') {
      updatedCharges[index] = { ...updatedCharges[index], [field]: parseFloat(value) || 0 }
    } else {
      updatedCharges[index] = { ...updatedCharges[index], [field]: value as ChargeType }
    }
    const itemsTotal = receipt.items?.reduce((sum: number, item: ReceiptItem) => sum + item.quantity * item.price, 0) || 0
    const chargesTotal = updatedCharges.reduce((sum: number, charge: ReceiptCharge) => sum + charge.amount, 0)
    setReceipt({ ...receipt, charges: updatedCharges, total: itemsTotal + chargesTotal })
  }

  const handleDeleteCharge = (index: number) => {
    if (!receipt?.charges) return
    const updatedCharges = receipt.charges.filter((_: ReceiptCharge, idx: number) => idx !== index)
    const itemsTotal = receipt.items?.reduce((sum: number, item: ReceiptItem) => sum + item.quantity * item.price, 0) || 0
    const chargesTotal = updatedCharges.reduce((sum: number, charge: ReceiptCharge) => sum + charge.amount, 0)
    setReceipt({ ...receipt, charges: updatedCharges, total: itemsTotal + chargesTotal })
  }

  const handleAddCharge = () => {
    const updatedCharges = [...(receipt?.charges || []), { type: ChargeType.TAX, label: '', amount: 0 }]
    setReceipt({ ...receipt!, charges: updatedCharges })
  }

  const handleSave = async () => {
    if (isEditMode) {
      setIsEditMode(false)
      setOriginalReceipt(null)
      return
    }
    if (!receipt) return
    if (!file) {
      showToast('✗ Save failed — try again', 'error')
      return
    }

    try {
      setIsSaving(true)
      const receiptPayload = {
        ...receipt,
        feeling: selectedFeeling,
        memo: memo.trim() || null,
        items: receipt.items?.map(({ name, quantity, price }: ReceiptItem) => ({ name, quantity, price })),
        charges: receipt.charges?.map(({ label, amount }: ReceiptCharge) => ({ label, amount })),
      }

      const formData = new FormData()
      formData.append('image', file)
      formData.append('receipt', JSON.stringify(receiptPayload))
      if (place) formData.append('place', JSON.stringify(place))

      const response = await fetch('/api/receipts', { method: 'POST', body: formData })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to save receipt')

      setIsEditMode(false)
      setOriginalReceipt(null)
      showToast('✓ Receipt saved to your trail', 'success')
      hasSavedRef.current = true
      reset()
      setTimeout(() => router.push('/'), 1200)
    } catch {
      showToast('✗ Save failed — try again', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = () => {
    setOriginalReceipt(receipt)
    setIsEditMode(true)
  }

  const handleCancel = () => {
    if (originalReceipt) setReceipt(originalReceipt)
    setOriginalReceipt(null)
    setIsEditMode(false)
  }

  if (!receipt) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <div className="text-center">
          <p className="text-zinc-500 text-sm">Failed to load receipt details</p>
          <button
            onClick={() => router.push('/camera')}
            className="mt-4 px-6 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const locationMissing = !location && locationStatus !== 'found'
  const locationErrorMsg =
    locationStatus === 'no_address'
      ? 'No address found on receipt'
      : locationStatus === 'not_found'
        ? 'Address not found on map'
        : 'Location lookup failed'

  return (
    <>
      <div className="h-full overflow-auto p-4 space-y-4 flex-1 flex flex-col pb-6">
        {/* Map / Location card */}
        <Card className="h-64 overflow-hidden">
          {location ? (
            <Map
              location={location}
              zoom={16}
              className="h-64 w-full"
              markerEmoji={getCategoryEmoji(receipt.category)}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-64 w-full flex flex-col items-center justify-center bg-zinc-50 gap-3 px-6 text-center"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">
                📍
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700">{locationErrorMsg}</p>
                <p className="text-xs text-zinc-400 mt-0.5">Add it manually to pin this stop on your trail</p>
              </div>
              <button
                onClick={() => setShowLocationSearch(true)}
                className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all"
              >
                Search address
              </button>
            </motion.div>
          )}
        </Card>

        {/* Location found but user wants to change */}
        {location && (
          <button
            onClick={() => setShowLocationSearch(true)}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-600 transition-colors -mt-2 px-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            Change location
          </button>
        )}

        {/* Receipt Card */}
        <Card className="p-6 space-y-4">
          <div>
            {isEditMode ? (
              <input
                type="text"
                value={receipt.vendor}
                onChange={(e) => handleEditVendor(e.target.value)}
                className="w-full text-xl font-bold text-zinc-900 px-2 py-1 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            ) : (
              <h2 className="text-xl font-bold text-zinc-900">{receipt.vendor}</h2>
            )}
            {receipt.address && <p className="text-sm text-zinc-500 mt-1">{receipt.address}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            {isEditMode ? (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <input
                  type="datetime-local"
                  value={toDatetimeLocalValue(receipt.purchased_at)}
                  onChange={(e) => handleEditPurchasedAt(e.target.value)}
                  className="px-2 py-1 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            ) : (
              receipt.purchased_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDateTime(receipt.purchased_at)}</span>
                </div>
              )
            )}

            {isEditMode ? (
              <select
                value={receipt.category}
                onChange={(e) => handleEditCategory(e.target.value)}
                className="px-2 py-1 border border-zinc-200 rounded-lg capitalize focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                {RECEIPT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryEmoji(cat)} {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <span>{getCategoryEmoji(receipt.category)}</span>
                <span>{getCategoryLabel(receipt.category)}</span>
              </div>
            )}
          </div>

          {/* Items */}
          {receipt.items && receipt.items.length > 0 && (
            <div className="border-t border-zinc-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Items</h3>
                {isEditMode && (
                  <Button variant="ghost" onClick={handleAddItem} className="text-xs font-medium flex items-center gap-1">
                    <Plus className="w-4 h-4" />Add
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-zinc-800">
                    {isEditMode ? (
                      <>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleEditItem(idx, 'quantity', normalizeNumberInput(e.target.value))}
                          className="w-12 px-2 py-1 border border-zinc-200 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          min="1"
                        />
                        <span className="text-zinc-300">×</span>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleEditItem(idx, 'name', e.target.value)}
                          className="flex-1 px-2 py-1 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400"
                        />
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleEditItem(idx, 'price', normalizeNumberInput(e.target.value))}
                          className="w-20 px-2 py-1 border border-zinc-200 rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          step="0.01"
                          min="0"
                        />
                        <IconButton onClick={() => handleDeleteItem(idx)} className="p-1 text-rose-400 hover:bg-rose-50 shadow-none" aria-label="Delete item">
                          <Trash className="w-4 h-4" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-zinc-800">
                          {item.quantity > 1 ? `${item.quantity}× ` : ''}{item.name}
                        </span>
                        <span className="font-semibold text-zinc-900">${item.price.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charges */}
          {((receipt.charges && receipt.charges.length > 0) || isEditMode) && (
            <div className="border-t border-zinc-100 pt-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Charges</h3>
                {isEditMode && (
                  <Button variant="ghost" onClick={handleAddCharge} className="text-xs font-medium flex items-center gap-1">
                    <Plus className="w-4 h-4" />Add
                  </Button>
                )}
              </div>
              {receipt.charges?.map((charge, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-zinc-800">
                  {isEditMode ? (
                    <>
                      <select
                        value={charge.type}
                        onChange={(e) => handleEditCharge(idx, 'type', e.target.value)}
                        className="flex-1 px-2 py-1 border border-zinc-200 rounded-lg capitalize focus:outline-none focus:ring-1 focus:ring-zinc-400"
                      >
                        {Object.values(ChargeType).map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={charge.amount}
                        onChange={(e) => handleEditCharge(idx, 'amount', normalizeNumberInput(e.target.value))}
                        className="w-20 px-2 py-1 border border-zinc-200 rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-zinc-400"
                        step="0.01"
                        min="0"
                      />
                      <IconButton onClick={() => handleDeleteCharge(idx)} className="p-1 text-rose-400 hover:bg-rose-50 shadow-none" aria-label="Delete charge">
                        <Trash className="w-4 h-4" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-zinc-500 capitalize">{charge.type}</span>
                      <span className="text-zinc-900">${charge.amount.toFixed(2)}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="border-t border-zinc-100 pt-4 flex justify-between items-center">
            <span className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">Total</span>
            <span className="text-3xl font-black text-zinc-900 tabular-nums tracking-tight">
              ${receipt.total ? receipt.total.toFixed(2) : '0.00'}
            </span>
          </div>
        </Card>

        {/* Feeling Tags */}
        <Card className="p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-1">Feeling</p>
            <h3 className="text-base font-bold text-zinc-900">How did this purchase feel?</h3>
          </div>
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

          <div className="pt-1">
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Add a note about this purchase..."
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm text-zinc-700 placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
              rows={2}
            />
          </div>
        </Card>

        {/* Bottom Actions */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={isEditMode ? handleCancel : handleEdit}
            className={cn(
              'w-full py-4 bg-white rounded-2xl shadow-sm text-zinc-800 font-semibold text-sm',
              isEditMode && 'border border-zinc-200'
            )}
          >
            {isEditMode ? 'Cancel' : 'Edit'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-semibold text-sm disabled:opacity-60 active:scale-[0.98] transition-all"
          >
            {isSaving ? 'Saving…' : isEditMode ? 'Apply' : 'Save to trail'}
          </motion.button>
        </div>
      </div>

      <Toast
        visible={!!toastState}
        message={toastState?.message ?? ''}
        type={toastState?.type ?? 'success'}
      />

      {/* Location search bottom sheet */}
      <LocationSearch
        isOpen={showLocationSearch}
        onClose={() => setShowLocationSearch(false)}
        initialQuery={receipt?.address || receipt?.vendor || ''}
        onSelect={(loc, pl) => {
          setLocation(loc)
          setPlace({ ...pl, name: pl.name || receipt?.vendor || 'Unknown Place' })
        }}
      />

      <TipPromptDialog
        isOpen={showTipPrompt}
        onClose={() => setShowTipPrompt(false)}
        onSave={handleAddTip}
        subtotal={receipt?.subtotal}
      />
    </>
  )
}
