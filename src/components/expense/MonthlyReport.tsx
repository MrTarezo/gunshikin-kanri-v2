// src/components/expense/MonthlyReport.tsx
import { TrendingUp, TrendingDown, DollarSign, User, Calendar, BarChart3 } from 'lucide-react'

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
}

export function MonthlyReport({ expenses, targetMonth }: MonthlyReportProps) {
  // 対象月の設定（デフォルトは前月）
  const getTargetMonth = () => {
    if (targetMonth) return targetMonth
    
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return lastMonth.toISOString().slice(0, 7)
  }

  const month = getTargetMonth()
  const monthName = new Date(month + '-01').toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long' 
  })

  // 対象月のデータをフィルタリング
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(month))
  
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

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="h-6 w-6 text-yellow-600" />
        <h2 className="text-2xl font-bold text-gray-800">{monthName}の支出統計</h2>
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
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">ユーザー別支出</h3>
          </div>
          <div className="space-y-3">
            {sortedUsers.map(([user, amount], index) => {
              const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
              return (
                <div key={user} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">
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
                          className="bg-blue-500 h-2 rounded-full" 
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
        </div>
      )}

      {/* カテゴリ別支出統計 */}
      {topCategories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">カテゴリ別支出</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topCategories.map(([category, amount], index) => {
              const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
              return (
                <div key={category} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{category}</span>
                      <span className="text-sm text-gray-500">{percentage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="font-bold">¥{amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-400">
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
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">データがありません</h3>
          <p className="text-gray-500">{monthName}の支出データが見つかりませんでした。</p>
        </div>
      )}
    </div>
  )
}