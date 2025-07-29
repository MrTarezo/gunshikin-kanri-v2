// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react'

/**
 * デバウンスフック
 * 検索・フィルタリング最適化用
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
