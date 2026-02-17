'use client'

import { money } from '@utils'
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import { memo } from 'react'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

export type CategorySlice = {
  category: string
  total: number
}

type CategoryPieChartProps = {
  items: CategorySlice[]
}

const COLORS = [
  '#60A5FA',
  '#34D399',
  '#FBBF24',
  '#F87171',
  '#A78BFA',
  '#F472B6',
  '#22D3EE',
  '#FB923C',
  '#94A3B8',
]

const CategoryPieChart = memo(function CategoryPieChart({ items }: CategoryPieChartProps) {
  const labels = items.map((i) => i.category)
  const values = items.map((i) => i.total)
  const total = values.reduce((sum, v) => sum + v, 0)

  const data: ChartData<'pie', number[], string> = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 0,
      },
    ],
  }

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'pie'>) => {
            const value = Number(ctx.parsed || 0)
            const pct = total > 0 ? Math.round((value / total) * 100) : 0
            return ` ${ctx.label}: ${money(value)} (${pct}%)`
          },
        },
      },
    },
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
      <div className="h-40">
        <Pie data={data} options={options} />
      </div>
      <div className="space-y-2">
        {items.map((item, index) => {
          const pct = total > 0 ? Math.round((item.total / total) * 100) : 0
          return (
            <div key={`${item.category}-${index}`} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{item.category}</span>
              </div>
              <div className="text-sm text-gray-500">
                {money(item.total)} · {pct}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default CategoryPieChart
