// src/components/common/OptimisticList.tsx
import { ReactNode } from 'react'
import { useOptimisticUpdates } from '../../hooks/useOptimisticUpdates'
import { Button } from '../ui/button'
import { AlertCircle, RefreshCw, Undo } from 'lucide-react'

interface OptimisticListProps<T extends { id: string }> {
  data: T[]
  renderItem: (item: T, isPending?: boolean) => ReactNode
  className?: string
}

export function OptimisticList<T extends { id: string }>({
  data,
  renderItem,
  className = ''
}: OptimisticListProps<T>) {
  const {
    applyOptimisticUpdates,
    retryOperation,
    rollbackOperation,
    pendingOperations,
    failedOperations
  } = useOptimisticUpdates<T>()

  const optimisticData = applyOptimisticUpdates(data)

  return (
    <div className={className}>
      {/* 失敗した操作の警告 */}
      {failedOperations.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-900">
              {failedOperations.length}件の操作が失敗しました
            </span>
          </div>
          <div className="flex gap-2">
            {failedOperations.map(operation => (
              <div key={operation.id} className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => retryOperation(operation.id)}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  再試行
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => rollbackOperation(operation.id)}
                  className="text-xs"
                >
                  <Undo className="h-3 w-3 mr-1" />
                  取消
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* データリスト */}
      <div>
        {optimisticData.map(item => {
          const isPending = pendingOperations.some(op => 
            op.data.id === item.id
          )
          
          return (
            <div key={item.id} className={isPending ? 'opacity-70' : ''}>
              {renderItem(item, isPending)}
            </div>
          )
        })}
      </div>
    </div>
  )
}