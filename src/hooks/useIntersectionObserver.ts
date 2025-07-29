// src/hooks/useIntersectionObserver.ts
import { useEffect, useRef, useState } from 'react'

interface IntersectionObserverOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

/**
 * Intersection Observer フック
 * 遅延読み込み・無限スクロール用
 */
export function useIntersectionObserver(
  options: IntersectionObserverOptions = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const targetRef = useRef<HTMLElement>(null)

  const { threshold = 0, rootMargin = '0px', triggerOnce = false } = options

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting
        setIsIntersecting(isVisible)
        
        if (isVisible && triggerOnce && !hasTriggered) {
          setHasTriggered(true)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(target)

    return () => {
      observer.unobserve(target)
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered])

  return {
    targetRef,
    isIntersecting: triggerOnce ? (hasTriggered || isIntersecting) : isIntersecting
  }
}
