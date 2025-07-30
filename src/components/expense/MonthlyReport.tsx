// src/components/expense/MonthlyReport.tsx
import { useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, User, Calendar, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'

interface ExpenseData {
  id: string
  title: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  paidBy: string
}

interface MonthlyReportProps {
  expenses: ExpenseData[]
  targetMonth?: string // YYYY-MM format, defaults to last month
  onMonthChange?: (month: string) => void // 月選択の変更コールバック
  selectedUser?: string // 選択されたユーザー（'all'または特定のユーザー名）
  onUserChange?: (user: string) => void // ユーザー選択の変更コールバック
}

export function MonthlyReport({ 
  expenses, 
  targetMonth, 
  onMonthChange,
  selectedUser = 'all',
  onUserChange 
}: MonthlyReportProps) {
  // 対象月の設定（外部からの状態を優先、フォールバックは前月）  
  const getDefaultMonth = () => {
    if (targetMonth) return targetMonth
    
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return lastMonth.toISOString().slice(0, 7)
  }

  const month = targetMonth || getDefaultMonth()
  
  const monthName = new Date(month + '-01').toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long' 
  })

  // 対象月のデータをフィルタリング + ユーザーフィルタ
  const monthlyExpenses = expenses
    .filter(e => e.date.startsWith(month))
    .filter(e => selectedUser === 'all' || e.paidBy === selectedUser)
  
  const totalIncome = monthlyExpenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0)
    
  const totalExpense = monthlyExpenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0)
    
  const balance = totalIncome - totalExpense

  // ユーザー別支出統計
  const userExpenses = monthlyExpenses
    .filter(e => e.type === 'expense')
    .reduce((acc, expense) => {
      acc[expense.paidBy] = (acc[expense.paidBy] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

  const sortedUsers = Object.entries(userExpenses)
    .sort(([,a], [,b]) => b - a)

  // カテゴリ別支出統計
  const categoryTotals = monthlyExpenses
    .filter(e => e.type === 'expense')
    .reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  const categoryIcons: Record<string, string> = {
    '🍙 食費': '🍙',
    '🧻 日用品': '🧻',
    '🚖 交通費': '🚖',
    '🍿 娯楽': '🍿',
    '🍽️ 外食': '🍽️',
    '💡 光熱費': '💡',
    '🏠 家賃': '🏠',
    '❓ その他': '❓',
  }

  // カテゴリ名からアイコンを取得
  const getCategoryIcon = (category: string) => {
    const found = Object.entries(categoryIcons).find(([key]) => 
      category.includes(key.slice(2)) || key.includes(category)
    )
    return found ? found[1] : '❓'
  }

  // ユーザー別カラーパレット
  const userColors = [
    { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
    { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
    { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
    { bg: 'bg-pink-500', light: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' },
    { bg: 'bg-indigo-500', light: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
  ]

  const getUserColor = (index: number) => userColors[index % userColors.length]

  // 年月ナビゲーション機能
  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentDate = new Date(month + '-01')
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1)
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
    const newMonth = currentDate.toISOString().slice(0, 7)
    onMonthChange?.(newMonth)
  }

  // 利用可能な月のリストを生成（支出データがある月 + 現在選択中の月）
  const getAvailableMonths = () => {
    const months = new Set(expenses.map(e => e.date.slice(0, 7)))
    // 現在選択中の月も必ず含める
    months.add(month)
    return Array.from(months).sort().reverse()
  }

  const availableMonths = getAvailableMonths()

  return (
    <div className="space-y-6">
      {/* ヘッダーと年月選択 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-800">月次統計レポート</h2>
          </div>
        </div>

        {/* 年月選択UI */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {/* モバイル対応: 縦並びレイアウト */}
          <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* ナビゲーションボタン */}
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  title="前月"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                
                <div className="text-lg font-semibold text-gray-900 min-w-[120px] text-center">
                  {monthName}
                </div>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  title="翌月"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* 月選択ドロップダウン */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <span className="text-sm text-gray-600 text-center sm:text-left">月を選択:</span>
                <select
                  value={availableMonths.includes(month) ? month : availableMonths[0] || month}
                  onChange={(e) => onMonthChange?.(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                >
                  {availableMonths.map(monthOption => {
                    const date = new Date(monthOption + '-01')
                    const label = date.toLocaleDateString('ja-JP', { 
                      year: 'numeric', 
                      month: 'short' 
                    })
                    return (
                      <option key={monthOption} value={monthOption}>{label}</option>
                    )
                  })}
                </select>
              </div>
            </div>

            {/* 現在表示中のデータ件数 */}
            <div className="text-sm text-gray-500 text-center md:text-right">
              {monthlyExpenses.length}件のデータ
            </div>
          </div>

          {/* ユーザーフィルタ */}
          {onUserChange && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 space-y-2 sm:space-y-0">
              <span className="text-sm font-medium text-gray-700">表示するユーザー:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onUserChange('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedUser === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  すべて
                </button>
                {Array.from(new Set(expenses.map(e => e.paidBy))).map((user, index) => {
                  const colors = getUserColor(index)
                  return (
                    <button
                      key={user}
                      onClick={() => onUserChange(user)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 ${
                        selectedUser === user
                          ? `${colors.bg} text-white`
                          : `${colors.light} ${colors.text} hover:${colors.bg} hover:text-white`
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${selectedUser === user ? 'bg-white' : colors.bg}`}></div>
                      <span>{user}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 月次サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 収入 */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">収入</p>
              <p className="text-2xl font-bold">¥{totalIncome.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
        </div>

        {/* 支出 */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">支出</p>
              <p className="text-2xl font-bold">¥{totalExpense.toLocaleString()}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-200" />
          </div>
        </div>

        {/* 残高 */}
        <div className={`bg-gradient-to-r ${
          balance >= 0 
            ? 'from-blue-500 to-blue-600' 
            : 'from-orange-500 to-orange-600'
        } rounded-lg p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${balance >= 0 ? 'text-blue-100' : 'text-orange-100'} text-sm`}>
                残高
              </p>
              <p className="text-2xl font-bold">
                {balance >= 0 ? '+' : ''}¥{balance.toLocaleString()}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${balance >= 0 ? 'text-blue-200' : 'text-orange-200'}`} />
          </div>
        </div>
      </div>

      {/* ユーザー別支出統計 */}
      {sortedUsers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">ユーザー別支出</h3>
            </div>
            
            {/* ユーザー凡例 - モバイル対応 */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {sortedUsers.map(([user], index) => {
                const colors = getUserColor(index)
                return (
                  <div key={user} className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                    <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
                    <span className="text-sm font-medium text-gray-700">{user}</span>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="space-y-3">
            {sortedUsers.map(([user, amount], index) => {
              const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
              const colors = getUserColor(index)
              return (
                <div key={user} className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 ${colors.light} rounded-full flex items-center justify-center border ${colors.border}`}>
                    <span className={`text-sm font-semibold ${colors.text}`}>
                      {user.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{user}</span>
                      <span className="text-sm text-gray-500">{percentage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className={`${colors.bg} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="font-bold">¥{amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 合計表示 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">合計支出</span>
              <span className="text-lg font-bold text-gray-900">¥{totalExpense.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* カテゴリ別支出統計 */}
      {topCategories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">カテゴリ別支出</h3>
          </div>
          <div className="space-y-3 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-4 sm:space-y-0">
            {topCategories.map(([category, amount], index) => {
              const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
              return (
                <div key={category} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl flex-shrink-0">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium truncate pr-2">{category}</span>
                      <span className="text-sm text-gray-500 flex-shrink-0">{percentage}%</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-sm sm:text-base flex-shrink-0">¥{amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-400 flex-shrink-0">
                    #{index + 1}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* データがない場合 */}
      {monthlyExpenses.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
          <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">データがありません</h3>
          <p className="text-sm sm:text-base text-gray-500">{monthName}の支出データが見つかりませんでした。</p>
        </div>
      )}
    </div>
  )
}