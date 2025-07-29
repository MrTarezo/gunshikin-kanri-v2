
// src/components/common/PWAInstallPrompt.tsx
import { useState } from 'react'
import { usePWA } from '../../hooks/usePWA'
import { Button } from '../ui/button'
import { Download, X, Smartphone } from 'lucide-react'

export function PWAInstallPrompt() {
  const [isVisible, setIsVisible] = useState(true)
  const { canInstall, promptInstall } = usePWA()

  if (!canInstall || !isVisible) {
    return null
  }

  const handleInstall = async () => {
    const success = await promptInstall()
    if (success) {
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40 max-w-sm mx-auto">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Smartphone className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">
              📱 アプリをインストール
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              ホーム画面に追加してより快適に利用できます
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="p-1 h-auto text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex space-x-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDismiss}
          className="flex-1 text-xs"
        >
          後で
        </Button>
        <Button
          onClick={handleInstall}
          size="sm"
          className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-3 w-3 mr-1" />
          インストール
        </Button>
      </div>
    </div>
  )
}
