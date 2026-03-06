import {
  Category,
  DEFAULT_CATEGORIES,
  getAllCategories,
  getCategoryById,
  getCategoryEmoji,
  SETTINGS_CATEGORIES,
} from '@lib/categories'
import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'slip-trail-custom-categories'

// 스냅샷 캐싱 (useSyncExternalStore는 동일한 참조를 반환해야 함)
let cachedCategories: Category[] = []
let cachedStorageValue: string | null = null

// 로컬 스토리지 접근을 위한 함수들
function getStoredCategories(): Category[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    // 값이 변경되지 않았으면 캐시된 배열 반환
    if (stored === cachedStorageValue) {
      return cachedCategories
    }
    // 값이 변경됐으면 새로 파싱하고 캐시
    cachedStorageValue = stored
    cachedCategories = stored ? JSON.parse(stored) : []
    return cachedCategories
  } catch {
    return []
  }
}

function setStoredCategories(categories: Category[]): void {
  try {
    const stringified = JSON.stringify(categories)
    localStorage.setItem(STORAGE_KEY, stringified)
    // 캐시 업데이트
    cachedStorageValue = stringified
    cachedCategories = categories
    // 다른 컴포넌트에 변경 알림
    window.dispatchEvent(new Event('categories-updated'))
  } catch (e) {
    console.error('Failed to save custom categories:', e)
  }
}

// useSyncExternalStore를 위한 구독 함수
function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  window.addEventListener('categories-updated', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('categories-updated', callback)
  }
}

// SSR용 빈 배열 (동일한 참조 유지)
const EMPTY_CATEGORIES: Category[] = []

/**
 * 카테고리 관리 훅
 * 기본 카테고리 + 사용자 커스텀 카테고리를 함께 관리합니다.
 */
export function useCategories() {
  // useSyncExternalStore로 로컬 스토리지와 동기화
  const customCategories = useSyncExternalStore(
    subscribe,
    getStoredCategories,
    () => EMPTY_CATEGORIES // SSR 시 빈 배열
  )

  // 커스텀 카테고리 추가
  const addCustomCategory = useCallback((category: Omit<Category, 'id'> & { id?: string }) => {
    const id = category.id || category.label.toLowerCase().replace(/\s+/g, '_')
    const newCategory: Category = { ...category, id }

    const current = getStoredCategories()
    // 중복 체크
    if (current.some((c) => c.id === id)) {
      return false
    }

    setStoredCategories([...current, newCategory])
    return true
  }, [])

  // 커스텀 카테고리 삭제
  const removeCustomCategory = useCallback((categoryId: string) => {
    const current = getStoredCategories()
    setStoredCategories(current.filter((c) => c.id !== categoryId))
  }, [])

  // 커스텀 카테고리 업데이트
  const updateCustomCategory = useCallback(
    (categoryId: string, updates: Partial<Omit<Category, 'id'>>) => {
      const current = getStoredCategories()
      setStoredCategories(current.map((c) => (c.id === categoryId ? { ...c, ...updates } : c)))
    },
    []
  )

  // 이모지 가져오기 (커스텀 카테고리 포함)
  const getEmoji = useCallback(
    (categoryId?: string | null) => getCategoryEmoji(categoryId, customCategories),
    [customCategories]
  )

  // 카테고리 정보 가져오기
  const getCategory = useCallback(
    (categoryId: string) => getCategoryById(categoryId, customCategories),
    [customCategories]
  )

  // 모든 카테고리 (기본 + 커스텀)
  const allCategories = getAllCategories(customCategories)

  return {
    // 카테고리 목록
    defaultCategories: DEFAULT_CATEGORIES,
    settingsCategories: SETTINGS_CATEGORIES,
    customCategories,
    allCategories,

    // 유틸리티
    getEmoji,
    getCategory,

    // 커스텀 카테고리 관리
    addCustomCategory,
    removeCustomCategory,
    updateCustomCategory,
  }
}
