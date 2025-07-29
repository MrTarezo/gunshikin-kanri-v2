// src/hooks/useInfiniteScroll.ts
import { useState, useEffect, useCallback } from 'react'
import { useIntersectionObserver } from './useIntersectionObserver'

interface InfiniteScrollOptions<T> {
  fetchMore: (page: number) => Promise<T[]>
  pageSize: number
  initialData?: T[]
}

/**
 * 無限スクロールフック
 * 大量データの段階的読み込み
 */
export function useInfiniteScroll<T>(options: InfiniteScrollOptions<T>) {
  const [data, setData] = useState<T[]>(options.initialData || [])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  })

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    setError(null)

    try {
      const newData = await options.fetchMore(page)
      
      if (newData.length === 0 || newData.length < options.pageSize) {
        setHasMore(false)
      }

      setData(prev => [...prev, ...newData])
      setPage(prev => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みエラー')
    } finally {
      setIsLoading(false)
    }
  }, [options, page, isLoading, hasMore])

  // 交差点が見えたら自動で読み込み
  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) {
      loadMore()
    }
  }, [isIntersecting, hasMore, isLoading, loadMore])

  const reset = useCallback(() => {
    setData(options.initialData || [])
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [options.initialData])

  return {
    data,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    targetRef
  }
}
