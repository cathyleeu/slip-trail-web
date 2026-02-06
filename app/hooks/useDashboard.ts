/**
 * Type-safe React Query hooks for Dashboard APIs
 */

import { request } from '@lib/httpFetcher'
import { queryKeys } from '@lib/queryKeys'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { Period } from '@types'

// API 응답 타입
type SummaryData = {
  total_spent: string
  receipt_count: number
  avg_per_receipt: string
}

type MoMData = {
  current_total: string
  previous_total: string
  pct_change: string | null
  top_place_name: string | null
  top_place_increase: string | null
}

type SpendPoint = {
  label: string
  total: number
}

type TopPlace = {
  place_name: string
  total: string
  count: number
  lat: number
  lon: number
  place_id: string
}

type RecentPlace = {
  place_name: string
  last_visited: string
  total: string
  lat: number
  lon: number
  place_id: string
}

// ============ Dashboard Summary ============
export function useDashboardSummary(
  period: Period = 'last30',
  options?: Omit<UseQueryOptions<SummaryData | null>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(period),
    queryFn: async () => {
      return request<SummaryData | null>(`/api/dashboard/summary?period=${period}`, {
        unwrapApiSuccess: true,
      })
    },
    staleTime: 1000 * 60 * 3, // 3분
    ...options,
  })
}

// ============ Dashboard Month-over-Month ============
export function useDashboardMoM(
  options?: Omit<UseQueryOptions<MoMData | null>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.dashboard.mom(),
    queryFn: async () => {
      return request<MoMData | null>('/api/dashboard/mom', {
        unwrapApiSuccess: true,
      })
    },
    staleTime: 1000 * 60 * 5, // 5분 - MoM은 자주 변하지 않음
    ...options,
  })
}

// ============ Dashboard Spend Series ============
export function useDashboardSpendSeries(
  period: Period = 'last30',
  options?: Omit<UseQueryOptions<SpendPoint[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.dashboard.spendSeries(period),
    queryFn: async () => {
      return request<SpendPoint[]>(`/api/dashboard/spend-series?period=${period}`, {
        unwrapApiSuccess: true,
      })
    },
    staleTime: 1000 * 60 * 3, // 3분
    ...options,
  })
}

// ============ Dashboard Top Places ============
export function useDashboardTopPlaces(
  period: Period = 'last30',
  options?: Omit<UseQueryOptions<TopPlace[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.dashboard.topPlaces(period),
    queryFn: async () => {
      return request<TopPlace[]>(`/api/dashboard/top-places?period=${period}`, {
        unwrapApiSuccess: true,
      })
    },
    staleTime: 1000 * 60 * 3, // 3분
    ...options,
  })
}

// ============ Dashboard Recent Places ============
export function useDashboardRecentPlaces(
  options?: Omit<UseQueryOptions<RecentPlace[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.dashboard.recentPlaces(),
    queryFn: async () => {
      return request<RecentPlace[]>('/api/dashboard/recent-places', {
        unwrapApiSuccess: true,
      })
    },
    staleTime: 1000 * 60 * 2, // 2분 - 최근 장소는 자주 업데이트됨
    ...options,
  })
}
