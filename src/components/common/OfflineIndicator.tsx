// src/components/common/OfflineIndicator.tsx
import { usePWA } from '../../hooks/usePWA'
import { WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const { isOnline } = usePWA()

  if (isOnline) return null

  return (
    <div className="fixed top-16 left-0 right-0 bg-orange-500 text-white px-4 py-2 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">
          オフラインです - 一部機能が制限されます
        </span>
      </div>
    </div>
  )
}
