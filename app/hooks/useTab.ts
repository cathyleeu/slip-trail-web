import { useState } from 'react'

export type TabItem<T> = {
  value: T
  label: string
}

export type UseTabReturn<T> = {
  value: T
  setValue: (value: T) => void
  tabs: TabItem<T>[]
}

export function useTab<T>(tabs: TabItem<T>[], defaultValue: T): UseTabReturn<T> {
  const [value, setValue] = useState<T>(defaultValue)
  return { value, setValue, tabs }
}
