// src/App.tsx (Amplify統合版)
import { useEffect } from 'react'
import './App.css'
import './lib/amplify-config' // Amplify設定を初期化

// Context Providers
import { ToastProvider } from './contexts/ToastContext'

// Core Components
import { AuthWrapper } from './components/auth/AuthWrapper'
import { MainApp } from './components/MainApp'

// PWA Components
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt'
import { OfflineIndicator } from './components/common/OfflineIndicator'

// Hooks
import { useRealtimeSync } from './hooks/useRealtimeSync'

function App() {
  return (
    <ToastProvider>
      <AuthWrapper>
        <AppWithProviders />
      </AuthWrapper>
    </ToastProvider>
  )
}

function AppWithProviders() {
  const { setupSubscriptions } = useRealtimeSync()

  useEffect(() => {
    // リアルタイム同期の初期化（開発モードではモック処理）
    setupSubscriptions({
      onExpenseChange: (expenses: unknown[]) => {
        console.log('💰 支出データが更新されました:', expenses.length)
      },
      onTodoChange: (todos: unknown[]) => {
        console.log('⚔️ 作戦データが更新されました:', todos.length)
      }
    })
  }, [setupSubscriptions])

  return (
    <>
      <MainApp />
      <PWAInstallPrompt />
      <OfflineIndicator />
    </>
  )
}

export default App