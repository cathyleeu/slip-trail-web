'use client'

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

type Row = { date: string; total: number; count: number }

export function SpendChart({ data }: { data: Row[] }) {
  if (!data.length) {
    return <div className="text-sm text-neutral-500">No chart data yet.</div>
  }

  const labels = data.map((d) => new Date(d.date).toLocaleDateString())
  const totals = data.map((d) => d.total)

  return (
    <div className="h-64 w-full">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: 'Total spent (CAD)',
              data: totals,
              tension: 0.3,
              pointRadius: 0,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const v = Number(ctx.parsed.y ?? 0)
                  return ` $${v.toFixed(2)}`
                },
              },
            },
          },
          scales: {
            y: {
              ticks: {
                callback: (v) => `$${Number(v).toFixed(0)}`,
              },
            },
          },
        }}
      />
    </div>
  )
}
