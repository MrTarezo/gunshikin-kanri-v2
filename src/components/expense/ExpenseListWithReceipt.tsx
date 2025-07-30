// src/components/expense/ExpenseListWithReceipt.tsx
import { useState } from 'react'
import { Trash2, Receipt, Edit } from 'lucide-react'
import { Button } from '../ui/button'
import { ImageGallery } from '../common/ImageGallery'
import { ExpenseEditForm } from './ExpenseEditForm'

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
  comment?: string
  settled: boolean
  receipt?: string
  createdAt?: string
  updatedAt?: string
  receiptImages?: ImageData[] // 表示用
}

interface ExpenseListWithReceiptProps {
  expenses: ExpenseData[]
  onDelete: (id: string) => void
  onUpdate?: (id: string, data: Partial<ExpenseData>) => Promise<{ success: boolean; message: string }>
  isLoading?: boolean
}

export function ExpenseListWithReceipt({ expenses, onDelete, onUpdate, isLoading = false }: ExpenseListWithReceiptProps) {
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null)
  const [editingExpense, setEditingExpense] = useState<ExpenseData | null>(null)

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

  // カテゴリ別の色設定（カード背景用）- 全て異なる色で識別しやすく
  const getCategoryColor = (category: string, type?: string) => {
    const colors: Record<string, string> = {
      '食費': 'from-lime-50 to-lime-100 border-lime-200',        // 🍙 ライム（自然な食材）
      '日用品': 'from-sky-50 to-sky-100 border-sky-200',         // 🧻 スカイブルー（清潔感）
      '交通費': 'from-amber-50 to-amber-100 border-amber-200',   // 🚖 琥珀色（エネルギー）
      '娯楽': 'from-violet-50 to-violet-100 border-violet-200',  // 🍿 バイオレット（楽しさ）
      '外食': 'from-rose-50 to-rose-100 border-rose-200',       // 🍽️ ローズ（食欲）
      '光熱費': 'from-orange-50 to-orange-100 border-orange-200', // 💡 オレンジ（暖かさ）
      '家賃': 'from-slate-50 to-slate-100 border-slate-200',    // 🏠 スレート（安定）
      '収入': 'from-teal-50 to-teal-100 border-teal-300',       // 💰 ティール（豊かさ）
      'その他': 'from-neutral-50 to-neutral-100 border-neutral-200', // ❓ ニュートラル
    }
    
    // 収入の場合は特別に金色系の豪華なスタイル
    if (type === 'income') {
      return 'from-yellow-100 to-amber-50 border-yellow-300 shadow-yellow-100/50'
    }
    
    return colors[category] || 'from-neutral-50 to-neutral-100 border-neutral-200'
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
              const hasReceipt = (expense.receiptImages && expense.receiptImages.length > 0) || 
                                ((expense as any).receiptUrls && (expense as any).receiptUrls.length > 0)

              return (
                <div
                  key={expense.id}
                  className={`bg-gradient-to-br ${getCategoryColor(expense.category, expense.type)} rounded-lg border p-4 transition-all ${
                    hasReceipt 
                      ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' 
                      : 'hover:shadow-sm'
                  } ${expense.type === 'income' ? 'shadow-sm' : ''}`}
                  onClick={() => hasReceipt && setExpandedExpense(isExpanded ? null : expense.id)}
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
                          {hasReceipt && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1 select-none">
                              <Receipt className="h-3 w-3" />
                              {isExpanded && <span className="ml-1 text-blue-600">▼</span>}
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
                        {onUpdate && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingExpense(expense)
                            }}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(expense.id)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* レシート画像表示 */}
                  {isExpanded && hasReceipt && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {expense.receiptImages ? (
                        <ImageGallery
                          images={expense.receiptImages}
                          title="📸 レシート・領収書"
                          emptyMessage="レシートがありません"
                        />
                      ) : (expense as any).receiptUrls ? (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-900">📸 レシート・領収書 ({(expense as any).receiptUrls.length}枚)</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {(expense as any).receiptUrls.map((url: string, index: number) => (
                              <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all">
                                <img
                                  src={url}
                                  alt={`レシート ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onClick={() => window.open(url, '_blank')}
                                  style={{ cursor: 'pointer' }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* 編集フォーム */}
      {editingExpense && onUpdate && (
        <ExpenseEditForm
          expense={editingExpense}
          onSave={onUpdate}
          onCancel={() => setEditingExpense(null)}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
