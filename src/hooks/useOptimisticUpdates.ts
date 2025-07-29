// src/hooks/useOptimisticUpdates.ts
import { useState, useCallback, useRef } from 'react'

interface OptimisticOperation<T> {
  id: string
  type: 'create' | 'update' | 'delete'
  data: T
  originalData?: T
  timestamp: Date
  isPending: boolean
}

/**
 * 楽観的更新フック
 * UX向上のための即座の画面更新
 */
export function useOptimisticUpdates<T extends { id: string }>() {
  const [operations, setOperations] = useState<OptimisticOperation<T>[]>([])
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // 楽観的更新の実行
  const executeOptimistic = useCallback((
    type: OptimisticOperation<T>['type'],
    data: T,
    originalData?: T
  ) => {
    const operationId = `${type}-${data.id}-${Date.now()}`
    
    const operation: OptimisticOperation<T> = {
      id: operationId,
      type,
      data,
      originalData,
      timestamp: new Date(),
      isPending: true
    }

    setOperations(prev => [...prev, operation])

    // 一定時間後に自動削除（タイムアウト）
    const timeout = setTimeout(() => {
      completeOperation(operationId, false)
    }, 10000) // 10秒でタイムアウト

    timeoutRefs.current.set(operationId, timeout)

    return operationId
  }, [])

  // 操作の完了
  const completeOperation = useCallback((operationId: string, success: boolean) => {
    const timeout = timeoutRefs.current.get(operationId)
    if (timeout) {
      clearTimeout(timeout)
      timeoutRefs.current.delete(operationId)
    }

    if (success) {
      // 成功時は操作を削除
      setOperations(prev => prev.filter(op => op.id !== operationId))
    } else {
      // 失敗時は操作をエラー状態に
      setOperations(prev => 
        prev.map(op => 
          op.id === operationId 
            ? { ...op, isPending: false }
            : op
        )
      )
    }
  }, [])

  // 失敗した操作のリトライ
  const retryOperation = useCallback((operationId: string) => {
    setOperations(prev =>
      prev.map(op =>
        op.id === operationId
          ? { ...op, isPending: true, timestamp: new Date() }
          : op
      )
    )

    // 新しいタイムアウトを設定
    const timeout = setTimeout(() => {
      completeOperation(operationId, false)
    }, 10000)

    timeoutRefs.current.set(operationId, timeout)
  }, [completeOperation])

  // データに楽観的更新を適用
  const applyOptimisticUpdates = useCallback((baseData: T[]) => {
    let result = [...baseData]

    operations.forEach(operation => {
      switch (operation.type) {
        case 'create':
          if (!result.find(item => item.id === operation.data.id)) {
            result.unshift(operation.data)
          }
          break

        case 'update':
          result = result.map(item =>
            item.id === operation.data.id ? operation.data : item
          )
          break

        case 'delete':
          result = result.filter(item => item.id !== operation.data.id)
          break
      }
    })

    return result
  }, [operations])

  // 失敗した操作をロールバック
  const rollbackOperation = useCallback((operationId: string) => {
    const operation = operations.find(op => op.id === operationId)
    if (!operation) return

    if (operation.type === 'update' && operation.originalData) {
      // 更新の場合は元データに戻す
      setOperations(prev =>
        prev.map(op =>
          op.id === operationId
            ? { ...op, data: operation.originalData!, isPending: false }
            : op
        )
      )
    } else {
      // 作成・削除の場合は操作を削除
      setOperations(prev => prev.filter(op => op.id !== operationId))
    }

    const timeout = timeoutRefs.current.get(operationId)
    if (timeout) {
      clearTimeout(timeout)
      timeoutRefs.current.delete(operationId)
    }
  }, [operations])

  return {
    operations,
    executeOptimistic,
    completeOperation,
    retryOperation,
    rollbackOperation,
    applyOptimisticUpdates,
    pendingOperations: operations.filter(op => op.isPending),
    failedOperations: operations.filter(op => !op.isPending)
  }
}
