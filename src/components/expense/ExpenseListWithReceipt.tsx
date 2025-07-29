// src/components/expense/ExpenseListWithReceipt.tsx
import { useState } from 'react'
import { Trash2, Receipt, Eye } from 'lucide-react'
import { Button } from '../ui/button'
import { ImageGallery } from '../common/ImageGallery'

interface ImageData {
  id: string
  file: File
  url: string
  compressed?: File
  compressedUrl?: string
  timestamp: string
}

interface ExpenseData {
  id: string
  title: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  paidBy: string
  receipt?: ImageData[]
}

interface ExpenseListWithReceiptProps {
  expenses: ExpenseData[]
  onDelete: (id: string) => void
}

export function ExpenseListWithReceipt({ expenses, onDelete }: ExpenseListWithReceiptProps) {
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null)

  const categoryIcons: Record<string, string> = {
    '食費': '🍙',
    '日用品': '🧻',
    '交通費': '🚖',
    '娯楽': '🍿',
    '外食': '🍽️',
    '光熱費': '💡',
    '家賃': '🏠',
    '収入': '💰',
    'その他': '❓',
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '食費': 'bg-green-100 text-green-800',
      '日用品': 'bg-blue-100 text-blue-800',
      '交通費': 'bg-yellow-100 text-yellow-800',
      '娯楽': 'bg-purple-100 text-purple-800',
      '外食': 'bg-red-100 text-red-800',
      '光熱費': 'bg-orange-100 text-orange-800',
      '家賃': 'bg-indigo-100 text-indigo-800',
      '収入': 'bg-green-100 text-green-800',
      'その他': 'bg-gray-100 text-gray-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  // 日付でグループ化
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = expense.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(expense)
    return groups
  }, {} as Record<string, ExpenseData[]>)

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a))

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          まだ記録がありません
        </h3>
        <p className="text-gray-600">
          最初の軍資金記録を追加してみましょう
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center">
            <h3 className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
              {new Date(date).toLocaleDateString('ja-JP', {
                month: 'long',
                day: 'numeric',
                weekday: 'short'
              })}
            </h3>
            <div className="flex-1 ml-4 border-t border-gray-200"></div>
          </div>

          <div className="space-y-2">
            {groupedExpenses[date].map((expense) => {
              const isExpanded = expandedExpense === expense.id
              const hasReceipt = expense.receipt && expense.receipt.length > 0

              return (
                <div
                  key={expense.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="text-xl">
                        {categoryIcons[expense.category] || '❓'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {expense.title}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(expense.category)}`}>
                            {expense.category}
                          </span>
                          {hasReceipt && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                              <Receipt className="h-3 w-3" />
                              {expense.receipt!.length}枚
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {expense.paidBy}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`font-semibold ${
                          expense.type === 'income' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {expense.type === 'income' ? '+' : '-'}¥{expense.amount.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {hasReceipt && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedExpense(isExpanded ? null : expense.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(expense.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* レシート画像表示 */}
                  {isExpanded && hasReceipt && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <ImageGallery
                        images={expense.receipt!}
                        title="📸 レシート・領収書"
                        emptyMessage="レシートがありません"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
