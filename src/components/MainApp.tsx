
// src/components/MainApp.tsx
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
// import { useExpenses } from '../hooks/useExpenses'
// import { useTodos } from '../hooks/useTodos'
import { useToastContext } from '../contexts/ToastContext'

// Page Components
import { ExpensePageWithReceipt } from './expense/ExpensePageWithReceipt'
import { TodoPage } from './todo/TodoPage'
import { FridgePage } from './fridge/FridgePage'
import { DashboardPage } from './dashboard/DashboardPage'

// UI Components
import { Button } from './ui/button'
import { SyncIndicator } from './common/SyncIndicator'

// Icons
import { 
  PieChart, 
  List, 
  Refrigerator,
  Wallet,
  User,
  LogOut,
  Camera
} from 'lucide-react'

type TabType = 'dashboard' | 'expenses' | 'todo' | 'fridge'

export function MainApp() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const { nickname, signOut } = useAuth()
  // const { getExpenseStats } = useExpenses()
  // const { getTodoStats } = useTodos()
  const { toast } = useToastContext()

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      toast.success('ログアウトしました', 'また次回お会いしましょう！')
    } else {
      toast.error('ログアウトに失敗', result.message)
    }
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'ダッシュボード', icon: PieChart, color: 'text-blue-600' },
    { id: 'expenses' as TabType, label: '軍資金', icon: Wallet, color: 'text-green-600' },
    { id: 'todo' as TabType, label: '作戦', icon: List, color: 'text-purple-600' },
    { id: 'fridge' as TabType, label: '補給庫', icon: Refrigerator, color: 'text-orange-600' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onTabChange={setActiveTab} />
      case 'expenses':
        return <ExpensePageWithReceipt />
      case 'todo':
        return <TodoPage />
      case 'fridge':
        return <FridgePage />
      default:
        return <DashboardPage onTabChange={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🪖</div>
              <h1 className="text-xl font-bold text-gray-900">
                軍資金管理システム
              </h1>
              <div className="hidden sm:flex items-center ml-4 space-x-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  📸 レシート撮影
                </span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  🔄 自動同期
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 同期状態インジケータ */}
              <SyncIndicator />
              
              {/* ユーザー情報 */}
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{nickname}</p>
                  <p className="text-xs text-gray-500">指揮官</p>
                </div>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </div>
              
              {/* ログアウト */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タブナビゲーション - アイコンのみ */}
        <nav className="mb-8">
          <div className="flex justify-center">
            <div className="flex space-x-1 bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg transform scale-110'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 transform hover:scale-105'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isActive ? 'text-white' : tab.color}`} />
                    
                    {/* レシート撮影アイコン */}
                    {tab.id === 'expenses' && (
                      <Camera className={`absolute -top-1 -right-1 h-4 w-4 ${
                        isActive ? 'text-blue-200' : 'text-blue-500'
                      }`} />
                    )}
                    
                    {/* アクティブタブのドット */}
                    {isActive && (
                      <div className="absolute -bottom-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* コンテンツエリア */}
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  )
}