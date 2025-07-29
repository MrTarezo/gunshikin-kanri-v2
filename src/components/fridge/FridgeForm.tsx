// src/components/fridge/FridgeForm.tsx
import { useState } from 'react'
import { Button } from '../ui/button'
import { ImageCapture } from '../common/ImageCapture'
import { Plus, X, Package, Calendar, MapPin, Thermometer } from 'lucide-react'

interface ImageData {
  id: string
  file: File
  url: string
  compressed?: File
  compressedUrl?: string
  timestamp: string
}

interface FridgeItemData {
  id: string
  name: string
  category: string
  location: string
  quantity: number
  unit: string
  purchaseDate: string
  expiryDate: string
  notes: string
  images?: ImageData[]
  createdAt: string
}

interface FridgeFormProps {
  onAdd: (item: Omit<FridgeItemData, 'id' | 'createdAt'>) => void
}

export function FridgeForm({ onAdd }: FridgeFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [itemImages, setItemImages] = useState<ImageData[]>([])
  const [formData, setFormData] = useState({
    name: '',
    category: '野菜',
    location: 'fridge-main',
    quantity: 1,
    unit: '個',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    notes: '',
  })

  const categories = [
    { value: '野菜', label: '🥕 野菜', color: 'bg-green-100 text-green-800' },
    { value: '肉類', label: '🥩 肉類', color: 'bg-red-100 text-red-800' },
    { value: '魚類', label: '🐟 魚類', color: 'bg-blue-100 text-blue-800' },
    { value: '乳製品', label: '🥛 乳製品', color: 'bg-yellow-100 text-yellow-800' },
    { value: '調味料', label: '🧂 調味料', color: 'bg-purple-100 text-purple-800' },
    { value: '冷凍食品', label: '🍱 冷凍食品', color: 'bg-indigo-100 text-indigo-800' },
    { value: '飲み物', label: '🥤 飲み物', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'その他', label: '📦 その他', color: 'bg-gray-100 text-gray-800' },
  ]

  const locations = [
    { 
      value: 'fridge-main', 
      label: '🍱 冷蔵室', 
      temp: '2-5°C',
      description: 'メイン冷蔵庫',
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      value: 'vegetable', 
      label: '🥕 野菜室', 
      temp: '3-7°C',
      description: '野菜・果物専用',
      color: 'bg-green-50 border-green-200'
    },
    { 
      value: 'freezer-top', 
      label: '🍦 冷凍庫(上段)', 
      temp: '-18°C',
      description: 'アイス・冷凍食品',
      color: 'bg-cyan-50 border-cyan-200'
    },
    { 
      value: 'freezer-middle', 
      label: '❄️ 冷凍庫(中段)', 
      temp: '-18°C',
      description: '肉類・魚類',
      color: 'bg-cyan-50 border-cyan-200'
    },
    { 
      value: 'freezer-bottom', 
      label: '🧊 冷凍庫(下段)', 
      temp: '-18°C',
      description: '作り置き・冷凍野菜',
      color: 'bg-cyan-50 border-cyan-200'
    },
    { 
      value: 'door', 
      label: '🚪 ドア棚', 
      temp: '5-8°C',
      description: '調味料・飲み物',
      color: 'bg-orange-50 border-orange-200'
    },
  ]

  const units = [
    '個', '本', 'パック', 'kg', 'g', 'L', 'ml', '袋', '箱', '缶', '束', '玉'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    onAdd({
      ...formData,
      images: itemImages.length > 0 ? itemImages : undefined,
    })

    // フォームリセット
    setFormData({
      name: '',
      category: '野菜',
      location: 'fridge-main',
      quantity: 1,
      unit: '個',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      notes: '',
    })
    setItemImages([])
    setIsOpen(false)
  }

  const handleImageCapture = (imageData: ImageData) => {
    setItemImages(prev => [...prev, imageData])
  }

  const handleImageRemove = (id: string) => {
    setItemImages(prev => prev.filter(img => img.id !== id))
  }

  // フォームの有効性をチェック
  const isFormValid = formData.name.trim().length > 0

  // 期限日の自動設定
  const handleCategoryChange = (category: string) => {
    setFormData({ ...formData, category })
    
    // カテゴリに応じて推奨期限を設定
    const today = new Date()
    let recommendedDays = 7 // デフォルト1週間
    
    switch (category) {
      case '野菜': recommendedDays = 5; break
      case '肉類': recommendedDays = 3; break
      case '魚類': recommendedDays = 2; break
      case '乳製品': recommendedDays = 7; break
      case '調味料': recommendedDays = 30; break
      case '冷凍食品': recommendedDays = 90; break
      case '飲み物': recommendedDays = 14; break
    }
    
    const expiryDate = new Date(today.getTime() + recommendedDays * 24 * 60 * 60 * 1000)
    setFormData(prev => ({ 
      ...prev, 
      category,
      expiryDate: expiryDate.toISOString().split('T')[0]
    }))
  }

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
      >
        <Plus className="h-4 w-4" />
        📦 補給品追加
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📦 補給品登録
            {itemImages.length > 0 && (
              <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                📸 {itemImages.length}枚
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
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 食材名 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Package className="inline h-4 w-4 mr-1" />
                食材名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: キャベツ"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all ${
                  formData.name.trim().length > 0
                    ? 'border-green-300 focus:ring-green-500 bg-green-50'
                    : 'border-red-300 focus:ring-orange-500 bg-red-50'
                }`}
                required
              />
              {formData.name.trim().length === 0 && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <span>⚠️</span> 食材名は必須です
                </p>
              )}
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 保存場所 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline h-4 w-4 mr-1" />
                保存場所 *
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label} ({loc.temp})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 数量・単位 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                数量 *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                単位
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 日付 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                購入日 *
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                期限日
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="保存方法、調理予定など..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* 食材撮影 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              📸 食材写真
            </label>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <ImageCapture
                onImageCapture={handleImageCapture}
                onImageRemove={handleImageRemove}
                images={itemImages}
                maxImages={2}
                maxSizeMB={3}
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
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              📦 補給庫に追加
              {!isFormValid && (
                <span className="ml-2 text-xs bg-gray-400 px-1.5 py-0.5 rounded-full">
                  名前を入力
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}