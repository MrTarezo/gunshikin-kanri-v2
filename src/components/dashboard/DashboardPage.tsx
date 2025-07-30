// src/components/dashboard/DashboardPage.tsx
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useExpenses } from '../../hooks/useExpenses'
import { useTodos } from '../../hooks/useTodos'
import { useFridge } from '../../hooks/useFridge'
import { useToastContext } from '../../contexts/ToastContext'
import { Button } from '../ui/button'
import { 
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  AlertTriangle,
  Receipt,
  Camera,
  Plus,
  RefreshCw,
  Target,
  Award
} from 'lucide-react'

interface DashboardPageProps {
  onTabChange: (tab: 'dashboard' | 'expenses' | 'todo' | 'fridge') => void
}

export function DashboardPage({ onTabChange }: DashboardPageProps) {
  const { nickname } = useAuth()
  const { toast } = useToastContext()
  const [refreshing, setRefreshing] = useState(false)

  // データフック
  const { getExpenseStats } = useExpenses()
  const { getTodoStats } = useTodos()
  const { getFridgeStats } = useFridge()

  // 統計データの取得
  const expenseStats = getExpenseStats()
  const todoStats = getTodoStats()
  const fridgeStats = getFridgeStats()

  // データリフレッシュ
  const handleRefreshAll = async () => {
    setRefreshing(true)
    try {
      // 各モジュールのデータを再取得
      await Promise.all([
        // 実際のデータ取得処理がここに入る
      ])
      toast.success('データを更新しました', '最新の情報に同期完了')
    } catch (error) {
      toast.error('更新に失敗しました', 'ネットワーク接続を確認してください')
    } finally {
      setRefreshing(false)
    }
  }

  // 今日の実績データ
  const todayStats = {
    expenseCount: 2, // 今日の支出記録数
    expenseAmount: 3500, // 今日の支出合計
    todoCount: 1, // 今日のタスク数
    completedTodos: 1, // 今日完了タスク数
    todoCompletionRate: 100 // 今日の達成率
  }

  return (
    <div className="space-y-6">
      {/* ウェルカムヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Hello、{nickname}軍曹！ 🪖
            </h2>
            <p className="text-blue-100">
              ダッシュボードです
            </p>
            <p className="text-xs text-blue-200 mt-2">
              📊 リアルタイム更新対応
            </p>
          </div>
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={refreshing}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              更新
            </Button>
          </div>
        </div>
      </div>

      {/* メインメトリクス */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 今月の収入 */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">今月の収入</p>
              <p className="text-2xl font-bold">¥{expenseStats.totalIncome.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="text-xs text-green-100">前月比+12%</span>
              </div>
            </div>
            <Wallet className="h-8 w-8 text-green-200" />
          </div>
        </div>

        {/* 今月の支出 */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">今月の支出</p>
              <p className="text-2xl font-bold">¥{expenseStats.totalExpense.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                <span className="text-xs text-red-100">前月比-8%</span>
              </div>
            </div>
            <TrendingDown className="h-8 w-8 text-red-200" />
          </div>
        </div>

        {/* 残高 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">今月の残高</p>
              <p className="text-2xl font-bold">
                +¥{expenseStats.balance.toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                <Target className="h-3 w-3 mr-1" />
                <span className="text-xs text-blue-100">貯蓄目標進捗中</span>
              </div>
            </div>
            <PieChart className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        {/* 緊急対応 */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">緊急対応</p>
              <p className="text-2xl font-bold">{todoStats.urgentItems + fridgeStats.urgentItems}件</p>
              <div className="flex items-center mt-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span className="text-xs text-purple-100">
                  作戦{todoStats.urgentItems}件・補給{fridgeStats.urgentItems}件
                </span>
              </div>
            </div>
            <AlertTriangle className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* 今日の目標・実績 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-600" />
          📅 今日の実績
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{todayStats.expenseCount}</div>
            <div className="text-sm text-blue-700">記録した支出</div>
            <div className="text-xs text-blue-600 mt-1">¥{todayStats.expenseAmount.toLocaleString()}</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{expenseStats.receiptRate}%</div>
            <div className="text-sm text-green-700">レシート添付率</div>
            <div className="text-xs text-green-600 mt-1">目標80%以上</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{todayStats.completedTodos}</div>
            <div className="text-sm text-purple-700">完了した作戦</div>
            <div className="text-xs text-purple-600 mt-1">{todayStats.todoCompletionRate}%達成率</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{fridgeStats.totalItems}</div>
            <div className="text-sm text-orange-700">補給品在庫</div>
            <div className="text-xs text-orange-600 mt-1">{fridgeStats.urgentItems}件要注意</div>
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <img src="/icons/icon-72x72.png" alt="軍資金管理" className="w-5 h-5" />
          クイックアクション
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => onTabChange('expenses')}
            variant="outline" 
            className="h-20 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300"
          >
            <div className="flex items-center gap-1">
              <Wallet className="h-4 w-4 text-green-600" />
              <Camera className="h-3 w-3 text-blue-500" />
            </div>
            <span className="text-sm">📸 レシート記録</span>
          </Button>
          
          <Button 
            onClick={() => onTabChange('todo')}
            variant="outline" 
            className="h-20 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-300"
          >
            <Plus className="h-5 w-5 text-purple-600" />
            <span className="text-sm">新規作戦</span>
          </Button>
          
          <Button 
            onClick={() => onTabChange('fridge')}
            variant="outline" 
            className="h-20 flex flex-col items-center gap-2 hover:bg-orange-50 hover:border-orange-300"
          >
            <div className="flex items-center gap-1">
              <Receipt className="h-4 w-4 text-orange-600" />
              <Camera className="h-3 w-3 text-blue-500" />
            </div>
            <span className="text-sm">📸 補給庫撮影</span>
          </Button>
          
          <Button 
            onClick={handleRefreshAll}
            variant="outline" 
            className="h-20 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
            disabled={refreshing}
          >
            <RefreshCw className={`h-5 w-5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">データ更新</span>
          </Button>
        </div>
      </div>

      {/* システム情報 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-blue-600 mr-3">💡</div>
          <div>
            <h4 className="text-sm font-medium text-blue-800">使い方のヒント</h4>
            <p className="text-xs text-blue-700 mt-1">
              レシート撮影で自動的に支出が記録され、作戦管理で効率的にタスクを管理できます。定期的に補給庫もチェックしましょう。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}