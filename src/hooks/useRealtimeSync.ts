// src/hooks/useRealtimeSync.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { useDevRealtimeSync } from './dev/useDevRealtimeSync'

const client = generateClient<Schema>()

// 開発モード強制時はモックを使用
const useDevMode = import.meta.env.VITE_USE_DEV_SYNC === 'true' || false

interface SyncState {
  isConnected: boolean
  lastSync: Date | null
  pendingChanges: number
  error: string | null
}

/**
 * リアルタイム同期フック
 * GraphQL Subscriptions + Offline Queue
 */
export function useRealtimeSync() {
  // すべてのフックを最初に宣言（React Hooksのルール）
  const devSyncResult = useDevRealtimeSync()
  
  const [syncState, setSyncState] = useState<SyncState>({
    isConnected: false,
    lastSync: null,
    pendingChanges: 0,
    error: null
  })
  
  const subscriptionsRef = useRef<unknown[]>([])
  const offlineQueueRef = useRef<unknown[]>([])
  
  const forceSync = useCallback(async () => {
    try {
      setSyncState(prev => ({ ...prev, error: null }))
      // 強制同期の実装
      console.log('🔄 強制同期を実行')
    } catch (error) {
      console.error('強制同期エラー:', error)
      setSyncState(prev => ({ ...prev, error: '同期に失敗しました' }))
    }
  }, [])
  
  const clearError = useCallback(() => {
    setSyncState(prev => ({ ...prev, error: null }))
  }, [])
  
  // サブスクリプションのセットアップ
  const setupSubscriptions = useCallback((callbacks?: {
    onExpenseChange?: (expenses: unknown[]) => void
    onTodoChange?: (todos: unknown[]) => void
  }) => {
    try {
      console.log('🗡️ GraphQL Subscriptionsをセットアップ', callbacks ? 'コールバック付き' : '')
      
      // Expense Subscription
      if (callbacks?.onExpenseChange) {
        const expenseSubscription = client.models.Expense.observeQuery().subscribe({
          next: ({ items }: any) => {
            console.log('💰 Expenseデータ更新:', items.length)
            setSyncState(prev => ({ ...prev, lastSync: new Date() }))
            callbacks.onExpenseChange?.(items)
          },
          error: (error: any) => {
            console.error('Expense subscriptionエラー:', error)
            setSyncState(prev => ({ ...prev, error: 'Expense同期エラー' }))
          }
        })
        subscriptionsRef.current.push(expenseSubscription)
      }
      
      // Todo Subscription  
      if (callbacks?.onTodoChange) {
        const todoSubscription = client.models.Todo.observeQuery().subscribe({
          next: ({ items }: any) => {
            console.log('⚔️ Todoデータ更新:', items.length)
            setSyncState(prev => ({ ...prev, lastSync: new Date() }))
            callbacks.onTodoChange?.(items)
          },
          error: (error: any) => {
            console.error('Todo subscriptionエラー:', error)
            setSyncState(prev => ({ ...prev, error: 'Todo同期エラー' }))
          }
        })
        subscriptionsRef.current.push(todoSubscription)
      }
      
    } catch (error) {
      console.error('Subscriptionセットアップエラー:', error)
      setSyncState(prev => ({ ...prev, error: '同期のセットアップに失敗しました' }))
    }
  }, [])
  
  // オフラインキューの処理
  useEffect(() => {
    const processOfflineQueue = async () => {
      setSyncState(prev => ({ ...prev, pendingChanges: offlineQueueRef.current.length }))
    }
    
    const handleOnline = () => {
      setSyncState(prev => ({ ...prev, isConnected: true }))
      processOfflineQueue()
    }
    
    const handleOffline = () => {
      setSyncState(prev => ({ ...prev, isConnected: false }))
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // 初期状態設定
    setSyncState(prev => ({ ...prev, isConnected: navigator.onLine }))
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // クリーンアップ
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((sub: unknown) => {
        if (sub && typeof sub === 'object' && 'unsubscribe' in sub) {
          (sub as { unsubscribe: () => void }).unsubscribe()
        }
      })
    }
  }, [])
  
  // 開発モード強制時は開発用の結果を返す
  if (useDevMode) {
    console.log('🚀 開発モード: モックリアルタイム同期を使用')
    return devSyncResult
  }
  
  return {
    syncState,
    setupSubscriptions,
    forceSync,
    clearError
  }
}