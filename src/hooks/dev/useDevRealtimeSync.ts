// src/hooks/dev/useDevRealtimeSync.ts - 開発用リアルタイム同期フック
import { useState } from 'react'

interface SyncState {
  isConnected: boolean
  lastSync: Date | null
  pendingChanges: number
  error: string | null
}

export function useDevRealtimeSync() {
  const [syncState] = useState<SyncState>({
    isConnected: true,
    lastSync: new Date(),
    pendingChanges: 0,
    error: null
  })

  const setupSubscriptions = (callbacks?: {
    onExpenseChange?: (expenses: unknown[]) => void
    onTodoChange?: (todos: unknown[]) => void
  }) => {
    // 開発モードでは何もしない
    console.log('🚀 開発モード: リアルタイム同期をスキップ', callbacks ? 'コールバック付き' : '')
  }

  const forceSync = async () => {
    console.log('🚀 開発モード: 手動同期をスキップ')
  }

  const clearError = () => {
    console.log('🚀 開発モード: エラークリアをスキップ')
  }

  return {
    syncState,
    setupSubscriptions,
    forceSync,
    clearError
  }
}