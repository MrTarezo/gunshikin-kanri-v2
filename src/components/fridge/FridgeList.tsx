// src/components/fridge/FridgeList.tsx (最適化版)
import { useState, useMemo, useCallback } from 'react'
import { Button } from '../ui/button'
import { ImageGallery } from '../common/ImageGallery'
import { 
  Trash2, 
  Package, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  Filter
} from 'lucide-react'

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
  consumed?: boolean
  consumedAt?: string
}

interface FridgeListProps {
  items: FridgeItemData[]
  onDelete: (id: string) => void
  onConsume: (id: string) => void
  onUpdate?: (id: string, updates: Partial<FridgeItemData>) => void
  isLoading?: boolean
  error?: string | null
}

type FilterType = 'all' | 'fresh' | 'expiring' | 'expired' | 'consumed'

interface ExpiryStatus {
  status: 'fresh' | 'expiring' | 'today' | 'expired' | 'consumed' | 'none'
  label: string
  color: string
}

export function FridgeList({ 
  items, 
  onDelete, 
  onConsume, 
  // onUpdate, 
  isLoading = false,
  error = null 
}: FridgeListProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  // 定数定義をuseMemoで最適化
  const constants = useMemo(() => ({
    categoryIcons: {
      '野菜': '🥕',
      '肉類': '🥩',
      '魚類': '🐟',
      '乳製品': '🥛',
      '調味料': '🧂',
      '冷凍食品': '🍱',
      '飲み物': '🥤',
      'その他': '📦',
    } as const,

    locationLabels: {
      'fridge-main': '🍱 冷蔵室',
      'vegetable': '🥕 野菜室',
      'freezer-top': '🍦 冷凍庫(上)',
      'freezer-middle': '❄️ 冷凍庫(中)',
      'freezer-bottom': '🧊 冷凍庫(下)',
      'door': '🚪 ドア棚',
    } as const,

    categoryColors: {
      '野菜': 'bg-green-100 text-green-800',
      '肉類': 'bg-red-100 text-red-800',
      '魚類': 'bg-blue-100 text-blue-800',
      '乳製品': 'bg-yellow-100 text-yellow-800',
      '調味料': 'bg-purple-100 text-purple-800',
      '冷凍食品': 'bg-indigo-100 text-indigo-800',
      '飲み物': 'bg-cyan-100 text-cyan-800',
      'その他': 'bg-gray-100 text-gray-800',
    } as const
  }), [])

  // 期限状況の判定（useCallbackで最適化）
  const getExpiryStatus = useCallback((expiryDate: string, consumed: boolean = false): ExpiryStatus => {
    if (consumed) return { 
      status: 'consumed', 
      label: '✅ 消費済み', 
      color: 'bg-gray-100 text-gray-600' 
    }
    
    if (!expiryDate) return { 
      status: 'none', 
      label: '期限なし', 
      color: 'bg-gray-100 text-gray-600' 
    }
    
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { 
        status: 'expired', 
        label: `❌ ${Math.abs(diffDays)}日期限切れ`, 
        color: 'bg-red-100 text-red-800' 
      }
    } else if (diffDays === 0) {
      return { 
        status: 'today', 
        label: '⚠️ 今日期限', 
        color: 'bg-orange-100 text-orange-800' 
      }
    } else if (diffDays <= 3) {
      return { 
        status: 'expiring', 
        label: `⚠️ あと${diffDays}日`, 
        color: 'bg-yellow-100 text-yellow-800' 
      }
    } else {
      return { 
        status: 'fresh', 
        label: `✅ あと${diffDays}日`, 
        color: 'bg-green-100 text-green-800' 
      }
    }
  }, [])

  // フィルタリング（useMemoで最適化）
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filter === 'consumed') return item.consumed
      if (filter === 'all') return true
      
      const expiryStatus = getExpiryStatus(item.expiryDate, item.consumed)
      
      switch (filter) {
        case 'fresh': return expiryStatus.status === 'fresh' && !item.consumed
        case 'expiring': return ['expiring', 'today'].includes(expiryStatus.status) && !item.consumed
        case 'expired': return expiryStatus.status === 'expired' && !item.consumed
        default: return true
      }
    })
  }, [items, filter, getExpiryStatus])

  // グループ化（useMemoで最適化）
  const groupedItems = useMemo(() => {
    const urgent = filteredItems.filter(item => {
      const status = getExpiryStatus(item.expiryDate, item.consumed)
      return ['expired', 'today', 'expiring'].includes(status.status) && !item.consumed
    })

    const fresh = filteredItems.filter(item => {
      const status = getExpiryStatus(item.expiryDate, item.consumed)
      return status.status === 'fresh' && !item.consumed
    })

    const consumed = filteredItems.filter(item => item.consumed)

    return { urgent, fresh, consumed }
  }, [filteredItems, getExpiryStatus])

  // アイテムカードのレンダリング（useCallbackで最適化）
  const renderItemCard = useCallback((item: FridgeItemData) => {
    const expiryStatus = getExpiryStatus(item.expiryDate, item.consumed)
    const isExpanded = expandedItem === item.id
    const hasImages = item.images && item.images.length > 0

    const getBorderColor = () => {
      if (expiryStatus.status === 'expired') return 'border-red-300'
      if (expiryStatus.status === 'expiring' || expiryStatus.status === 'today') return 'border-orange-300'
      return 'border-gray-200'
    }

    return (
      <div
        key={item.id}
        className={`bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md ${
          item.consumed ? 'opacity-60' : ''
        } ${getBorderColor()}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="text-2xl" role="img" aria-label={item.category}>
              {constants.categoryIcons[item.category as keyof typeof constants.categoryIcons] || '📦'}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className={`font-semibold ${item.consumed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {item.name}
                </h4>
                <span className="text-gray-600" aria-label="数量">
                  {item.quantity}{item.unit}
                </span>
              </div>

              {/* メタ情報 */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${constants.categoryColors[item.category as keyof typeof constants.categoryColors] || 'bg-gray-100 text-gray-800'}`}>
                  {item.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${expiryStatus.color}`}>
                  {expiryStatus.label}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {constants.locationLabels[item.location as keyof typeof constants.locationLabels] || item.location}
                </span>
                {hasImages && (
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                    📸 {item.images!.length}枚
                  </span>
                )}
              </div>

              {/* 日付情報 */}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  購入: {new Date(item.purchaseDate).toLocaleDateString('ja-JP')}
                </span>
                {item.expiryDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    期限: {new Date(item.expiryDate).toLocaleDateString('ja-JP')}
                  </span>
                )}
              </div>

              {/* メモ（展開時） */}
              {isExpanded && item.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                  <strong>メモ:</strong> {item.notes}
                </div>
              )}

              {/* 画像ギャラリー（展開時） */}
              {isExpanded && hasImages && (
                <div className="mt-3">
                  <ImageGallery
                    images={item.images!}
                    title="📸 食材写真"
                    emptyMessage="写真がありません"
                  />
                </div>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center space-x-1">
            {(item.notes || hasImages) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                aria-label={isExpanded ? '詳細を閉じる' : '詳細を表示'}
              >
                {isExpanded ? '▲' : '▼'}
              </Button>
            )}
            
            {!item.consumed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConsume(item.id)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                aria-label="消費済みにする"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              aria-label="削除"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }, [expandedItem, constants, getExpiryStatus, onConsume, onDelete])

  // ローディング状態
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">補給品を読み込み中...</p>
      </div>
    )
  }

  // エラー状態
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          データの読み込みに失敗しました
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          再試行
        </Button>
      </div>
    )
  }

  // 空状態
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          補給品が登録されていません
        </h3>
        <p className="text-gray-600">
          最初の補給品を追加してみましょう
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* フィルターヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">フィルター:</span>
        </div>
        <div className="text-sm text-gray-600">
          {filteredItems.length}件表示
        </div>
      </div>

      {/* フィルターボタン */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          すべて ({items.length})
        </Button>
        <Button
          variant={filter === 'expiring' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('expiring')}
          className={`${groupedItems.urgent.length > 0 ? 'text-orange-600 hover:text-orange-700' : ''}`}
        >
          ⚠️ 期限間近 ({groupedItems.urgent.length})
        </Button>
        <Button
          variant={filter === 'fresh' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('fresh')}
          className="text-green-600 hover:text-green-700"
        >
          ✅ 新鮮 ({groupedItems.fresh.length})
        </Button>
        <Button
          variant={filter === 'consumed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('consumed')}
          className="text-gray-600 hover:text-gray-700"
        >
          消費済み ({groupedItems.consumed.length})
        </Button>
      </div>

      {/* アイテムリスト */}
      {filter === 'all' ? (
        <div className="space-y-8">
          {/* 緊急・期限間近 */}
          {groupedItems.urgent.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                🚨 緊急対応必要 ({groupedItems.urgent.length})
              </h3>
              <div className="space-y-3" role="list">
                {groupedItems.urgent.map(renderItemCard)}
              </div>
            </section>
          )}

          {/* 新鮮な食材 */}
          {groupedItems.fresh.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-600">
                <Package className="h-5 w-5" />
                ✅ 在庫良好 ({groupedItems.fresh.length})
              </h3>
              <div className="space-y-3" role="list">
                {groupedItems.fresh.map(renderItemCard)}
              </div>
            </section>
          )}

          {/* 消費済み */}
          {groupedItems.consumed.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-600">
                <CheckCircle className="h-5 w-5" />
                🗃️ 消費済み ({groupedItems.consumed.length})
              </h3>
              <div className="space-y-3" role="list">
                {groupedItems.consumed.map(renderItemCard)}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="space-y-3" role="list">
          {filteredItems.map(renderItemCard)}
        </div>
      )}
    </div>
  )
}