
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
import { SyncIndicator } from './common/SyncIndicator'

// Icons
import { 
  Target, 
  Crosshair, 
  Package,
  Coins,
  Shield,
  LogOut,
  Camera,
  Zap,
  AlertTriangle
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
    { id: 'dashboard' as TabType, label: '司令部', icon: Target, color: 'text-yellow-400' },
    { id: 'expenses' as TabType, label: '軍資金', icon: Coins, color: 'text-yellow-500' },
    { id: 'todo' as TabType, label: '作戦', icon: Crosshair, color: 'text-red-400' },
    { id: 'fridge' as TabType, label: '補給庫', icon: Package, color: 'text-green-400' },
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
    <div className={`min-h-screen relative ${activeTab === 'dashboard' ? 'camo-bg-image' : 'bg-gray-50'}`}>
      {/* ヘッダー */}
      <header className="command-panel shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/icons/icon-72x72.png" alt="軍資金管理" className="w-8 h-8" />
              <h1 className="military-title text-xl text-yellow-400">
                軍資金管理
              </h1>
              <div className="hidden sm:flex items-center ml-4 space-x-2">
                <span className="tactical-border text-xs text-yellow-300 px-2 py-1 military-mono">
                  <Camera className="inline h-3 w-3 mr-1" />
                  RECON
                </span>
                <span className="tactical-border text-xs text-green-300 px-2 py-1 military-mono">
                  <Zap className="inline h-3 w-3 mr-1" />
                  SYNC
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 同期状態インジケータ */}
              <SyncIndicator />
              
              {/* ユーザー情報 */}
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-yellow-300 military-text">{nickname}</p>
                  <p className="text-xs text-yellow-500 military-mono">COMMANDER</p>
                </div>
                <button className="tactical-button px-3 py-1 rounded military-mono text-xs">
                  <Shield className="h-4 w-4" />
                </button>
              </div>
              
              {/* ログアウト */}
              <button 
                onClick={handleSignOut}
                className="alert-status px-3 py-1 rounded military-mono text-xs text-white hover:scale-105 transition-transform"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 戦術タブナビゲーション */}
        <nav className="mb-8">
          <div className="flex justify-center">
            <div className="flex space-x-2 command-panel rounded-lg p-3">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex flex-col items-center justify-center w-20 h-16 rounded-lg transition-all duration-300 military-mono text-xs ${
                      isActive
                        ? 'tactical-button text-yellow-400 shadow-lg transform scale-105'
                        : 'text-yellow-600 hover:text-yellow-300 hover:bg-black hover:bg-opacity-20 transform hover:scale-102'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-yellow-400' : tab.color}`} />
                    <span className="uppercase tracking-wider">{tab.label}</span>
                    
                    {/* 偵察カメラアイコン */}
                    {tab.id === 'expenses' && (
                      <Camera className={`absolute -top-1 -right-1 h-3 w-3 ${
                        isActive ? 'text-yellow-300' : 'text-yellow-500'
                      }`} />
                    )}
                    
                    {/* アクティブ状態インジケーター */}
                    {isActive && (
                      <div className="absolute -bottom-1 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                    
                    {/* アラート状態（例：緊急作戦） */}
                    {tab.id === 'todo' && (
                      <AlertTriangle className={`absolute -top-1 -left-1 h-3 w-3 ${
                        isActive ? 'text-red-300' : 'text-red-500'
                      } animate-pulse`} />
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