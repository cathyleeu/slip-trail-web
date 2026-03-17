'use client'

import { TipPromptDialog } from '@components'
import { Header } from '@components'
import { Button, Card, IconButton } from '@components/ui'
import { LocationPin, Plus, Trash } from '@components/ui/icons'
import { useReceiptDetail, useUpdateReceipt } from '@hooks'
import { DEFAULT_CATEGORIES, getCategoryEmoji, getCategoryLabel, isTipEligibleCategory } from '@lib/categories'
import { FEELING_TAGS, getFeelingStyle } from '@lib/feelings'
import { ChargeType, FeelingTag, ReceiptCategory, ReceiptDetail } from '@types'
import { cn } from '@utils/cn'
import { formatDateTime, money, normalizeNumberInput } from '@utils/format'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type DraftState = {
  vendor: string
  category: ReceiptCategory | null
  items: Array<{ name: string; quantity: number; price: number }>
  charges: Array<{ type: ChargeType; label: string; amount: number }>
  subtotal: number | null
  total: number | null
  feeling: FeelingTag | null
  memo: string | null
}

function toDraft(receipt: ReceiptDetail): DraftState {
  return {
    vendor: receipt.vendor ?? '',
    category: receipt.category ?? null,
    items: (receipt.items ?? []).map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    charges: (receipt.charges ?? []).map((charge) => ({
      type: charge.type as ChargeType,
      label: charge.label,
      amount: charge.amount,
    })),
    subtotal: receipt.subtotal ?? null,
    total: receipt.total ?? null,
    feeling: receipt.feeling ?? null,
    memo: receipt.memo ?? null,
  }
}

function recalcTotal(draft: DraftState): number {
  const itemsTotal = draft.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const chargesTotal = draft.charges.reduce((sum, charge) => sum + charge.amount, 0)
  return itemsTotal + chargesTotal
}

