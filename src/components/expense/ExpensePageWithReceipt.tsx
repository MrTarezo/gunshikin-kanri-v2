// src/components/expense/ExpensePageWithReceipt.tsx (API連携版)
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useExpenses } from '../../hooks/useExpenses'
import { ExpenseFormWithReceipt } from './ExpenseFormWithReceipt'
import { ExpenseListWithReceipt } from './ExpenseListWithReceipt'
import { ExpenseSummary } from './ExpenseSummary'
import { Button } from '../ui/button'
import { Filter, Calendar, User, Receipt, RefreshCw, AlertCircle } from 'lucide-react'

export function ExpensePageWithReceipt() {
  const { nickname } = useAuth()
  const { 
    expenses, 
    isLoading, 
    error, 
    addExpense, 
    deleteExpense, 
    fetchExpenses,
    getExpenseStats,
    setError 
  } = useExpenses()

  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'with-receipt'>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<string>('all')

  // エラーのクリア
  const clearError = () => setError(null)

  // 手動リフレッシュ
  const handleRefresh = async () => {
    await fetchExpenses()
  }

  // 支出追加時のハンドラー
  const handleAddExpense = async (expenseData: {
    title: string
    amount: number
    category: string
    type: 'income' | 'expense'
    date: string
    paidBy: string
    receipt?: any[]
  }) => {
    console.log('💰 支出追加処理開始:', expenseData)
    
    try {
      const result = await addExpense(expenseData)
      
      if (result.success) {
        console.log('✅ 支出追加成功:', result.data)
        // 成功時は特に通知しない（UIが自動更新される）
      } else {
        console.error('❌ 支出追加失敗:', result.message)
        alert(`❌ エラー: ${result.message}`)
      }
      
      return result
    } catch (err) {
      console.error('❌ 支出追加で予期しないエラー:', err)
      const message = err instanceof Error ? err.message : '予期しないエラーが発生しました'
      alert(`❌ 予期しないエラー: ${message}`)
      return { success: false, message }
    }
  }

  // 支出削除時のハンドラー
  const handleDeleteExpense = async (id: string) => {
    console.log('💰 支出削除処理開始:', id)
    
    try {
      const result = await deleteExpense(id)
      
      if (result.success) {
        console.log('✅ 支出削除成功:', id)
        // 成功時は特に通知しない（UIが自動更新される）
      } else {
        console.error('❌ 支出削除失敗:', result.message)
        alert(`❌ エラー: ${result.message}`)
      }
      
      return result
    } catch (err) {
      console.error('❌ 支出削除で予期しないエラー:', err)
      const message = err instanceof Error ? err.message : '予期しないエラーが発生しました'
      alert(`❌ 予期しないエラー: ${message}`)
      return { success: false, message }
    }
  }

  // フィルタリング
  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'income' && expense.type !== 'income') return false
    if (filter === 'expense' && expense.type !== 'expense') return false
    if (filter === 'with-receipt' && (!expense.receipt || expense.receipt === '')) return false
    if (selectedMonth && !expense.date.startsWith(selectedMonth)) return false
    if (selectedUser !== 'all' && expense.paidBy !== selectedUser) return false
    return true
  })

  // ユニークな月リストを取得
  const availableMonths = [...new Set(expenses.map(e => e.date.slice(0, 7)))]
    .sort((a, b) => b.localeCompare(a))

  // ユニークなユーザーリストを取得
  const availableUsers = [...new Set(expenses.map(e => e.paidBy))]

  // 統計情報
  const stats = getExpenseStats(expenses)

  // ローディング状態
  if (isLoading && expenses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">💰 軍資金管理</h2>
            <p className="text-gray-600">戦略的な資金運用を記録・分析</p>
          </div>
        </div>
        
        {/* ローディング表示 */}
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">軍資金データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">💰 軍資金管理</h2>
          <p className="text-gray-600">戦略的な資金運用を記録・分析</p>
          {isLoading && (
            <div className="flex items-center gap-2 mt-1">
              <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
              <span className="text-xs text-blue-600">更新中...</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </Button>
          <ExpenseFormWithReceipt onAdd={handleAddExpense} nickname={nickname} />
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-medium text-red-900">エラーが発生しました</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              再試行
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* サマリーカード */}
      <ExpenseSummary expenses={expenses} />

      {/* レシート統計 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">📸 レシート管理統計</h3>
              <p className="text-sm text-blue-700">
                全{stats.totalCount}件中 {stats.withReceiptCount}件にレシート添付 
                (計画的記録管理)
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              {stats.receiptRate}%
            </div>
            <div className="text-xs text-blue-600">添付率</div>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">フィルター:</span>
          </div>

          {/* タイプフィルター */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="expense">支出のみ</option>
            <option value="income">収入のみ</option>
            <option value="with-receipt">📸 レシート付きのみ</option>
          </select>

          {/* 月フィルター */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべての月</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('ja-JP', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* ユーザーフィルター */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべてのユーザー</option>
              {availableUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {/* 結果表示 */}
          <div className="ml-auto text-sm text-gray-600">
            {filteredExpenses.length}件の記録
            {isLoading && <span className="text-blue-600"> (更新中)</span>}
          </div>
        </div>
      </div>

      {/* 支出リスト */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ExpenseListWithReceipt 
          expenses={filteredExpenses as any[]} 
          onDelete={handleDeleteExpense}
        />
      </div>

    </div>
  )
}