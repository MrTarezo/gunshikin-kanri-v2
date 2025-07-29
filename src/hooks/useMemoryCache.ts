// src/hooks/useMemoryCache.ts
import { useRef, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * メモリキャッシュフック
 * API レスポンスキャッシュ用
 */
export function useMemoryCache<T>(defaultTTL: number = 5 * 60 * 1000) {
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key)
    
    if (!entry) return null
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      cache.current.delete(key)
      return null
    }
    
    return entry.data
  }, [])

  const set = useCallback((key: string, data: T, ttl = defaultTTL) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }, [defaultTTL])

  const remove = useCallback((key: string) => {
    cache.current.delete(key)
  }, [])

  const clear = useCallback(() => {
    cache.current.clear()
  }, [])

  const has = useCallback((key: string): boolean => {
    const entry = cache.current.get(key)
    if (!entry) return false
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      cache.current.delete(key)
      return false
    }
    
    return true
  }, [])

  return { get, set, remove, clear, has }
}