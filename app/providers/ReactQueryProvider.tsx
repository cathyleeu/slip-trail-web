'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5분 - 데이터가 5분간 fresh 상태 유지
            gcTime: 1000 * 60 * 10, // 10분 - 사용하지 않는 캐시는 10분 후 제거
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            retry: (failureCount, error: any) => {
              // 인증 에러는 재시도하지 않음
              if (error?.status === 401 || error?.status === 403) return false
              // 최대 2번까지 재시도
              return failureCount < 2
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
          },
          mutations: {
            retry: 0, // 뮤테이션은 재시도하지 않음
          },
        },
      })
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
