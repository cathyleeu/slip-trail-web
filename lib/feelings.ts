import type { FeelingTag } from '@types'

export const FEELING_STYLES: Record<FeelingTag, { bg: string; text: string }> = {
  Necessary: { bg: 'bg-green-100', text: 'text-green-700' },
  Impulsive: { bg: 'bg-red-100', text: 'text-red-700' },
  Social: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Treat: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Routine: { bg: 'bg-gray-100', text: 'text-gray-700' },
  Stress: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Celebration: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
}

export const FEELING_TAGS = [
  'Necessary',
  'Impulsive',
  'Social',
  'Treat',
  'Routine',
  'Stress',
  'Celebration',
] as const

export const FEELING_EMOJIS: Record<FeelingTag, string> = {
  Necessary: '✅',
  Impulsive: '⚡',
  Social: '👥',
  Treat: '🎁',
  Routine: '🔄',
  Stress: '😤',
  Celebration: '🎉',
}

// Single source of truth for feeling → left-border Tailwind class (used in ReceiptCard)
export const FEELING_BORDER_COLORS: Record<FeelingTag, string> = {
  Necessary: 'border-l-green-400',
  Impulsive: 'border-l-rose-400',
  Social: 'border-l-sky-400',
  Treat: 'border-l-violet-400',
  Routine: 'border-l-zinc-300',
  Stress: 'border-l-orange-400',
  Celebration: 'border-l-amber-400',
}

// Hex values for chart/canvas contexts where Tailwind classes can't be used
export const FEELING_HEX_COLORS: Record<FeelingTag, string> = {
  Necessary: '#4ade80',
  Impulsive: '#fb7185',
  Social: '#38bdf8',
  Treat: '#a78bfa',
  Routine: '#a1a1aa',
  Stress: '#fb923c',
  Celebration: '#fbbf24',
}

export function getFeelingStyle(feeling: FeelingTag | null | undefined) {
  return feeling ? FEELING_STYLES[feeling] : null
}

export function getFeelingEmoji(feeling: string | null | undefined): string | null {
  if (!feeling) return null
  return FEELING_EMOJIS[feeling as FeelingTag] ?? null
}

export function getFeelingBorderColor(feeling: string | null | undefined): string {
  if (!feeling) return 'border-l-transparent'
  return FEELING_BORDER_COLORS[feeling as FeelingTag] ?? 'border-l-transparent'
}
