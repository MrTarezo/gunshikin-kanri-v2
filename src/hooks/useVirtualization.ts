// src/hooks/useVirtualization.ts
import { useState, useEffect, useMemo } from 'react'

interface VirtualizationOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

/**
 * 仮想化フック
 * 大量のリストアイテムを効率的に表示
 */
export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const { itemHeight, containerHeight, overscan = 5 } = options
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    )
    
    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan)
    }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }))
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.start * itemHeight

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange
  }
}
