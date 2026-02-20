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

const COLORS = [
  '#1F2937', // gray-800
  '#6B7280', // gray-500
  '#9CA3AF', // gray-400
  '#D1D5DB', // gray-300
  '#E5E7EB', // gray-200
  '#F3F4F6', // gray-100
]

const CategoryBarChart = memo(function CategoryBarChart({
  items,
  title = 'Category breakdown',
}: CategoryBarChartProps) {
  const total = items.reduce((sum, item) => sum + item.total, 0)

  // Sort by total descending
  const sortedItems = [...items].sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="text-base font-semibold text-gray-900">{title}</div>

      {/* Stacked Bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
        {sortedItems.map((item, index) => {
          const widthPercent = total > 0 ? (item.total / total) * 100 : 0
          if (widthPercent === 0) return null
          return (
            <div
              key={`${item.category}-${index}`}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${widthPercent}%`,
                backgroundColor: COLORS[index % COLORS.length],
              }}
            />
          )
        })}
      </div>

      {/* Category List */}
      <div className="space-y-3 pt-2">
        {sortedItems.map((item, index) => (
          <div key={`${item.category}-${index}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-700">{item.category}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{money(item.total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
})

export default CategoryBarChart
