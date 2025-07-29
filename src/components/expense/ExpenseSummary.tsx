// src/components/expense/ExpenseSummary.tsx
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface ExpenseData {
  id: string
  title: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  paidBy: string
}

interface ExpenseSummaryProps {
  expenses: ExpenseData[]
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth))
  
  const totalIncome = currentMonthExpenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0)
    
  const totalExpense = currentMonthExpenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0)
    
  const balance = totalIncome - totalExpense

  // カテゴリ別集計
  const categoryTotals = currentMonthExpenses
    .filter(e => e.type === 'expense')
    .reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const categoryIcons: Record<string, string> = {
    '食費': '🍙',
    '日用品': '🧻',
    '交通費': '🚖',
    '娯楽': '🍿',
    '外食': '🍽️',
    '光熱費': '💡',
    '家賃': '🏠',
    'その他': '❓',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* 今月の収入 */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">今月の収入</p>
            <p className="text-2xl font-bold">¥{totalIncome.toLocaleString()}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-200" />
        </div>
      </div>

      {/* 今月の支出 */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm">今月の支出</p>
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
              今月の残高
            </p>
            <p className="text-2xl font-bold">
              {balance >= 0 ? '+' : ''}¥{balance.toLocaleString()}
            </p>
          </div>
          <DollarSign className={`h-8 w-8 ${balance >= 0 ? 'text-blue-200' : 'text-orange-200'}`} />
        </div>
      </div>

      {/* トップカテゴリ */}
      {topCategories.length > 0 && (
        <div className="md:col-span-3 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">📊 今月の支出上位カテゴリ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topCategories.map(([category, amount], index) => (
              <div key={category} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">
                  {categoryIcons[category] || '❓'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{category}</p>
                  <p className="text-sm text-gray-600">¥{amount.toLocaleString()}</p>
                </div>
                <div className="text-lg font-bold text-gray-400">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}