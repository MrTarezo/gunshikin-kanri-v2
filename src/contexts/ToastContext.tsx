// src/contexts/ToastContext.tsx - 簡易版
import { createContext, useContext, ReactNode, useState } from 'react'

interface ToastData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

interface ToastContextType {
  toasts: ToastData[]
  toast: {
    success: (title: string, message?: string) => void
    error: (title: string, message?: string) => void
    warning: (title: string, message?: string) => void
    info: (title: string, message?: string) => void
  }
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = (type: ToastData['type'], title: string, message?: string) => {
    const id = Date.now().toString()
    const newToast = { id, type, title, message }
    setToasts(prev => [...prev, newToast])
    
    // 3秒後に自動削除
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const toast = {
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
  }

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
      {/* 簡易Toast表示 */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3 rounded-lg shadow-lg text-white ${
              t.type === 'success' ? 'bg-green-600' :
              t.type === 'error' ? 'bg-red-600' :
              t.type === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}
          >
            <div className="font-medium">{t.title}</div>
            {t.message && <div className="text-sm opacity-90">{t.message}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }
  return context
}
