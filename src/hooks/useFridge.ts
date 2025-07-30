// src/hooks/useFridge.ts
import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import { uploadData, getUrl, remove } from 'aws-amplify/storage'
import { getCurrentUser } from 'aws-amplify/auth'
import type { Schema } from '../../amplify/data/resource'

const client = generateClient<Schema>()

interface ImageData {
  id: string
  file: File
  url: string
  compressed?: File
  compressedUrl?: string
  timestamp: string
}

interface FridgeItemFormData {
  name: string
  category: string
  location: string
  quantity: number
  unit: string
  purchaseDate: string
  expiryDate: string
  notes: string
  images?: ImageData[]
}

// 冷蔵庫アイテムの型定義
interface EnhancedFridgeItem {
  id: string
  name: string
  category: string
  location: string
  quantity: number
  unit: string
  purchaseDate: string
  expiryDate: string
  notes: string
  consumed?: boolean
  consumedAt?: string
  imageUrls?: string[]
  addedDate: string
  image?: string
  isUrgent?: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * 冷蔵庫管理フック
 * Amplify Gen 2 + DynamoDB + S3統合（既存スキーマ互換）
 */
export function useFridge() {
  const [fridgeItems, setFridgeItems] = useState<EnhancedFridgeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 冷蔵庫データの取得
  const fetchFridgeItems = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🧊 冷蔵庫データ取得開始')
      const { data, errors } = await client.models.FridgeItem.list()
      
      if (errors && errors.length > 0) {
        console.error('🧊 データ取得GraphQLエラー:', errors)
        throw new Error(`GraphQL errors: ${errors.map(e => e.message).join(', ')}`)
      }

      // 既存スキーマから新スキーマへの変換
      const enhancedItems: EnhancedFridgeItem[] = data.map(item => ({
        id: item.id || '',
        name: item.name || '',
        location: item.location || '',
        addedDate: item.addedDate || '',
        image: item.image || undefined,
        isUrgent: item.isUrgent || false,
        createdAt: item.createdAt || undefined,
        updatedAt: item.updatedAt || undefined,
        category: '野菜', // デフォルト値（後で拡張可能）
        quantity: 1, // デフォルト値
        unit: '個', // デフォルト値
        purchaseDate: item.addedDate || '', // 既存フィールドをマッピング
        expiryDate: '', // 新規フィールド
        notes: '', // 新規フィールド
        consumed: false, // デフォルト値
      }))

      // 追加日でソート（新しい順）
      const sortedItems = enhancedItems.sort((a, b) => 
        new Date(b.addedDate || 0).getTime() - new Date(a.addedDate || 0).getTime()
      )

      setFridgeItems(sortedItems)
    } catch (err: any) {
      console.error('冷蔵庫データの取得に失敗:', err)
      setError('補給庫データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 初期化時にデータを取得
  useEffect(() => {
    fetchFridgeItems()
  }, [])

  // 食材画像のアップロード
  const uploadFridgeImages = async (images: ImageData[], itemId: string): Promise<string[]> => {
    const uploadPromises = images.map(async (image, index) => {
      try {
        const fileExtension = image.file.name.split('.').pop() || 'jpg'
        const fileName = `fridge-items/${itemId}/${Date.now()}_${index}.${fileExtension}`
        
        // 圧縮された画像があればそちらを優先、なければ元画像
        const fileToUpload = image.compressed || image.file

        const { path } = await uploadData({
          path: fileName,
          data: fileToUpload,
          options: {
            contentType: fileToUpload.type,
            metadata: {
              originalName: encodeURIComponent(image.file.name),
              uploadedAt: new Date().toISOString(),
              itemId: itemId,
              fileSize: fileToUpload.size.toString(),
            }
          }
        }).result

        return path
      } catch (error) {
        console.error('食材画像アップロード失敗:', error)
        throw error
      }
    })

    return Promise.all(uploadPromises)
  }

  // 冷蔵庫アイテムの追加
  const addFridgeItem = async (itemData: FridgeItemFormData) => {
    try {
      setError(null)

      // まずFridgeItemレコードを作成
      console.log('🧊 冷蔵庫アイテム作成開始:', itemData.name)
      const { data: newItem, errors } = await client.models.FridgeItem.create({
        name: itemData.name,
        addedDate: itemData.purchaseDate,
        location: itemData.location,
        isUrgent: false, // デフォルト値
        image: '', // 一時的に空文字、後で更新
      })
      
      if (errors && errors.length > 0) {
        console.error('🧊 作成GraphQLエラー:', errors)
        throw new Error(`GraphQL errors: ${errors.map(e => e.message).join(', ')}`)
      }

      if (!newItem) {
        throw new Error('補給品の登録に失敗しました')
      }

      // 食材画像がある場合はアップロード
      let imagePaths: string[] = []
      if (itemData.images && itemData.images.length > 0) {
        imagePaths = await uploadFridgeImages(itemData.images, newItem.id || '')
        
        // 画像パスをDBに保存（JSON形式）
        const { errors: updateErrors } = await client.models.FridgeItem.update({
          id: newItem.id,
          image: JSON.stringify(imagePaths)
        })
        
        if (updateErrors && updateErrors.length > 0) {
          console.error('🧊 画像更新GraphQLエラー:', updateErrors)
          // 画像更新失敗は警告のみ、アイテム作成は成功とする
          console.warn('画像の保存に失敗しましたが、アイテムは作成されました')
        }
      }

      // ローカル状態を更新
      const enhancedItem: EnhancedFridgeItem = {
        id: newItem.id || '',
        name: newItem.name || '',
        location: newItem.location || '',
        addedDate: newItem.addedDate || '',
        isUrgent: newItem.isUrgent || false,
        category: itemData.category,
        quantity: itemData.quantity,
        unit: itemData.unit,
        purchaseDate: itemData.purchaseDate,
        expiryDate: itemData.expiryDate,
        notes: itemData.notes,
        consumed: false,
        image: imagePaths.length > 0 ? JSON.stringify(imagePaths) : '',
        createdAt: newItem.createdAt || undefined,
        updatedAt: newItem.updatedAt || undefined,
      }
      
      setFridgeItems(prev => [enhancedItem, ...prev])

      return {
        success: true,
        data: enhancedItem,
        message: '補給品を登録しました'
      }
    } catch (err: any) {
      console.error('冷蔵庫アイテムの追加に失敗:', err)
      const message = err.message || '補給品の登録に失敗しました'
      setError(message)
      return {
        success: false,
        message
      }
    }
  }

  // アイテムの消費マーキング
  const consumeItem = async (id: string) => {
    try {
      setError(null)

      // ローカル状態を更新（既存スキーマでは消費状態を保存しないため、ローカルのみ）
      setFridgeItems(prev => prev.map(item => 
        item.id === id 
          ? { ...item, consumed: true, consumedAt: new Date().toISOString() }
          : item
      ))

      return {
        success: true,
        message: '補給品を消費済みにしました'
      }
    } catch (err: any) {
      console.error('アイテム消費の更新に失敗:', err)
      const message = err.message || '消費状態の更新に失敗しました'
      setError(message)
      return {
        success: false,
        message
      }
    }
  }

  // アイテムの削除
  const deleteFridgeItem = async (id: string) => {
    try {
      setError(null)

      // 削除対象のアイテムを取得
      const itemToDelete = fridgeItems.find(item => item.id === id)
      
      // 画像がある場合は削除
      if (itemToDelete?.image) {
        try {
          const imagePaths = JSON.parse(itemToDelete.image)
          if (Array.isArray(imagePaths)) {
            await Promise.all(
              imagePaths.map(path => remove({ path }))
            )
          }
        } catch (err) {
          console.warn('食材画像の削除に失敗:', err)
        }
      }

      // DBから削除
      console.log('🧊 冷蔵庫アイテム削除開始:', id)
      const { errors } = await client.models.FridgeItem.delete({
        id
      })
      
      if (errors && errors.length > 0) {
        console.error('🧊 削除GraphQLエラー:', errors)
        throw new Error(`GraphQL errors: ${errors.map(e => e.message).join(', ')}`)
      }

      // ローカル状態を更新
      setFridgeItems(prev => prev.filter(item => item.id !== id))

      return {
        success: true,
        message: '補給品を削除しました'
      }
    } catch (err: any) {
      console.error('冷蔵庫アイテムの削除に失敗:', err)
      const message = err.message || '補給品の削除に失敗しました'
      setError(message)
      return {
        success: false,
        message
      }
    }
  }

  // 画像URLの取得
  const getImageUrls = async (imagePaths: string[]): Promise<string[]> => {
    try {
      const urlPromises = imagePaths.map(async (path) => {
        const { url } = await getUrl({ path })
        return url.toString()
      })
      
      return Promise.all(urlPromises)
    } catch (error) {
      console.error('画像URL取得失敗:', error)
      return []
    }
  }

  // アイテムデータの変換（画像URL付き）
  const getItemsWithImageUrls = async (itemList: EnhancedFridgeItem[] = fridgeItems) => {
    const itemsWithUrls = await Promise.all(
      itemList.map(async (item) => {
        let imageUrls: string[] = []
        
        if (item.image) {
          try {
            const imagePaths = JSON.parse(item.image)
            if (Array.isArray(imagePaths)) {
              imageUrls = await getImageUrls(imagePaths)
            }
          } catch (err) {
            console.warn('画像パス解析失敗:', err)
          }
        }

        return {
          ...item,
          imageUrls
        }
      })
    )

    return itemsWithUrls
  }

  // 期限状況の取得
  const getExpiryStatus = (expiryDate: string, consumed: boolean = false) => {
    if (consumed) return { status: 'consumed', label: '✅ 消費済み', color: 'bg-gray-100 text-gray-600' }
    if (!expiryDate) return { status: 'none', label: '期限なし', color: 'bg-gray-100 text-gray-600' }
    
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { status: 'expired', label: `❌ ${Math.abs(diffDays)}日期限切れ`, color: 'bg-red-100 text-red-800' }
    } else if (diffDays === 0) {
      return { status: 'today', label: '⚠️ 今日期限', color: 'bg-orange-100 text-orange-800' }
    } else if (diffDays <= 3) {
      return { status: 'expiring', label: `⚠️ あと${diffDays}日`, color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { status: 'fresh', label: `✅ あと${diffDays}日`, color: 'bg-green-100 text-green-800' }
    }
  }

  // 統計情報の計算
  const getFridgeStats = (itemList: EnhancedFridgeItem[] = fridgeItems) => {
    const activeItems = itemList.filter(item => !item.consumed)
    const totalItems = activeItems.length
    const consumedItems = itemList.filter(item => item.consumed).length
    
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
      const category = item.category || 'その他'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // 庫室別統計
    const locationStats = activeItems.reduce((acc, item) => {
      const location = item.location || 'その他'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // 画像添付率
    const withImageCount = itemList.filter(item => item.image && item.image !== '').length
    const imageRate = itemList.length > 0 ? Math.round((withImageCount / itemList.length) * 100) : 0

    return {
      totalItems,
      consumedItems,
      expiredItems,
      expiringItems,
      urgentItems: expiredItems + expiringItems,
      categoryStats,
      locationStats,
      imageRate,
      withImageCount,
      totalCount: itemList.length
    }
  }

  return {
    fridgeItems,
    isLoading,
    error,
    addFridgeItem,
    consumeItem,
    deleteFridgeItem,
    fetchFridgeItems,
    getItemsWithImageUrls,
    getFridgeStats,
    getExpiryStatus,
    setError, // エラーのクリア用
  }
}