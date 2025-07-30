// src/components/expense/ExpenseEditForm.tsx
import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { X, Save, Calendar, DollarSign, User, Tag } from 'lucide-react'

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
}

interface ExpenseEditFormProps {
  expense: ExpenseData
  onSave: (id: string, data: Partial<ExpenseData>) => Promise<{ success: boolean; message: string }>
  onCancel: () => void
  isLoading?: boolean
}

const categories = [
  '食費', '日用品', '交通費', '娯楽', '外食', 
  '光熱費', '家賃', 'その他'
]

const payers = ['夫', '妻', '共通']

export function ExpenseEditForm({ expense, onSave, onCancel, isLoading = false }: ExpenseEditFormProps) {
  const [formData, setFormData] = useState({
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    type: expense.type,
    date: expense.date,
    paidBy: expense.paidBy,
    comment: expense.comment || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = '金額は1円以上で入力してください'
    }

    if (!formData.date) {
      newErrors.date = '日付は必須です'
    }

    if (!formData.paidBy) {
      newErrors.paidBy = '支払者は必須です'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const result = await onSave(expense.id, formData)
      if (result.success) {
        onCancel() // 成功時はフォームを閉じる
      }
    } catch (error) {
      console.error('保存エラー:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            ✏️ 支出編集
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag className="inline h-4 w-4 mr-1" />
              タイトル
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="支出の内容を入力"
              disabled={isLoading}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* 金額 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="inline h-4 w-4 mr-1" />
              金額
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="1"
              disabled={isLoading}
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="">選択してください</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 収支タイプ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              収支タイプ
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="mr-2"
                  disabled={isLoading}
                />
                支出
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="mr-2"
                  disabled={isLoading}
                />
                収入
              </label>
            </div>
          </div>

          {/* 日付 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              日付
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* 支払者 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="inline h-4 w-4 mr-1" />
              支払者
            </label>
            <select
              value={formData.paidBy}
              onChange={(e) => handleInputChange('paidBy', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.paidBy ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">選択してください</option>
              {payers.map(payer => (
                <option key={payer} value={payer}>{payer}</option>
              ))}
            </select>
            {errors.paidBy && <p className="text-red-500 text-xs mt-1">{errors.paidBy}</p>}
          </div>

          {/* コメント */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              コメント（任意）
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="メモがあれば記入"
              disabled={isLoading}
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}