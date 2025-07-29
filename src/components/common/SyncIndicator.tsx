// src/components/common/SyncIndicator.tsx
import { useRealtimeSync } from '../../hooks/useRealtimeSync'
import { Button } from '../ui/button'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Clock
} from 'lucide-react'

export function SyncIndicator() {
  const { syncState, forceSync, clearError } = useRealtimeSync()

  const getStatusIcon = () => {
    if (!syncState.isConnected) {
      return <WifiOff className="h-4 w-4 text-red-500" />
    }
    
    if (syncState.pendingChanges > 0) {
      return <Clock className="h-4 w-4 text-orange-500 animate-pulse" />
    }
    
    if (syncState.error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusText = () => {
    if (!syncState.isConnected) {
      return 'オフライン'
    }
    
    if (syncState.pendingChanges > 0) {
      return `同期中 (${syncState.pendingChanges})`
    }
    
    if (syncState.error) {
      return 'エラー'
    }
    
    return '同期済み'
  }

  const handleClick = () => {
    if (syncState.error) {
      clearError()
    } else if (syncState.isConnected) {
      forceSync()
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="flex items-center gap-2 text-xs"
      disabled={!syncState.isConnected && syncState.pendingChanges === 0}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {syncState.isConnected && (
        <RefreshCw className="h-3 w-3 opacity-50" />
      )}
    </Button>
  )
}

