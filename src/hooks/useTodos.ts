// src/hooks/useTodos.ts
import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import { getCurrentUser } from 'aws-amplify/auth'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

interface TodoFormData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee: string
  dueDate?: string
  category: string
}

// Todoアイテムの型定義
interface EnhancedTodo {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in-progress' | 'completed'
  category: string
  description?: string
  completedAt?: string
  assignee: string
  dueDate?: string
  done: boolean
  owner?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Todo管理フック
 * Amplify Gen 2 + DynamoDB統合（既存スキーマ互換）
 */
export function useTodos() {
  const [todos, setTodos] = useState<EnhancedTodo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Todoデータの取得
  const fetchTodos = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('⚔️ Todo データ取得開始')
      const { data, errors } = await client.models.Todo.list()
      
      if (errors && errors.length > 0) {
        console.error('⚔️ データ取得GraphQLエラー:', errors)
        throw new Error(`GraphQL errors: ${errors.map(e => e.message).join(', ')}`)
      }

      // 既存スキーマから新スキーマへの変換
      const enhancedTodos: EnhancedTodo[] = data.map(todo => ({
        id: todo.id || '',
        title: todo.title || '',
        priority: 'medium' as const, // デフォルト値（後で拡張可能）
        status: todo.done ? 'completed' as const : 'pending' as const,
        category: '一般作戦', // デフォルト値
        description: '', // 既存スキーマにはないため空文字
        completedAt: todo.done ? (todo.updatedAt || undefined) : undefined,
        assignee: todo.assignee || 'Unknown',
        dueDate: todo.dueDate || undefined,
        done: todo.done || false,
        owner: todo.owner || undefined,
        createdAt: todo.createdAt || undefined,
        updatedAt: todo.updatedAt || undefined,
      }))

      // 作成日でソート（新しい順）
      const sortedTodos = enhancedTodos.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )

      setTodos(sortedTodos)
    } catch (err: any) {
      console.error('Todoデータの取得に失敗:', err)
      setError('作戦データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 初期化時にデータを取得
  useEffect(() => {
    fetchTodos()
  }, [])

  // Todoの追加
  const addTodo = async (todoData: TodoFormData) => {
    try {
      setError(null)

      // 現在のユーザー情報を取得
      const user = await getCurrentUser()

      const { data: newTodo } = await client.models.Todo.create({
        title: todoData.title,
        done: false,
        owner: user.username,
        assignee: todoData.assignee,
        dueDate: todoData.dueDate || null,
      })

      if (!newTodo) {
        throw new Error('作戦の作成に失敗しました')
      }

      // 拡張データでローカル状態を更新
      const enhancedTodo: EnhancedTodo = {
        id: newTodo.id || '',
        title: newTodo.title || '',
        done: newTodo.done || false,
        owner: newTodo.owner || undefined,
        dueDate: newTodo.dueDate || undefined,
        assignee: newTodo.assignee || '',
        createdAt: newTodo.createdAt || undefined,
        updatedAt: newTodo.updatedAt || undefined,
        priority: todoData.priority,
        status: 'pending',
        category: todoData.category,
        description: todoData.description || '',
        completedAt: undefined,
      }
      
      setTodos(prev => [enhancedTodo, ...prev])

      return {
        success: true,
        data: enhancedTodo,
        message: '作戦を立案しました'
      }
    } catch (err: any) {
      console.error('Todoの追加に失敗:', err)
      const message = err.message || '作戦の立案に失敗しました'
      setError(message)
      return {
        success: false,
        message
      }
    }
  }

  // Todoステータスの変更
  const toggleTodoStatus = async (id: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      setError(null)

      const isDone = newStatus === 'completed'

      await client.models.Todo.update({
        id,
        done: isDone,
      })

      // ローカル状態を更新
      setTodos(prev => prev.map(todo => {
        if (todo.id === id) {
          return {
            ...todo,
            done: isDone,
            status: newStatus,
            completedAt: isDone ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          }
        }
        return todo
      }))

      const statusMessages = {
        pending: '待機中に変更しました',
        'in-progress': '実行中に変更しました',
        completed: '作戦完了しました',
      }

      return {
        success: true,
        message: statusMessages[newStatus]
      }
    } catch (err: any) {
      console.error('Todoステータスの更新に失敗:', err)
      const message = err.message || 'ステータスの更新に失敗しました'
      setError(message)
      return {
        success: false,
        message
      }
    }
  }

  // Todoの削除
  const deleteTodo = async (id: string) => {
    try {
      setError(null)

      await client.models.Todo.delete({
        id
      })

      // ローカル状態を更新
      setTodos(prev => prev.filter(todo => todo.id !== id))

      return {
        success: true,
        message: '作戦を削除しました'
      }
    } catch (err: any) {
      console.error('Todoの削除に失敗:', err)
      const message = err.message || '作戦の削除に失敗しました'
      setError(message)
      return {
        success: false,
        message
      }
    }
  }

  // 統計情報の計算
  const getTodoStats = (todoList: EnhancedTodo[] = todos) => {
    const totalTodos = todoList.length
    const completedTodos = todoList.filter(t => t.status === 'completed').length
    const inProgressTodos = todoList.filter(t => t.status === 'in-progress').length
    const pendingTodos = todoList.filter(t => t.status === 'pending').length
    
    // 期限切れの作戦を計算
    const today = new Date()
    const overdueTodos = todoList.filter(t => {
      if (t.status === 'completed' || !t.dueDate) return false
      return new Date(t.dueDate) < today
    }).length

    // 緊急作戦を計算
    const urgentTodos = todoList.filter(t => 
      t.priority === 'urgent' && t.status !== 'completed'
    ).length

    // 今日期限の作戦を計算
    const todayDueTodos = todoList.filter(t => {
      if (t.status === 'completed' || !t.dueDate) return false
      const todayStr = today.toISOString().split('T')[0]
      return t.dueDate === todayStr
    }).length

    // 完了率を計算
    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

    // カテゴリ別統計
    const categoryStats = todoList.reduce((acc, todo) => {
      const category = todo.category || '一般作戦'
      if (!acc[category]) {
        acc[category] = { total: 0, completed: 0 }
      }
      acc[category].total++
      if (todo.status === 'completed') {
        acc[category].completed++
      }
      return acc
    }, {} as Record<string, { total: number; completed: number }>)

    return {
      totalTodos,
      completedTodos,
      inProgressTodos,
      pendingTodos,
      overdueTodos,
      urgentTodos,
      todayDueTodos,
      completionRate,
      categoryStats,
      urgentItems: overdueTodos + urgentTodos, // 緊急対応が必要なアイテム数
    }
  }

  // フィルタリング関数
  const filterTodos = (
    todoList: EnhancedTodo[] = todos,
    filters: {
      status?: 'all' | 'pending' | 'in-progress' | 'completed'
      priority?: 'all' | 'low' | 'medium' | 'high' | 'urgent'
      assignee?: string
      category?: string
    }
  ) => {
    return todoList.filter(todo => {
      if (filters.status && filters.status !== 'all' && todo.status !== filters.status) return false
      if (filters.priority && filters.priority !== 'all' && todo.priority !== filters.priority) return false
      if (filters.assignee && filters.assignee !== 'all' && todo.assignee !== filters.assignee) return false
      if (filters.category && filters.category !== 'all' && todo.category !== filters.category) return false
      return true
    })
  }

  return {
    todos,
    isLoading,
    error,
    addTodo,
    toggleTodoStatus,
    deleteTodo,
    fetchTodos,
    getTodoStats,
    filterTodos,
    setError, // エラーのクリア用
  }
}