// src/components/expense/ExpenseFormWithReceipt.tsx
import { useState } from 'react'
import { Button } from '../ui/button'
import { ImageCapture } from '../common/ImageCapture'
import { Plus, X, Receipt, Calendar, DollarSign } from 'lucide-react'

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

interface ExpenseFormWithReceiptProps {
  onAdd: (expense: Omit<ExpenseData, 'id'>) => void
  nickname: string
}

export function ExpenseFormWithReceipt({ onAdd, nickname }: ExpenseFormWithReceiptProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [receiptImages, setReceiptImages] = useState<ImageData[]>([])
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
  })

  const categories = {
    expense: [
      { value: '食費', label: '🍙 食費', color: 'bg-green-100 text-green-800' },
      { value: '日用品', label: '🧻 日用品', color: 'bg-blue-100 text-blue-800' },
      { value: '交通費', label: '🚖 交通費', color: 'bg-yellow-100 text-yellow-800' },
      { value: '娯楽', label: '🍿 娯楽', color: 'bg-purple-100 text-purple-800' },
      { value: '外食', label: '🍽️ 外食', color: 'bg-red-100 text-red-800' },
      { value: '光熱費', label: '💡 光熱費', color: 'bg-orange-100 text-orange-800' },
      { value: '家賃', label: '🏠 家賃', color: 'bg-indigo-100 text-indigo-800' },
      { value: 'その他', label: '❓ その他', color: 'bg-gray-100 text-gray-800' },
    ],
    income: [
      { value: '収入', label: '💰 収入', color: 'bg-green-100 text-green-800' },
    ]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.amount || !formData.category) return

    onAdd({
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      date: formData.date,
      paidBy: nickname,
      receipt: receiptImages.length > 0 ? receiptImages : undefined,
    })

    // フォームリセット
    setFormData({
      title: '',
      amount: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    })
    setReceiptImages([])
    setIsOpen(false)
  }

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData({
      ...formData,
      type,
      category: type === 'income' ? '収入' : '',
    })
  }

  const handleImageCapture = (imageData: ImageData) => {
    setReceiptImages(prev => [...prev, imageData])
  }

  const handleImageRemove = (id: string) => {
    setReceiptImages(prev => prev.filter(img => img.id !== id))
  }

  // フォームの有効性をチェック
  const isFormValid = formData.title.trim().length > 0 && 
                     parseFloat(formData.amount) > 0 && 
                     formData.category.trim().length > 0

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
      >
        <Plus className="h-4 w-4" />
        軍資金記録
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            💰 軍資金記録
            {receiptImages.length > 0 && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                📸 {receiptImages.length}枚
              </span>
            )}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 収入/支出タイプ */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              記録タイプ
            </label>
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex-1 transition-all ${
                  formData.type === 'expense'
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                🧾 支出
                {formData.type === 'expense' && (
                  <span className="ml-2 text-xs bg-red-500 px-1.5 py-0.5 rounded-full">選択中</span>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex-1 transition-all ${
                  formData.type === 'income'
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                💰 収入
                {formData.type === 'income' && (
                  <span className="ml-2 text-xs bg-green-500 px-1.5 py-0.5 rounded-full">選択中</span>
                )}
              </Button>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* タイトル */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="inline h-4 w-4 mr-1" />
                内容 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例: スーパーマーケット"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 金額 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                金額 (円) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="3500"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 日付 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                日付 *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">カテゴリを選択</option>
              {categories[formData.type].map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* レシート撮影 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Receipt className="inline h-4 w-4 mr-1" />
              レシート・領収書
            </label>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <ImageCapture
                onImageCapture={handleImageCapture}
                onImageRemove={handleImageRemove}
                images={receiptImages}
                maxImages={3}
                maxSizeMB={5}
                className="bg-white rounded border"
              />
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid}
              className={`flex-1 transition-all ${
                isFormValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              💰 記録する
              {!isFormValid && (
                <span className="ml-2 text-xs bg-gray-400 px-1.5 py-0.5 rounded-full">
                  入力不完全
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
