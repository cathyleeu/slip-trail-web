import type { FeelingTag } from '@types'

/**
 * Feeling 태그 스타일 정의
 */
export const FEELING_STYLES: Record<FeelingTag, { bg: string; text: string }> = {
  Necessary: { bg: 'bg-green-100', text: 'text-green-700' },
  Impulsive: { bg: 'bg-red-100', text: 'text-red-700' },
  Social: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Treat: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Routine: { bg: 'bg-gray-100', text: 'text-gray-700' },
  Stress: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Celebration: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
}

/**
 * Feeling 태그 목록
 */
export const FEELING_TAGS = [
  'Necessary',
  'Impulsive',
  'Social',
  'Treat',
  'Routine',
  'Stress',
  'Celebration',
] as const

/**
 * Feeling 태그에 해당하는 스타일 반환
 */
export function getFeelingStyle(feeling: FeelingTag | null | undefined) {
  return feeling ? FEELING_STYLES[feeling] : null
}
