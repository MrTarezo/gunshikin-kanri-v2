// src/hooks/useToast.ts
import { useState, useCallback, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

export interface ToastData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Toast通知管理フック
 * 成功・エラー・警告・情報の通知を表示
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  // Toast追加
  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString()
    const newToast: ToastData = {
      ...toast,
      id,
      duration: toast.duration ?? 5000, // デフォルト5秒
    }

    setToasts(prev => [...prev, newToast])

    // 自動削除
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  // Toast削除
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // 全削除
  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // 便利メソッド
  const success = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'success', title, message, duration })
  }, [addToast])

  const error = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'error', title, message, duration })
  }, [addToast])

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'warning', title, message, duration })
  }, [addToast])

  const info = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'info', title, message, duration })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  }
}

/**
 * Toast通知コンポーネント
 */
interface ToastItemProps {
  toast: ToastData
  onRemove: (id: string) => void
}

export function ToastItem({ toast, onRemove }: ToastItemProps) {
  // タイプ別の設定
  const getToastConfig = (type: ToastData['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bg: 'bg-green-50',
          border: 'border-green-200',
          title: 'text-green-800',
          message: 'text-green-700',
          iconColor: 'text-green-600',
        }
      case 'error':
        return {
          icon: XCircle,
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'text-red-800',
          message: 'text-red-700',
          iconColor: 'text-red-600',
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          iconColor: 'text-yellow-600',
        }
      case 'info':
        return {
          icon: Info,
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          title: 'text-blue-800',
          message: 'text-blue-700',
          iconColor: 'text-blue-600',
        }
      default:
        return {
          icon: Info,
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          title: 'text-gray-800',
          message: 'text-gray-700',
          iconColor: 'text-gray-600',
        }
    }
  }

  const config = getToastConfig(toast.type)
  const Icon = config.icon

  // 自動削除のプログレスバー
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const progressElement = document.getElementById(`toast-progress-${toast.id}`)
      if (progressElement) {
        progressElement.style.transition = `width ${toast.duration}ms linear`
        progressElement.style.width = '0%'
      }
    }
  }, [toast.duration, toast.id])

  // TSファイルではJSXを返せないため、設定のみ返す
  return {
    config,
    Icon,
    toast,
    onRemove
  }
}

/**
 * Toast表示コンテナ
 */
interface ToastContainerProps {
  toasts: ToastData[]
  onRemove: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function ToastContainer({ 
  toasts, 
  onRemove, 
  position = 'top-right' 
}: ToastContainerProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      default:
        return 'top-4 right-4'
    }
  }

  // TSファイルではJSXを返せないため、設定のみ返す
  return {
    toasts,
    onRemove,
    positionClasses: getPositionClasses()
  }
}