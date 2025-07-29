// src/components/todo/TodoList.tsx
import { useState } from 'react'
import { Button } from '../ui/button'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  Calendar,
  Flag,
  MoreVertical,
  Trash2,
  Edit,
  Play,
  Pause
} from 'lucide-react'

interface TodoData {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in-progress' | 'completed'
  assignee: string
  dueDate: string
  category: string
  createdAt: string
  completedAt?: string
}

interface TodoListProps {
  todos: TodoData[]
  onToggleStatus: (id: string, newStatus: TodoData['status']) => void
  onDelete: (id: string) => void
}

export function TodoList({ todos, onToggleStatus, onDelete }: TodoListProps) {
  const [expandedTodo, setExpandedTodo] = useState<string | null>(null)

  const getPriorityColor = (priority: TodoData['priority']) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[priority]
  }

  const getPriorityIcon = (priority: TodoData['priority']) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      urgent: '🔴',
    }
    return icons[priority]
  }

  const getStatusColor = (status: TodoData['status']) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    }
    return colors[status]
  }

  const getStatusLabel = (status: TodoData['status']) => {
    const labels = {
      pending: '📋 待機中',
      'in-progress': '⚡ 実行中',
      completed: '✅ 完了',
    }
    return labels[status]
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      '一般作戦': '⚔️',
      '補給作戦': '📦',
      '偵察任務': '🔍',
      '資金作戦': '💰',
      '緊急対応': '🚨',
      '定期任務': '🔄',
    }
    return icons[category] || '⚔️'
  }

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const getDaysUntilDue = (dueDate: string) => {
    if (!dueDate) return null
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  // ステータス別にグループ化
  const groupedTodos = {
    pending: todos.filter(t => t.status === 'pending'),
    'in-progress': todos.filter(t => t.status === 'in-progress'),
    completed: todos.filter(t => t.status === 'completed'),
  }

  const renderTodoCard = (todo: TodoData) => {
    const daysUntilDue = getDaysUntilDue(todo.dueDate)
    const overdue = isOverdue(todo.dueDate)
    const isExpanded = expandedTodo === todo.id

    return (
      <div
        key={todo.id}
        className={`bg-white rounded-lg border-2 p-4 hover:shadow-md transition-all duration-200 ${
          todo.status === 'completed' ? 'opacity-75' : ''
        } ${overdue && todo.status !== 'completed' ? 'border-red-300' : 'border-gray-200'}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* ステータスボタン */}
            <button
              onClick={() => {
                if (todo.status === 'pending') {
                  onToggleStatus(todo.id, 'in-progress')
                } else if (todo.status === 'in-progress') {
                  onToggleStatus(todo.id, 'completed')
                } else {
                  onToggleStatus(todo.id, 'pending')
                }
              }}
              className="mt-1"
            >
              {todo.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 hover:text-blue-600" />
              )}
            </button>

            {/* メインコンテンツ */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{getCategoryIcon(todo.category)}</span>
                <h4 className={`font-semibold ${todo.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {todo.title}
                </h4>
              </div>

              {/* メタ情報 */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(todo.priority)}`}>
                  {getPriorityIcon(todo.priority)} {todo.priority.toUpperCase()}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(todo.status)}`}>
                  {getStatusLabel(todo.status)}
                </span>
                {todo.assignee && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {todo.assignee}
                  </span>
                )}
              </div>

              {/* 期限情報 */}
              {todo.dueDate && (
                <div className={`flex items-center gap-1 text-xs ${
                  overdue && todo.status !== 'completed' 
                    ? 'text-red-600' 
                    : daysUntilDue !== null && daysUntilDue <= 3 
                      ? 'text-orange-600' 
                      : 'text-gray-600'
                }`}>
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(todo.dueDate).toLocaleDateString('ja-JP')}
                    {daysUntilDue !== null && todo.status !== 'completed' && (
                      <span className="ml-1">
                        {overdue ? `(${Math.abs(daysUntilDue)}日遅れ)` : `(あと${daysUntilDue}日)`}
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* 詳細説明（展開時） */}
              {isExpanded && todo.description && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                  {todo.description}
                </div>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center space-x-1">
            {todo.description && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedTodo(isExpanded ? null : todo.id)}
              >
                {isExpanded ? '▲' : '▼'}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(todo.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚔️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          作戦が立案されていません
        </h3>
        <p className="text-gray-600">
          最初の作戦を立案してみましょう
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 待機中 */}
      {groupedTodos.pending.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📋 待機中の作戦 ({groupedTodos.pending.length})
          </h3>
          <div className="space-y-3">
            {groupedTodos.pending.map(renderTodoCard)}
          </div>
        </div>
      )}

      {/* 実行中 */}
      {groupedTodos['in-progress'].length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ⚡ 実行中の作戦 ({groupedTodos['in-progress'].length})
          </h3>
          <div className="space-y-3">
            {groupedTodos['in-progress'].map(renderTodoCard)}
          </div>
        </div>
      )}

      {/* 完了 */}
      {groupedTodos.completed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ✅ 完了した作戦 ({groupedTodos.completed.length})
          </h3>
          <div className="space-y-3">
            {groupedTodos.completed.map(renderTodoCard)}
          </div>
        </div>
      )}
    </div>
  )
}