// src/components/todo/TodoPage.tsx
import { useState } from 'react'
import { useTodos } from '../../hooks/useTodos'
import { useAuth } from '../../hooks/useAuth'
import { TodoForm } from './TodoForm'
import { TodoList } from './TodoList'
import { TodoStats } from './TodoStats'
import { Button } from '../ui/button'
import { Filter, User, Flag, RotateCcw } from 'lucide-react'

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

export function TodoPage() {
  const { nickname } = useAuth()
  const { 
    todos, 
    addTodo, 
    toggleTodoStatus,
    deleteTodo
  } = useTodos()
  
  const [filter, setFilter] = useState<{
    status: 'all' | 'pending' | 'in-progress' | 'completed'
    priority: 'all' | 'low' | 'medium' | 'high' | 'urgent'
    assignee: string
    category: string
  }>({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    category: 'all',
  })

  // 初期化は useTodos フックで自動的に行われる

  // Todo追加のハンドラー
  const handleAddTodo = async (todoData: Omit<TodoData, 'id' | 'createdAt' | 'completedAt'>) => {
    console.log('⚔️ Todo追加処理開始:', todoData)
    
    try {
      const result = await addTodo({
        title: todoData.title,
        description: todoData.description,
        priority: todoData.priority,
        assignee: todoData.assignee,
        dueDate: todoData.dueDate,
        category: todoData.category,
      })
      
      if (result.success) {
        console.log('✅ Todo追加成功:', result.data)
        // 成功時は特に通知しない（UIが自動更新される）
      } else {
        console.error('❌ Todo追加失敗:', result.message)
        alert(`❌ エラー: ${result.message}`)
      }
      
      return result
    } catch (err) {
      console.error('❌ Todo追加で予期しないエラー:', err)
      const message = err instanceof Error ? err.message : '予期しないエラーが発生しました'
      alert(`❌ 予期しないエラー: ${message}`)
      return { success: false, message }
    }
  }

  // Todo状態変更のハンドラー
  const handleToggleStatus = async (id: string, newStatus: TodoData['status']) => {
    console.log('⚔️ Todo状態変更処理開始:', id, newStatus)
    
    try {
      const result = await toggleTodoStatus(id, newStatus)
      
      if (result.success) {
        console.log('✅ Todo状態変更成功:', result.message)
        // 成功時は特に通知しない（UIが自動更新される）
      } else {
        console.error('❌ Todo状態変更失敗:', result.message)
        alert(`❌ エラー: ${result.message}`)
      }
      
      return result
    } catch (err) {
      console.error('❌ Todo状態変更で予期しないエラー:', err)
      const message = err instanceof Error ? err.message : '予期しないエラーが発生しました'
      alert(`❌ 予期しないエラー: ${message}`)
      return { success: false, message }
    }
  }

  // Todo削除のハンドラー
  const handleDeleteTodo = async (id: string) => {
    console.log('⚔️ Todo削除処理開始:', id)
    
    try {
      const result = await deleteTodo(id)
      
      if (result.success) {
        console.log('✅ Todo削除成功:', result.message)
        // 成功時は特に通知しない（UIが自動更新される）
      } else {
        console.error('❌ Todo削除失敗:', result.message)
        alert(`❌ エラー: ${result.message}`)
      }
      
      return result
    } catch (err) {
      console.error('❌ Todo削除で予期しないエラー:', err)
      const message = err instanceof Error ? err.message : '予期しないエラーが発生しました'
      alert(`❌ 予期しないエラー: ${message}`)
      return { success: false, message }
    }
  }

  // フィルタリング
  const filteredTodos = todos.filter(todo => {
    if (filter.status !== 'all' && todo.status !== filter.status) return false
    if (filter.priority !== 'all' && todo.priority !== filter.priority) return false
    if (filter.assignee !== 'all' && todo.assignee !== filter.assignee) return false
    if (filter.category !== 'all' && todo.category !== filter.category) return false
    return true
  })

  // ユニークなフィルター値を取得
  const availableAssignees = [...new Set(todos.map(t => t.assignee))]
  const availableCategories = [...new Set(todos.map(t => t.category))]

  const resetFilters = () => {
    setFilter({
      status: 'all',
      priority: 'all',
      assignee: 'all',
      category: 'all',
    })
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">⚔️ 作戦計画</h2>
          <p className="text-gray-600">戦略的タスク管理・作戦進捗監視</p>
        </div>
        <TodoForm onAdd={handleAddTodo} nickname={nickname} />
      </div>

      {/* 統計ダッシュボード */}
      <TodoStats todos={todos as TodoData[]} />

      {/* フィルター */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">フィルター:</span>
          </div>

          {/* ステータスフィルター */}
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">すべてのステータス</option>
            <option value="pending">📋 待機中</option>
            <option value="in-progress">⚡ 実行中</option>
            <option value="completed">✅ 完了</option>
          </select>

          {/* 優先度フィルター */}
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-gray-500" />
            <select
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value as any })}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">すべての優先度</option>
              <option value="urgent">🔴 緊急</option>
              <option value="high">🟠 高</option>
              <option value="medium">🟡 中</option>
              <option value="low">🟢 低</option>
            </select>
          </div>

          {/* 担当者フィルター */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <select
              value={filter.assignee}
              onChange={(e) => setFilter({ ...filter, assignee: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">すべての担当者</option>
              {availableAssignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>

          {/* カテゴリフィルター */}
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">すべての種別</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* リセットボタン */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            リセット
          </Button>

          {/* 結果表示 */}
          <div className="ml-auto text-sm text-gray-600">
            {filteredTodos.length}件の作戦
          </div>
        </div>
      </div>

      {/* 作戦リスト */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <TodoList 
          todos={filteredTodos as TodoData[]} 
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteTodo}
        />
      </div>
    </div>
  )
}