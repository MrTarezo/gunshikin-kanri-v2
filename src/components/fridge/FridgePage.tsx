// src/components/fridge/FridgePage.tsx
import { useState, useEffect } from 'react'
import { useFridge } from '../../hooks/useFridge'
import { FridgeForm } from './FridgeForm'
import { FridgeStorage } from './FridgeStorage'
import { FridgeList } from './FridgeList'
import { Button } from '../ui/button'
import { 
  Package, 
  Camera, 
  List, 
  AlertTriangle, 
  TrendingUp,
  Refrigerator,
  Calendar,
  Eye,
  BarChart3
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

interface StorageLocation {
  id: string
  name: string
  icon: string
  temperature: string
  description: string
  color: string
  images: ImageData[]
  lastUpdated?: string
}

export function FridgePage() {
  const [activeView, setActiveView] = useState<'dashboard' | 'storage' | 'inventory'>('dashboard')
  const { 
    fridgeItems, 
    addFridgeItem, 
    deleteFridgeItem
  } = useFridge()
  const [storageData, setStorageData] = useState<StorageLocation[]>([])

  // 初期化
  useEffect(() => {
    // 庫室データの初期化
    const initialStorageData: StorageLocation[] = [
      {
        id: 'fridge-main',
        name: '冷蔵室',
        icon: '🍱',
        temperature: '2-5°C',
        description: 'メイン冷蔵庫',
        color: 'bg-blue-50 border-blue-200',
        images: []
      },
      {
        id: 'vegetable',
        name: '野菜室',
        icon: '🥕',
        temperature: '3-7°C',
        description: '野菜・果物専用',
        color: 'bg-green-50 border-green-200',
        images: []
      },
      {
        id: 'freezer-top',
        name: '冷凍庫(上段)',
        icon: '🍦',
        temperature: '-18°C',
        description: 'アイス・冷凍食品',
        color: 'bg-cyan-50 border-cyan-200',
        images: []
      },
      {
        id: 'freezer-middle',
        name: '冷凍庫(中段)',
        icon: '❄️',
        temperature: '-18°C',
        description: '肉類・魚類',
        color: 'bg-cyan-50 border-cyan-200',
        images: []
      },
      {
        id: 'freezer-bottom',
        name: '冷凍庫(下段)',
        icon: '🧊',
        temperature: '-18°C',
        description: '作り置き・冷凍野菜',
        color: 'bg-cyan-50 border-cyan-200',
        images: []
      },
      {
        id: 'door',
        name: 'ドア棚',
        icon: '🚪',
        temperature: '5-8°C',
        description: '調味料・飲み物',
        color: 'bg-orange-50 border-orange-200',
        images: []
      }
    ]
    setStorageData(initialStorageData)

    // サンプルデータ
    const sampleItems: FridgeItemData[] = [
      {
        id: '1',
        name: 'キャベツ',
        category: '野菜',
        location: 'vegetable',
        quantity: 1,
        unit: '玉',
        purchaseDate: '2025-01-18',
        expiryDate: '2025-01-23',
        notes: 'サラダとコールスロー用',
        createdAt: '2025-01-18T10:00:00Z',
      },
      {
        id: '2',
        name: '牛肉(切り落とし)',
        category: '肉類',
        location: 'fridge-main',
        quantity: 300,
        unit: 'g',
        purchaseDate: '2025-01-19',
        expiryDate: '2025-01-22',
        notes: '今日中に調理予定',
        createdAt: '2025-01-19T14:00:00Z',
      },
      {
        id: '3',
        name: '牛乳',
        category: '乳製品',
        location: 'door',
        quantity: 1,
        unit: '本',
        purchaseDate: '2025-01-15',
        expiryDate: '2025-01-25',
        notes: '',
        createdAt: '2025-01-15T09:00:00Z',
      },
      {
        id: '4',
        name: '冷凍餃子',
        category: '冷凍食品',
        location: 'freezer-middle',
        quantity: 1,
        unit: 'パック',
        purchaseDate: '2025-01-10',
        expiryDate: '2025-03-10',
        notes: '非常食として保存',
        createdAt: '2025-01-10T16:00:00Z',
      },
      {
        id: '5',
        name: 'にんじん',
        category: '野菜',
        location: 'vegetable',
        quantity: 3,
        unit: '本',
        purchaseDate: '2025-01-17',
        expiryDate: '',
        notes: '',
        consumed: true,
        consumedAt: '2025-01-20T12:00:00Z',
        createdAt: '2025-01-17T11:00:00Z',
      }
    ]
  }, [])

  // 手動リフレッシュ（将来実装）
  const handleRefresh = async () => {
    console.log('Refresh fridge data')
  }

  // 冷蔵庫アイテム追加のハンドラー
  const handleAddItem = async (itemData: Omit<FridgeItemData, 'id' | 'createdAt'>) => {
    console.log('🧊 冷蔵庫アイテム追加処理開始:', itemData)
    
    try {
      const result = await addFridgeItem(itemData)
      
      if (result.success) {
        console.log('✅ 冷蔵庫アイテム追加成功:', result.data)
        // 成功時は特に通知しない（UIが自動更新される）
      } else {
        console.error('❌ 冷蔵庫アイテム追加失敗:', result.message)
        alert(`❌ エラー: ${result.message}`)
      }
      
      return result
    } catch (err) {
      console.error('❌ 冷蔵庫アイテム追加で予期しないエラー:', err)
      const message = err instanceof Error ? err.message : '予期しないエラーが発生しました'
      alert(`❌ 予期しないエラー: ${message}`)
      return { success: false, message }
    }
  }

  // 冷蔵庫アイテム削除のハンドラー
  const handleDeleteItem = async (id: string) => {
    console.log('🧊 冷蔵庫アイテム削除処理開始:', id)
    
    try {
      const result = await deleteFridgeItem(id)
      
      if (result.success) {
        console.log('✅ 冷蔵庫アイテム削除成功:', id)
        // 成功時は特に通知しない（UIが自動更新される）
      } else {
        console.error('❌ 冷蔵庫アイテム削除失敗:', result.message)
        alert(`❌ エラー: ${result.message}`)
      }
      
      return result
    } catch (err) {
      console.error('❌ 冷蔵庫アイテム削除で予期しないエラー:', err)
      const message = err instanceof Error ? err.message : '予期しないエラーが発生しました'
      alert(`❌ 予期しないエラー: ${message}`)
      return { success: false, message }
    }
  }

  const handleConsumeItem = (id: string) => {
    // TODO: Implement consume item functionality with backend
    console.log('Consuming item:', id)
  }

  const handleStorageUpdate = (locationId: string, images: ImageData[]) => {
    setStorageData(prev => prev.map(storage => 
      storage.id === locationId 
        ? { ...storage, images, lastUpdated: new Date().toISOString() }
        : storage
    ))
  }

  // 統計計算
  const getStats = () => {
    const activeItems = fridgeItems.filter(item => !item.consumed)
    const totalItems = activeItems.length
    const consumedItems = fridgeItems.filter(item => item.consumed).length
    
    // 期限切れ・期限間近アイテム
    const today = new Date()
    const expiredItems = activeItems.filter(item => {
      if (!item.expiryDate) return false
      return new Date(item.expiryDate) < today
    }).length
    
    const expiringItems = activeItems.filter(item => {
      if (!item.expiryDate) return false
      const expiry = new Date(item.expiryDate)
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 3
    }).length
    
    // カテゴリ別統計
    const categoryStats = activeItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // 庫室別統計
    const locationStats = activeItems.reduce((acc, item) => {
      const location = (item as any).location || 'その他'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // 庫室撮影状況
    const photographedStorages = storageData.filter(s => s.images.length > 0).length
    const totalStorages = storageData.length

    return {
      totalItems,
      consumedItems,
      expiredItems,
      expiringItems,
      urgentItems: expiredItems + expiringItems,
      categoryStats,
      locationStats,
      photographedStorages,
      totalStorages,
      photographyRate: totalStorages > 0 ? Math.round((photographedStorages / totalStorages) * 100) : 0
    }
  }

  const stats = getStats()

  const tabs = [
    { id: 'dashboard' as const, label: 'ダッシュボード', icon: BarChart3 },
    { id: 'storage' as const, label: '庫室撮影', icon: Camera },
    { id: 'inventory' as const, label: '在庫管理', icon: List },
  ]

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🧊 補給庫管理</h2>
          <p className="text-gray-600">戦略的食材管理・冷蔵庫状況監視</p>
        </div>
        <FridgeForm onAdd={handleAddItem} />
      </div>

      {/* タブナビゲーション */}
      <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeView === tab.id
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* コンテンツ */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">総在庫数</p>
                  <p className="text-2xl font-bold">{stats.totalItems}</p>
                </div>
                <Package className="h-8 w-8 text-blue-200" />
              </div>
            </div>

            <div className={`bg-gradient-to-r ${
              stats.urgentItems > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'
            } rounded-lg p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${stats.urgentItems > 0 ? 'text-red-100' : 'text-green-100'}`}>
                    期限状況
                  </p>
                  <p className="text-2xl font-bold">{stats.urgentItems}</p>
                  <p className={`text-xs ${stats.urgentItems > 0 ? 'text-red-200' : 'text-green-200'} mt-1`}>
                    緊急対応必要
                  </p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${stats.urgentItems > 0 ? 'text-red-200' : 'text-green-200'}`} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">撮影状況</p>
                  <p className="text-2xl font-bold">{stats.photographyRate}%</p>
                  <p className="text-xs text-purple-200 mt-1">
                    {stats.photographedStorages}/{stats.totalStorages}庫室
                  </p>
                </div>
                <Camera className="h-8 w-8 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100">消費実績</p>
                  <p className="text-2xl font-bold">{stats.consumedItems}</p>
                  <p className="text-xs text-gray-200 mt-1">今月の消費数</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-200" />
              </div>
            </div>
          </div>

          {/* 緊急対応エリア */}
          {stats.urgentItems > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900">🚨 緊急対応必要</h3>
                  <p className="text-sm text-red-700">
                    {stats.expiredItems}件の期限切れ、{stats.expiringItems}件の期限間近食材があります
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setActiveView('inventory')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                緊急食材を確認
              </Button>
            </div>
          )}

          {/* カテゴリ別統計 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">📊 カテゴリ別在庫状況</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.categoryStats).map(([category, count]) => {
                const categoryIcons: Record<string, string> = {
                  '野菜': '🥕',
                  '肉類': '🥩',
                  '魚類': '🐟',
                  '乳製品': '🥛',
                  '調味料': '🧂',
                  '冷凍食品': '🍱',
                  '飲み物': '🥤',
                  'その他': '📦',
                }
                
                return (
                  <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-1">{categoryIcons[category] || '📦'}</div>
                    <div className="text-sm font-medium">{category}</div>
                    <div className="text-lg font-bold text-gray-700">{count}件</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 庫室状況サマリー */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">🧊 庫室別保存状況</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {storageData.map((storage) => {
                const itemCount = stats.locationStats[storage.id] || 0
                const hasPhotos = storage.images.length > 0
                
                return (
                  <div
                    key={storage.id}
                    className={`p-4 rounded-lg border-2 ${storage.color} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{storage.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{storage.name}</div>
                          <div className="text-xs text-gray-600">{storage.temperature}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{itemCount}件</div>
                        <div className="text-xs text-gray-600">
                          {hasPhotos ? '📸' : '📷'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">{storage.description}</div>
                    {storage.lastUpdated && (
                      <div className="text-xs text-gray-500">
                        最終撮影: {new Date(storage.lastUpdated).toLocaleDateString('ja-JP')}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* クイックアクション */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">⚡ クイックアクション</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => setActiveView('storage')}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <Camera className="h-5 w-5 text-blue-600" />
                <span className="text-sm">📸 庫室撮影</span>
              </Button>
              
              <Button
                onClick={() => setActiveView('inventory')}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300"
              >
                <List className="h-5 w-5 text-green-600" />
                <span className="text-sm">📋 在庫確認</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-300"
              >
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-sm">📅 期限管理</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-2 hover:bg-orange-50 hover:border-orange-300"
              >
                <Refrigerator className="h-5 w-5 text-orange-600" />
                <span className="text-sm">🔧 設定</span>
              </Button>
            </div>
          </div>

          {/* 使い方ガイド */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">📚 補給庫機能の使い方</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">📦</div>
                <h4 className="font-medium mb-2">1. 補給品登録</h4>
                <p className="text-sm text-gray-600">食材を購入したら即座に補給庫に登録・写真撮影</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl mb-2">📸</div>
                <h4 className="font-medium mb-2">2. 庫室撮影</h4>
                <p className="text-sm text-gray-600">定期的に各庫室の状況を撮影・記録</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-2">⚠️</div>
                <h4 className="font-medium mb-2">3. 期限管理</h4>
                <p className="text-sm text-gray-600">期限切れ前に警告・消費計画の立案</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'storage' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <FridgeStorage
            onStorageUpdate={handleStorageUpdate}
            storageData={storageData}
          />
        </div>
      )}

      {activeView === 'inventory' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <FridgeList
            items={fridgeItems as any[]}
            onDelete={handleDeleteItem}
            onConsume={handleConsumeItem}
          />
        </div>
      )}
    </div>
  )
}