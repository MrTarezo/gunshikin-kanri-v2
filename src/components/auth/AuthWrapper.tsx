// src/components/auth/AuthWrapper.tsx
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  CheckCircle,
  AlertCircle 
} from 'lucide-react'

interface AuthWrapperProps {
  children: React.ReactNode
}

type AuthMode = 'signin' | 'signup' | 'confirm'

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // 認証が完了している場合はchildrenを表示
  if (isAuthenticated) {
    return <>{children}</>
  }

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  // 未認証の場合は認証フォームを表示
  return <AuthForm />
}

function AuthForm() {
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
    confirmationCode: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { signIn, signUp, confirmSignUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      let result

      switch (authMode) {
        case 'signin':
          result = await signIn({
            email: formData.email,
            password: formData.password,
          })
          break

        case 'signup':
          result = await signUp({
            email: formData.email,
            password: formData.password,
            nickname: formData.nickname,
          })
          if (result.success && !(result as any).isSignUpComplete) {
            setAuthMode('confirm')
          }
          break

        case 'confirm':
          result = await confirmSignUp({
            email: formData.email,
            confirmationCode: formData.confirmationCode
          })
          if (result.success) {
            setAuthMode('signin')
            setMessage({ type: 'success', text: result.message })
          }
          break
      }

      if (result && !result.success) {
        setMessage({ type: 'error', text: result.message })
      } else if (result?.success && authMode !== 'confirm') {
        setMessage({ type: 'success', text: result.message })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '予期しないエラーが発生しました' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      nickname: '',
      confirmationCode: '',
    })
    setMessage(null)
  }

  const switchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode)
    resetForm()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🪖</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            GUNSHIKIN-KANRI-V2
          </h1>
          <p className="text-gray-600">戦略的家計管理システム</p>
          <div className="mt-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              📸 レシート撮影機能付き
            </span>
          </div>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-center mb-4">
              {authMode === 'signin' && '🔐 ログイン'}
              {authMode === 'signup' && '📝 アカウント作成'}
              {authMode === 'confirm' && '✉️ メール確認'}
            </h2>

            {/* タブ切り替え */}
            {authMode !== 'confirm' && (
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
                <button
                  type="button"
                  onClick={() => switchAuthMode('signin')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authMode === 'signin'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ログイン
                </button>
                <button
                  type="button"
                  onClick={() => switchAuthMode('signup')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authMode === 'signup'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  新規登録
                </button>
              </div>
            )}
          </div>

          {/* メッセージ表示 */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* メールアドレス */}
            {authMode !== 'confirm' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* ニックネーム（新規登録のみ） */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ニックネーム
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="ポー"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* パスワード */}
            {authMode !== 'confirm' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="8文字以上"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {authMode === 'signup' && (
                  <p className="text-xs text-gray-500 mt-1">
                    大文字・小文字・数字・記号を含む8文字以上
                  </p>
                )}
              </div>
            )}

            {/* 確認コード */}
            {authMode === 'confirm' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  確認コード
                </label>
                <input
                  type="text"
                  value={formData.confirmationCode}
                  onChange={(e) => setFormData({ ...formData, confirmationCode: e.target.value })}
                  placeholder="123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.email} に送信された6桁のコードを入力してください
                </p>
              </div>
            )}

            {/* 送信ボタン */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  処理中...
                </div>
              ) : (
                <>
                  {authMode === 'signin' && '🔐 ログイン'}
                  {authMode === 'signup' && '📝 アカウント作成'}
                  {authMode === 'confirm' && '✅ 確認'}
                </>
              )}
            </Button>
          </form>

          {/* 戻るボタン（確認画面のみ） */}
          {authMode === 'confirm' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => switchAuthMode('signup')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ← 新規登録に戻る
              </button>
            </div>
          )}
        </div>

        {/* 機能紹介 */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="mb-2">✨ 主要機能</p>
          <div className="flex justify-center space-x-4">
            <span>📸 レシート撮影</span>
            <span>⚔️ 作戦管理</span>
            <span>🧊 補給庫監視</span>
          </div>
        </div>
      </div>
    </div>
  )
}