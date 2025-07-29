// src/components/todo/TodoStats.tsx
import { Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'

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

interface TodoStatsProps {
  todos: TodoData[]
}

export function TodoStats({ todos }: TodoStatsProps) {
  const totalTodos = todos.length
  const completedTodos = todos.filter(t => t.status === 'completed').length
  const inProgressTodos = todos.filter(t => t.status === 'in-progress').length
  const pendingTodos = todos.filter(t => t.status === 'pending').length
  
  // 期限切れの作戦を計算
  const overdueTodos = todos.filter(t => {
    if (t.status === 'completed' || !t.dueDate) return false
    return new Date(t.dueDate) < new Date()
  }).length

  // 緊急作戦を計算
  const urgentTodos = todos.filter(t => 
    t.priority === 'urgent' && t.status !== 'completed'
  ).length

  // 今日期限の作戦を計算
  const todayDueTodos = todos.filter(t => {
    if (t.status === 'completed' || !t.dueDate) return false
    const today = new Date().toISOString().split('T')[0]
    return t.dueDate === today
  }).length

  // 完了率を計算
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

  // カテゴリ別統計
  const categoryStats = todos.reduce((acc, todo) => {
    if (!acc[todo.category]) {
      acc[todo.category] = { total: 0, completed: 0 }
    }
    acc[todo.category].total++
    if (todo.status === 'completed') {
      acc[todo.category].completed++
    }
    return acc
  }, {} as Record<string, { total: number; completed: number }>)

  const topCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 3)

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* 全体統計 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">総作戦数</p>
            <p className="text-2xl font-bold">{totalTodos}</p>
            <p className="text-xs text-blue-200 mt-1">完了率 {completionRate}%</p>
          </div>
          <TrendingUp className="h-8 w-8 text-blue-200" />
        </div>
      </div>

      {/* 実行中 */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm">実行中</p>
            <p className="text-2xl font-bold">{inProgressTodos}</p>
            <p className="text-xs text-orange-200 mt-1">待機中 {pendingTodos}件</p>
          </div>
          <Clock className="h-8 w-8 text-orange-200" />
        </div>
      </div>

      {/* 完了 */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">完了済み</p>
            <p className="text-2xl font-bold">{completedTodos}</p>
            <p className="text-xs text-green-200 mt-1">今日期限 {todayDueTodos}件</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-200" />
        </div>
      </div>

      {/* 警告 */}
      <div className={`bg-gradient-to-r ${
        overdueTodos > 0 || urgentTodos > 0
          ? 'from-red-500 to-red-600'
          : 'from-gray-500 to-gray-600'
      } rounded-lg p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`${overdueTodos > 0 || urgentTodos > 0 ? 'text-red-100' : 'text-gray-100'} text-sm`}>
              要注意
            </p>
            <p className="text-2xl font-bold">{overdueTodos + urgentTodos}</p>
            <p className={`text-xs ${overdueTodos > 0 || urgentTodos > 0 ? 'text-red-200' : 'text-gray-200'} mt-1`}>
              期限切れ {overdueTodos}件・緊急 {urgentTodos}件
            </p>
          </div>
          <AlertTriangle className={`h-8 w-8 ${overdueTodos > 0 || urgentTodos > 0 ? 'text-red-200' : 'text-gray-200'}`} />
        </div>
      </div>

      {/* カテゴリ別統計 */}
      {topCategories.length > 0 && (
        <div className="md:col-span-2 lg:col-span-4 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">📊 作戦種別統計</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topCategories.map(([category, stats]) => {
              const completionRate = Math.round((stats.completed / stats.total) * 100)
              return (
                <div key={category} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{category}</p>
                    <p className="text-sm text-gray-600">
                      {stats.completed}/{stats.total} 完了 ({completionRate}%)
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}