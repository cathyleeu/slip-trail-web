/**
 * 카테고리 관리 - 기본 카테고리 상수 및 유틸리티 함수
 * 모든 카테고리 관련 로직은 이 파일에서 관리합니다.
 */

// ============ Types ============
export type Category = {
  id: string
  emoji: string
  label: string
}

// ============ Default Categories ============
// 기본 제공되는 카테고리 목록 (삭제/수정 불가)
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'restaurant', emoji: '🍽️', label: 'Restaurant' },
  { id: 'coffee', emoji: '☕', label: 'Coffee' },
  { id: 'cafe', emoji: '☕', label: 'Cafe' },
  { id: 'mart', emoji: '🛒', label: 'Mart / Grocery' },
  { id: 'grocery', emoji: '🛒', label: 'Grocery' },
  { id: 'supermarket', emoji: '🛒', label: 'Supermarket' },
  { id: 'bar', emoji: '🍺', label: 'Bar' },
  { id: 'fast_food', emoji: '🍔', label: 'Fast Food' },
  { id: 'bakery', emoji: '🥐', label: 'Bakery' },
  { id: 'pharmacy', emoji: '💊', label: 'Pharmacy' },
  { id: 'health', emoji: '💊', label: 'Health' },
  { id: 'gas', emoji: '⛽', label: 'Gas Station' },
  { id: 'convenience', emoji: '🏪', label: 'Convenience Store' },
  { id: 'shopping', emoji: '🛍️', label: 'Shopping' },
  { id: 'transport', emoji: '🚗', label: 'Transport' },
  { id: 'entertainment', emoji: '🎬', label: 'Entertainment' },
  { id: 'travel', emoji: '✈️', label: 'Travel' },
]

// 기본 이모지 (카테고리가 없거나 매칭되지 않을 때)
export const DEFAULT_EMOJI = '📍'

// ============ Emoji Map ============
// 카테고리 ID -> 이모지 빠른 조회용 맵
const CATEGORY_EMOJI_MAP: Record<string, string> = DEFAULT_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat.emoji
  return acc
}, {} as Record<string, string>)

// ============ Utility Functions ============

/**
 * 카테고리 ID로 이모지를 가져옵니다.
 * 커스텀 카테고리를 지원하려면 customCategories 파라미터를 전달하세요.
 */
export function getCategoryEmoji(
  categoryId?: string | null,
  customCategories?: Category[]
): string {
  if (!categoryId) return DEFAULT_EMOJI

  const key = categoryId.toLowerCase()

  // 커스텀 카테고리에서 먼저 찾기
  if (customCategories) {
    const custom = customCategories.find((c) => c.id.toLowerCase() === key)
    if (custom) return custom.emoji
  }

  // 기본 카테고리에서 찾기
  return CATEGORY_EMOJI_MAP[key] ?? DEFAULT_EMOJI
}

/**
 * 카테고리 ID로 카테고리 정보를 가져옵니다.
 */
export function getCategoryById(
  categoryId: string,
  customCategories?: Category[]
): Category | undefined {
  const key = categoryId.toLowerCase()

  // 커스텀 카테고리에서 먼저 찾기
  if (customCategories) {
    const custom = customCategories.find((c) => c.id.toLowerCase() === key)
    if (custom) return custom
  }

  // 기본 카테고리에서 찾기
  return DEFAULT_CATEGORIES.find((c) => c.id === key)
}

/**
 * 모든 카테고리를 반환합니다 (기본 + 커스텀).
 * 중복 ID는 커스텀이 우선합니다.
 */
export function getAllCategories(customCategories?: Category[]): Category[] {
  if (!customCategories || customCategories.length === 0) {
    return DEFAULT_CATEGORIES
  }

  const customIds = new Set(customCategories.map((c) => c.id.toLowerCase()))

  // 기본 카테고리 중 커스텀과 중복되지 않는 것만 포함
  const filteredDefaults = DEFAULT_CATEGORIES.filter((c) => !customIds.has(c.id.toLowerCase()))

  return [...filteredDefaults, ...customCategories]
}

/**
 * 팁을 요청해야 하는 카테고리인지 확인합니다.
 */
export const TIP_ELIGIBLE_CATEGORIES = ['restaurant', 'coffee', 'cafe', 'bar']

export function isTipEligibleCategory(categoryId?: string | null): boolean {
  if (!categoryId) return false
  return TIP_ELIGIBLE_CATEGORIES.includes(categoryId.toLowerCase())
}

/**
 * Settings 페이지에서 표시할 기본 카테고리 (중복 제거)
 */
export const SETTINGS_CATEGORIES: Category[] = [
  { id: 'restaurant', emoji: '🍽️', label: 'Restaurant' },
  { id: 'coffee', emoji: '☕', label: 'Coffee' },
  { id: 'mart', emoji: '🛒', label: 'Mart / Grocery' },
  { id: 'bar', emoji: '🍺', label: 'Bar' },
  { id: 'fast_food', emoji: '🍔', label: 'Fast Food' },
  { id: 'bakery', emoji: '🥐', label: 'Bakery' },
  { id: 'pharmacy', emoji: '💊', label: 'Pharmacy' },
  { id: 'gas', emoji: '⛽', label: 'Gas Station' },
  { id: 'convenience', emoji: '🏪', label: 'Convenience Store' },
  { id: 'shopping', emoji: '🛍️', label: 'Shopping' },
  { id: 'entertainment', emoji: '🎬', label: 'Entertainment' },
  { id: 'travel', emoji: '✈️', label: 'Travel' },
]
