// src/main.tsx (Amplify統合版)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Amplify設定を最初に初期化
import './lib/amplify-config'

// エラーハンドリング
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)