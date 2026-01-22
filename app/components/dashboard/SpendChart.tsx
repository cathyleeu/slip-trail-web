'use client'

import { type SpendChartProps } from '@types'
import { money } from '@utils'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function SpendChart({ points }: SpendChartProps) {
  const data: ChartData<'line', number[], string> = {
    labels: points.map((p) => p.label),
    datasets: [
      {
        label: 'Total spend',
        data: points.map((p) => p.total),
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'line'>) => ` ${money(Number(ctx.parsed.y ?? 0))}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => money(Number(value)),
        },
      },
    },
  }

  return (
    <div className="h-56">
      <Line data={data} options={options} />
    </div>
  )
}
