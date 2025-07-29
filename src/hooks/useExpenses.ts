// src/hooks/useExpenses.ts
import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import { uploadData, getUrl, remove } from 'aws-amplify/storage'
import type { Schema } from '../../amplify/data/resource'
import { useDevExpenses } from './dev/useDevData'

const client = generateClient<Schema>()

// 開発モード用のインターフェース定義
interface ExpenseData {
  id: string
  title: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  paidBy: string
  settled: boolean
  comment?: string
  receipt?: string
  createdAt?: string
  updatedAt?: string
}

interface ImageData {
  id: string
  file: File
  url: string
  compressed?: File
  compressedUrl?: string
  timestamp: string
}

interface ExpenseFormData {
  title: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  paidBy: string
  receipt?: ImageData[]
}

/**
 * 支出管理フック（開発モード対応）
 */
export function useExpenses() {
  const { expenses: devExpenses, addExpense: devAddExpense, deleteExpense: devDeleteExpense } = useDevExpenses()
  const [expenses, setExpenses] = useState<ExpenseData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 開発モード強制時はモックを使用
  const useDevMode = import.meta.env.VITE_USE_DEV_DATA === 'true' || false

  // 支出データの取得
  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (useDevMode) {
        // 開発モード：モックデータを使用
        const sortedExpenses = [...devExpenses].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setExpenses(sortedExpenses)
      } else {
        // 本番モード：Amplifyクライアント使用
        console.log('💰 支出データ取得開始')
        const { data, errors } = await client.models.Expense.list()
        
        if (errors && errors.length > 0) {
          console.error('💰 データ取得GraphQLエラー:', errors)
          throw new Error(`GraphQL errors: ${errors.map(e => e.message).join(', ')}`)
        }

        // 日付でソート（新しい順）
        const sortedExpenses = data.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        setExpenses(sortedExpenses as ExpenseData[])
      }
    } catch (err: unknown) {
      console.error('支出データの取得に失敗:', err)
      const message = err instanceof Error ? err.message : '支出データの取得に失敗しました'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // 初期化時にデータを取得
  useEffect(() => {
    if (useDevMode) {
      // 開発モード：devExpensesが変更されたら更新
      const sortedExpenses = [...devExpenses].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setExpenses(sortedExpenses)
      setIsLoading(false)
    } else {
      fetchExpenses()
    }
  }, [useDevMode, devExpenses])

  // レシート画像のアップロード（開発モード用）
  const uploadReceiptImages = async (images: ImageData[], _expenseId: string): Promise<string[]> => {
    if (useDevMode) {
      // 開発モード：画像URLをそのまま返す
      return images.map(img => img.url)
    } else {
      // 本番モード：S3アップロード
      const uploadPromises = images.map(async (image, index) => {
        try {
          const fileExtension = image.file.name.split('.').pop() || 'jpg'
          const fileName = `receipts/${_expenseId}/${Date.now()}_${index}.${fileExtension}`
          
          const fileToUpload = image.compressed || image.file

          const { path } = await uploadData({
            path: fileName,
            data: fileToUpload,
            options: {
              contentType: fileToUpload.type,
              metadata: {
                originalName: image.file.name,
                uploadedAt: new Date().toISOString(),
                expenseId: _expenseId,
              }
            }
          }).result

          return path
        } catch (error) {
          console.error('画像アップロード失敗:', error)
          throw error
        }
      })

      return Promise.all(uploadPromises)
    }
  }

  // 支出の追加
  const addExpense = async (expenseData: ExpenseFormData) => {
    try {
      setError(null)

      if (useDevMode) {
        // 開発モード：モックデータに追加
        const newExpense = {
          id: Date.now().toString(),
          title: expenseData.title,
          amount: expenseData.amount,
          category: expenseData.category,
          type: expenseData.type,
          date: expenseData.date,
          paidBy: expenseData.paidBy,
          settled: false,
          comment: '',
          receipt: expenseData.receipt ? JSON.stringify(expenseData.receipt.map(img => img.url)) : '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        await devAddExpense(newExpense)
        
        return {
          success: true,
          data: newExpense,
          message: '支出を記録しました（開発モード）'
        }
      } else {
        // 本番モード：Amplifyクライアント使用
        console.log('💰 支出作成開始:', {
          title: expenseData.title,
          amount: expenseData.amount,
          category: expenseData.category,
          type: expenseData.type,
          date: expenseData.date,
          paidBy: expenseData.paidBy
        })
        
        const { data: newExpense, errors } = await client.models.Expense.create({
          title: expenseData.title,
          amount: expenseData.amount,
          category: expenseData.category,
          type: expenseData.type,
          date: expenseData.date,
          paidBy: expenseData.paidBy,
          settled: false,
          comment: '',
          receipt: '',
        })
        
        if (errors && errors.length > 0) {
          console.error('💰 GraphQLエラー:', errors)
          throw new Error(`GraphQL errors: ${errors.map(e => e.message).join(', ')}`)
        }

        if (!newExpense) {
          throw new Error('支出の作成に失敗しました')
        }

        // レシート画像のアップロード処理
        let receiptPaths: string[] = []
        if (expenseData.receipt && expenseData.receipt.length > 0) {
          receiptPaths = await uploadReceiptImages(expenseData.receipt, newExpense.id ?? '')
          
          await client.models.Expense.update({
            id: newExpense.id,
            receipt: JSON.stringify(receiptPaths)
          }, {
            authMode: 'userPool'
          })
        }

        const updatedExpense = {
          ...newExpense,
          receipt: receiptPaths.length > 0 ? JSON.stringify(receiptPaths) : ''
        } as ExpenseData
        
        setExpenses(prev => [updatedExpense, ...prev])

        return {
          success: true,
          data: updatedExpense,
          message: '支出を記録しました'
        }
      }
    } catch (err: unknown) {
      console.error('支出の追加に失敗:', err)
      const message = err instanceof Error ? err.message : '支出の追加に失敗しました'
      setError(message)
      return {
        success: false,
        message
      }
    }
  }

  // 支出の削除
  const deleteExpense = async (id: string) => {
    try {
      setError(null)

      if (useDevMode) {
        // 開発モード：モックデータから削除
        await devDeleteExpense(id)
        
        return {
          success: true,
          message: '支出を削除しました（開発モード）'
        }
      } else {
        // 本番モード：Amplifyクライアント使用
        const expenseToDelete = expenses.find(e => e.id === id)
        
        if (expenseToDelete?.receipt) {
          try {
            const receiptPaths = JSON.parse(expenseToDelete.receipt)
            if (Array.isArray(receiptPaths)) {
              await Promise.all(
                receiptPaths.map(path => remove({ path }))
              )
            }
          } catch (err) {
            console.warn('レシート画像の削除に失敗:', err)
          }
        }

        console.log('💰 支出削除開始:', id)
        const { errors } = await client.models.Expense.delete({
          id
        })
        
        if (errors && errors.length > 0) {
          console.error('💰 削除GraphQLエラー:', errors)
          throw new Error(`GraphQL errors: ${errors.map(e => e.message).join(', ')}`)
        }

        setExpenses(prev => prev.filter(e => e.id !== id))

        return {
          success: true,
          message: '支出を削除しました'
        }
      }
    } catch (err: unknown) {
      console.error('支出の削除に失敗:', err)
      const message = err instanceof Error ? err.message : '支出の削除に失敗しました'
      setError(message)
      return {
        success: false,
        message
      }
    }
  }

  // レシート画像URLの取得
  const getReceiptUrls = async (receiptPaths: string[]): Promise<string[]> => {
    if (useDevMode) {
      // 開発モード：パスをそのまま返す
      return receiptPaths
    } else {
      // 本番モード：S3からURL取得
      try {
        const urlPromises = receiptPaths.map(async (path) => {
          const { url } = await getUrl({ path })
          return url.toString()
        })
        
        return Promise.all(urlPromises)
      } catch (error) {
        console.error('レシートURL取得失敗:', error)
        return []
      }
    }
  }

  // 支出データの変換（レシートURL付き）
  const getExpensesWithReceiptUrls = async (expenseList: ExpenseData[] = expenses) => {
    const expensesWithUrls = await Promise.all(
      expenseList.map(async (expense) => {
        let receiptUrls: string[] = []
        
        if (expense.receipt) {
          try {
            const receiptPaths = JSON.parse(expense.receipt)
            if (Array.isArray(receiptPaths)) {
              receiptUrls = await getReceiptUrls(receiptPaths)
            }
          } catch (err) {
            console.warn('レシートパス解析失敗:', err)
          }
        }

        return {
          ...expense,
          receiptUrls
        }
      })
    )

    return expensesWithUrls
  }

  // 統計情報の計算
  const getExpenseStats = (expenseList: ExpenseData[] = expenses) => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const currentMonthExpenses = expenseList.filter(e => 
      e.date.startsWith(currentMonth)
    )
    
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
        const category = expense.category || 'その他'
        acc[category] = (acc[category] || 0) + expense.amount
        return acc
      }, {} as Record<string, number>)

    // レシート添付率
    const withReceiptCount = expenseList.filter(e => e.receipt && e.receipt !== '').length
    const receiptRate = expenseList.length > 0 ? Math.round((withReceiptCount / expenseList.length) * 100) : 0

    return {
      totalIncome,
      totalExpense,
      balance,
      categoryTotals,
      receiptRate,
      withReceiptCount,
      totalCount: expenseList.length
    }
  }

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    deleteExpense,
    fetchExpenses,
    getExpensesWithReceiptUrls,
    getExpenseStats,
    uploadReceiptImages, // 外部で使用される可能性があるため残す
    setError, // エラーのクリア用
  }
}