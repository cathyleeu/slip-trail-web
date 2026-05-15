/**
 * Centralized query keys for React Query
 * Provides type-safe cache key management and easy invalidation
 */

export const queryKeys = {
  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    summary: (period: string) => [...queryKeys.dashboard.all, 'summary', period] as const,
    mom: () => [...queryKeys.dashboard.all, 'mom'] as const,
    spendSeries: (period: string) => [...queryKeys.dashboard.all, 'spend-series', period] as const,
    topPlaces: (period: string) => [...queryKeys.dashboard.all, 'top-places', period] as const,
    recentPlaces: () => [...queryKeys.dashboard.all, 'recent-places'] as const,
    categoryBreakdown: (period: string) =>
      [...queryKeys.dashboard.all, 'category-breakdown', period] as const,
    emotionBreakdown: (period: string) =>
      [...queryKeys.dashboard.all, 'emotion-breakdown', period] as const,
    emotionByHour: (period: string) =>
      [...queryKeys.dashboard.all, 'emotion-by-hour', period] as const,
  },

  // Map receipts
  mapReceipts: {
    all: ['map-receipts'] as const,
    byPeriod: (period: string) => [...queryKeys.mapReceipts.all, period] as const,
  },

  // Receipt queries
  receipts: {
    all: ['receipts'] as const,
    lists: () => [...queryKeys.receipts.all, 'list'] as const,
    list: (filters: { limit?: number; offset?: number }) =>
      [...queryKeys.receipts.lists(), filters] as const,
    details: () => [...queryKeys.receipts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.receipts.details(), id] as const,
  },

  // Profile queries
  profile: {
    all: ['profile'] as const,
    current: () => [...queryKeys.profile.all, 'current'] as const,
  },
} as const