export default function ReceiptDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: receipt, isLoading, error } = useReceiptDetail(id)
  const updateReceipt = useUpdateReceipt(id)

  const [isEditMode, setIsEditMode] = useState(false)
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [showTipPrompt, setShowTipPrompt] = useState(false)
  const [tipPromptShown, setTipPromptShown] = useState(false)

  // Show tip prompt when entering edit mode for tip-eligible categories without tip
  useEffect(() => {
    if (!isEditMode || !draft || tipPromptShown) return

    const hasTip = draft.charges.some(
      (charge) => charge.type === ChargeType.TIP || charge.label?.toLowerCase().includes('tip')
    )

    if (isTipEligibleCategory(draft.category) && !hasTip) {
      const timer = setTimeout(() => {
        setShowTipPrompt(true)
        setTipPromptShown(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEditMode, draft, tipPromptShown])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Receipt Details" />
        <div className="p-4 animate-pulse space-y-4">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header title="Receipt Details" />
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-gray-500 mb-4">Receipt not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const active = isEditMode && draft ? draft : null
  const displayCategory = active?.category ?? receipt.category
  const displayVendor = active?.vendor ?? receipt.vendor
  const displayItems = active?.items ?? receipt.items ?? []
  const displayCharges = active?.charges ?? receipt.charges ?? []
  const displayTotal = active?.total ?? receipt.total
  const displayFeeling = active?.feeling ?? receipt.feeling
  const displayMemo = active?.memo ?? receipt.memo

  const categoryEmoji = getCategoryEmoji(displayCategory)
  const categoryLabel = getCategoryLabel(displayCategory)
  const feelingStyle = getFeelingStyle(displayFeeling ?? undefined)
  const displayDate = receipt.purchased_at || receipt.created_at

  const handleEdit = () => {
    setDraft(toDraft(receipt))
    setTipPromptShown(false)
    setIsEditMode(true)
  }

  const handleCancel = () => {
    setDraft(null)
    setIsEditMode(false)
  }

  const handleSave = async () => {
    if (!draft) return
    await updateReceipt.mutateAsync({
      receipt: {
        vendor: draft.vendor,
        category: draft.category ?? undefined,
        items: draft.items,
        charges: draft.charges,
        total: draft.total ?? undefined,
        subtotal: draft.subtotal ?? undefined,
      },
      feeling: draft.feeling,
      memo: draft.memo,
    })
    setDraft(null)
    setIsEditMode(false)
  }

  // Draft mutation helpers
  const updateDraft = (updater: (d: DraftState) => DraftState) => {
    setDraft((prev) => {
      if (!prev) return prev
      const next = updater(prev)
      return { ...next, total: recalcTotal(next) }
    })
  }

  const handleEditItem = (index: number, field: 'name' | 'quantity' | 'price', value: string) => {
    updateDraft((d) => {
      const items = [...d.items]
      if (field === 'quantity' || field === 'price') {
        items[index] = { ...items[index], [field]: parseFloat(value) || 0 }
      } else {
        items[index] = { ...items[index], [field]: value }
      }
      return { ...d, items }
    })
  }

  const handleAddItem = () => {
    updateDraft((d) => ({
      ...d,
      items: [...d.items, { name: '', quantity: 1, price: 0 }],
    }))
  }

  const handleDeleteItem = (index: number) => {
    updateDraft((d) => ({ ...d, items: d.items.filter((_, i) => i !== index) }))
  }

  const handleEditCharge = (index: number, field: 'type' | 'amount', value: string) => {
    updateDraft((d) => {
      const charges = [...d.charges]
      if (field === 'amount') {
        charges[index] = { ...charges[index], amount: parseFloat(value) || 0 }
      } else {
        charges[index] = { ...charges[index], type: value as ChargeType }
      }
      return { ...d, charges }
    })
  }

  const handleAddCharge = () => {
    updateDraft((d) => ({
      ...d,
      charges: [...d.charges, { type: ChargeType.TAX, label: '', amount: 0 }],
    }))
  }

  const handleDeleteCharge = (index: number) => {
    updateDraft((d) => ({ ...d, charges: d.charges.filter((_, i) => i !== index) }))
  }

  const handleAddTip = (tipAmount: number) => {
    updateDraft((d) => ({
      ...d,
      charges: [...d.charges, { type: ChargeType.TIP, label: 'Tip', amount: tipAmount }],
    }))
    setShowTipPrompt(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="Receipt Details" />

      <div className="p-4 space-y-4">
        {/* Receipt Image */}
        {receipt.img_url && (
          <Card className="overflow-hidden">
            <div className="relative aspect-3/4 w-full">
              <Image
                src={receipt.img_url}
                alt="Receipt"
                fill
                className="object-contain bg-gray-100"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </Card>
        )}

        {/* Vendor & Category */}
        <Card className="p-4">
          {isEditMode && draft ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Vendor</label>
                <input
                  type="text"
                  value={draft.vendor}
                  onChange={(e) => setDraft((d) => d && { ...d, vendor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Category</label>
                <select
                  value={draft.category ?? ''}
                  onChange={(e) => setDraft((d) => d && { ...d, category: (e.target.value || null) as ReceiptCategory | null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="">Other</option>
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl shrink-0">
                {categoryEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900">{displayVendor}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{categoryLabel}</p>
                <p className="text-sm text-gray-400 mt-1">{formatDateTime(displayDate)}</p>
              </div>
              {feelingStyle && (
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium shrink-0',
                    feelingStyle.bg,
                    feelingStyle.text
                  )}
                >
                  {displayFeeling}
                </span>
              )}
            </div>
          )}
        </Card>

        {/* Location */}
        {(receipt.place_name || receipt.place_address || receipt.address) && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <LocationPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {receipt.place_name && (
                  <p className="font-medium text-gray-900">{receipt.place_name}</p>
                )}
                <p className="text-sm text-gray-500">{receipt.place_address || receipt.address}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Items */}
        {(displayItems.length > 0 || isEditMode) && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Items</h3>
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
              {displayItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-800">
                  {isEditMode ? (
                    <>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleEditItem(idx, 'quantity', normalizeNumberInput(e.target.value))}
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
                        onChange={(e) => handleEditItem(idx, 'price', normalizeNumberInput(e.target.value))}
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
                      <span className="font-medium text-gray-900">{money(item.price)}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Charges & Totals */}
        <Card className="p-4">
          {(displayCharges.length > 0 || isEditMode) && (
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Charges</h3>
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
              {receipt.subtotal !== null && !isEditMode && (
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>{money(receipt.subtotal)}</span>
                </div>
              )}
              {displayCharges.map((charge, idx) => (
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
                        onChange={(e) => handleEditCharge(idx, 'amount', normalizeNumberInput(e.target.value))}
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
                      <span className="flex-1 text-gray-600 capitalize">
                        {charge.label || charge.type}
                      </span>
                      <span className="text-gray-900">{money(charge.amount)}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>{displayTotal ? money(displayTotal) : '-'}</span>
          </div>
        </Card>

        {/* Feeling Tags */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">How did this feel?</h3>
          <div className="flex flex-wrap gap-2">
            {FEELING_TAGS.map((tag) => {
              const isSelected = isEditMode ? draft?.feeling === tag : receipt.feeling === tag
              return (
                <Button
                  key={tag}
                  variant="tag"
                  size="sm"
                  selected={isSelected}
                  onClick={() => {
                    if (!isEditMode) return
                    setDraft((d) => d && { ...d, feeling: d.feeling === tag ? null : tag })
                  }}
                  className={cn(!isEditMode && 'cursor-default')}
                >
                  {tag}
                </Button>
              )
            })}
          </div>

          {/* Memo */}
          <div>
            {isEditMode ? (
              <textarea
                value={draft?.memo ?? ''}
                onChange={(e) => setDraft((d) => d && { ...d, memo: e.target.value })}
                placeholder="Add a note about this purchase..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            ) : (
              displayMemo && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{displayMemo}</p>
              )
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3">
        {isEditMode ? (
          <>
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="flex-1 py-3 rounded-2xl border border-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateReceipt.isPending}
              className="flex-1 py-3 rounded-2xl"
            >
              {updateReceipt.isPending ? 'Saving...' : 'Save'}
            </Button>
          </>
        ) : (
          <Button onClick={handleEdit} className="w-full py-3 rounded-2xl">
            Edit Receipt
          </Button>
        )}
      </div>

      <TipPromptDialog
        isOpen={showTipPrompt}
        onClose={() => setShowTipPrompt(false)}
        onSave={handleAddTip}
        subtotal={draft?.subtotal ?? receipt.subtotal}
      />
    </div>
  )
}
