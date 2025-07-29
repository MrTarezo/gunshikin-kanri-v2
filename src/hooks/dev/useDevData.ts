// src/hooks/dev/useDevData.ts - 開発用データフック
import { useState } from 'react'

// モックデータ
const mockExpenses = [
  {
    id: '1',
    title: 'スーパーマーケット',
    amount: 3500,
    category: '食費',
    type: 'expense' as const,
    date: '2025-01-20',
    paidBy: 'ポー',
    settled: false,
    comment: '',
    receipt: '',
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
    settlementMonth: '2025-01'
  },
  {
    id: '2',
    title: '給与',
    amount: 350000,
    category: '収入',
    type: 'income' as const,
    date: '2025-01-01',
    paidBy: 'ポー',
    settled: false,
    comment: '',
    receipt: '',
    createdAt: '2025-01-01T09:00:00Z',
    updatedAt: '2025-01-01T09:00:00Z',
    settlementMonth: '2025-01'
  }
]

const mockTodos = [
  {
    id: '1',
    title: '食材補給作戦',
    done: false,
    owner: 'dev-user',
    assignee: 'ポー',
    dueDate: '2025-01-22',
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z'
  },
  {
    id: '2',
    title: '冷蔵庫在庫確認',
    done: true,
    owner: 'dev-user',
    assignee: 'ポー',
    dueDate: '2025-01-20',
    createdAt: '2025-01-19T09:00:00Z',
    updatedAt: '2025-01-20T08:00:00Z'
  }
]

const mockFridgeItems = [
  {
    id: '1',
    name: 'キャベツ',
    addedDate: '2025-01-18',
    location: 'vegetable',
    isUrgent: false,
    image: ''
  },
  {
    id: '2',
    name: '牛肉',
    addedDate: '2025-01-19',
    location: 'fridge-main',
    isUrgent: true,
    image: ''
  }
]

// 開発用Expensesフック
export function useDevExpenses() {
  const [expenses, setExpenses] = useState(mockExpenses)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  const addExpense = async (data: any) => {
    const newExpense = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settled: false,
      comment: '',
      receipt: '',
      settlementMonth: new Date().toISOString().slice(0, 7)
    }
    setExpenses(prev => [newExpense, ...prev])
    return { success: true, message: '支出を記録しました（開発モード）' }
  }

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
    return { success: true, message: '支出を削除しました（開発モード）' }
  }

  const getExpenseStats = (expenseList = expenses) => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const currentMonthExpenses = expenseList.filter(e => e.date.startsWith(currentMonth))
    
    const totalIncome = currentMonthExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0)
    const totalExpense = currentMonthExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
    const balance = totalIncome - totalExpense
    
    return {
      totalIncome,
      totalExpense,
      balance,
      receiptRate: 75, // モック値
      withReceiptCount: 2,
      totalCount: expenseList.length,
      categoryTotals: { '食費': 3500, '収入': 350000 }
    }
  }

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    deleteExpense,
    fetchExpenses,
    getExpenseStats,
    setError
  }
}

// 開発用Todosフック
export function useDevTodos() {
  const [todos, setTodos] = useState(mockTodos)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTodos = async () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 500)
  }

  const addTodo = async (data: any) => {
    const newTodo = {
      ...data,
      id: Date.now().toString(),
      done: false,
      owner: 'dev-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setTodos(prev => [newTodo, ...prev])
    return { success: true, message: '作戦を立案しました（開発モード）' }
  }

  const toggleTodoStatus = async (id: string, status: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, done: status === 'completed' } : todo
    ))
    return { success: true, message: 'ステータスを更新しました（開発モード）' }
  }

  const deleteTodo = async (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
    return { success: true, message: '作戦を削除しました（開発モード）' }
  }

  const getTodoStats = (todoList = todos) => {
    const totalTodos = todoList.length
    const completedTodos = todoList.filter(t => t.done).length
    const urgentItems = 1 // モック値
    
    return {
      totalTodos,
      completedTodos,
      inProgressTodos: 0,
      pendingTodos: totalTodos - completedTodos,
      urgentItems,
      completionRate: Math.round((completedTodos / totalTodos) * 100),
      categoryStats: {}
    }
  }

  return {
    todos: todos.map(todo => ({
      ...todo,
      priority: 'medium' as const,
      status: todo.done ? 'completed' as const : 'pending' as const,
      category: '一般作戦',
      description: ''
    })),
    isLoading,
    error,
    addTodo,
    toggleTodoStatus,
    deleteTodo,
    fetchTodos,
    getTodoStats,
    setError
  }
}

// 開発用Fridgeフック
export function useDevFridge() {
  const [fridgeItems, setFridgeItems] = useState(mockFridgeItems)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFridgeItems = async () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 500)
  }

  const addFridgeItem = async (data: any) => {
    const newItem = {
      ...data,
      id: Date.now().toString(),
      addedDate: new Date().toISOString().split('T')[0],
      isUrgent: false,
      image: ''
    }
    setFridgeItems(prev => [newItem, ...prev])
    return { success: true, message: '補給品を登録しました（開発モード）' }
  }

  const consumeItem = async (id: string) => {
    return { success: true, message: '補給品を消費済みにしました（開発モード）' }
  }

  const deleteFridgeItem = async (id: string) => {
    setFridgeItems(prev => prev.filter(i => i.id !== id))
    return { success: true, message: '補給品を削除しました（開発モード）' }
  }

  const getFridgeStats = () => {
    return {
      totalItems: fridgeItems.length,
      urgentItems: 1, // モック値
      imageRate: 50,
      withImageCount: 1,
      totalCount: fridgeItems.length
    }
  }

  const getExpiryStatus = () => ({
    status: 'fresh',
    label: '✅ 新鮮',
    color: 'bg-green-100 text-green-800'
  })

  return {
    fridgeItems: fridgeItems.map(item => ({
      ...item,
      category: '野菜',
      quantity: 1,
      unit: '個',
      purchaseDate: item.addedDate,
      expiryDate: '',
      notes: '',
      consumed: false
    })),
    isLoading,
    error,
    addFridgeItem,
    consumeItem,
    deleteFridgeItem,
    fetchFridgeItems,
    getFridgeStats,
    getExpiryStatus,
    setError
  }
}