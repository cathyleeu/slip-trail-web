'use client'

import { money } from '@utils'
import { memo } from 'react'

export type CategorySlice = {
  category: string
  total: number
}

type CategoryBarChartProps = {
  items: CategorySlice[]
  title?: string
}

// Alternating amber/zinc two-tone palette — warm utility design system
const COLORS = [
  '#18181b', // zinc-900
  '#f59e0b', // amber-500
  '#a1a1aa', // zinc-400
  '#fcd34d', // amber-300
  '#e4e4e7', // zinc-200
  '#fef3c7', // amber-100
]

const CategoryBarChart = memo(function CategoryBarChart({
  items,
  title = 'Category breakdown',
}: CategoryBarChartProps) {
  const total = items.reduce((sum, item) => sum + item.total, 0)
  const sortedItems = [...items].sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold tracking-widest text-fg-subtle uppercase">{title}</div>

      {/* Stacked Bar */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-subtle">
        {sortedItems.map((item, index) => {
          const widthPercent = total > 0 ? (item.total / total) * 100 : 0
          if (widthPercent === 0) return null
          return (
            <div
              key={`${item.category}-${index}`}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
              style={{
                width: `${widthPercent}%`,
                backgroundColor: COLORS[index % COLORS.length],
              }}
            />
          )
        })}
      </div>

      {/* Category List */}
      <div className="space-y-3 pt-1">
        {sortedItems.map((item, index) => (
          <div key={`${item.category}-${index}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-fg-muted capitalize">{item.category}</span>
            </div>
            <span className="text-sm font-semibold text-fg tabular-nums">{money(item.total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
})

export default CategoryBarChart
