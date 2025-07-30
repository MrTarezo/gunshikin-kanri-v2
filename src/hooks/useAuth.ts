// src/hooks/useAuth.ts (Amplify統合版)
import { useState, useEffect } from 'react'
import { getCurrentUser, signOut as amplifySignOut, signIn as amplifySignIn, signUp as amplifySignUp, confirmSignUp as amplifyConfirmSignUp, fetchUserAttributes } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { useDevAuth } from './dev/useDevAuth'

// 環境設定: DEV_MODE環境変数でモック使用を強制可能
const useDevMode = import.meta.env.VITE_USE_DEV_AUTH === 'true' || false

interface AuthState {
  user: unknown
  isLoading: boolean
  isAuthenticated: boolean
  nickname: string
  email: string
}

interface SignUpParams {
  email: string
  password: string
  nickname: string
}

interface SignInParams {
  email: string
  password: string
}

/**
 * 認証状態管理フック
 * Amplify Cognitoを使用（開発時は環境変数でモック切り替え可能）
 */
export function useAuth() {
  // すべてのフックを最初に宣言（React Hooksのルール）
  const devAuthResult = useDevAuth()
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    nickname: '',
    email: '',
  })
  
  // 初期認証状態の確認
  useEffect(() => {
    if (!useDevMode) {
      checkAuthState()
    }
  }, [])

  // Amplify Hub リスナー（認証状態の変更を監視）
  useEffect(() => {
    if (useDevMode) return
    
    const hubListener = (data: unknown) => {
      const { payload } = data as { payload: { event: string } }
      
      switch (payload.event) {
        case 'signedIn':
          console.log('🎉 サインイン完了')
          checkAuthState()
          break
        case 'signedOut':
          console.log('👋 サインアウト完了')
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            nickname: '',
            email: '',
          })
          break
        case 'tokenRefresh':
          console.log('🔄 トークン更新')
          break
        default:
          break
      }
    }

    // Hubリスナーを登録
    const unsubscribe = Hub.listen('auth', hubListener)

    return () => {
      unsubscribe()
    }
  }, [])
  
  // 開発モード強制時は開発用の結果を返す
  if (useDevMode) {
    console.log('🚀 開発モード: モック認証を使用')
    return devAuthResult
  }

  const checkAuthState = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const user = await getCurrentUser()
      console.log('✅ 認証済みユーザー:', user.username)
      
      // ユーザー属性を取得してnicknameを取得
      try {
        const attributes = await fetchUserAttributes()
        console.log('📝 ユーザー属性:', attributes)
        
        const userNickname = attributes.nickname || 
                            attributes.email?.split('@')[0] || 
                            user.username?.substring(0, 8) || 
                            'ユーザー'
        
        console.log('👤 表示名:', userNickname)
        
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          nickname: userNickname,
          email: user.signInDetails?.loginId || '',
        })
      } catch (attrError) {
        console.warn('⚠️ ユーザー属性取得失敗:', attrError)
        // フォールバック
        const fallbackNickname = user.username?.substring(0, 8) || 'ユーザー'
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          nickname: fallbackNickname,
          email: user.signInDetails?.loginId || '',
        })
      }
    } catch (error) {
      console.log('❌ 未認証ユーザー')
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        nickname: '',
        email: '',
      })
    }
  }

  const signIn = async ({ email, password }: SignInParams) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const { isSignedIn } = await amplifySignIn({
        username: email,
        password,
      })

      if (isSignedIn) {
        await checkAuthState()
        return {
          success: true,
          message: 'ログインしました'
        }
      } else {
        return {
          success: false,
          message: 'ログインに失敗しました'
        }
      }
    } catch (error) {
      console.error('サインインエラー:', error)
      const message = error instanceof Error ? error.message : 'ログインに失敗しました'
      
      setAuthState(prev => ({ ...prev, isLoading: false }))
      
      return {
        success: false,
        message
      }
    }
  }

  const signUp = async ({ email, password, nickname }: SignUpParams) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const { isSignUpComplete, userId } = await amplifySignUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            nickname,
          },
        },
      })

      setAuthState(prev => ({ ...prev, isLoading: false }))

      if (isSignUpComplete) {
        return {
          success: true,
          message: 'アカウントが作成されました',
          data: { userId, needsConfirmation: false }
        }
      } else {
        return {
          success: true,
          message: '確認コードをメールで送信しました。確認してください。',
          data: { userId, needsConfirmation: true }
        }
      }
    } catch (error) {
      console.error('サインアップエラー:', error)
      const message = error instanceof Error ? error.message : 'アカウント作成に失敗しました'
      
      setAuthState(prev => ({ ...prev, isLoading: false }))
      
      return {
        success: false,
        message
      }
    }
  }

  const confirmSignUp = async ({ email, confirmationCode }: { email: string, confirmationCode: string }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const { isSignUpComplete } = await amplifyConfirmSignUp({
        username: email,
        confirmationCode,
      })

      setAuthState(prev => ({ ...prev, isLoading: false }))

      if (isSignUpComplete) {
        return {
          success: true,
          message: 'アカウントが確認されました。ログインしてください。'
        }
      } else {
        return {
          success: false,
          message: '確認に失敗しました'
        }
      }
    } catch (error) {
      console.error('確認エラー:', error)
      const message = error instanceof Error ? error.message : '確認に失敗しました'
      
      setAuthState(prev => ({ ...prev, isLoading: false }))
      
      return {
        success: false,
        message
      }
    }
  }

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      await amplifySignOut()
      
      return {
        success: true,
        message: 'ログアウトしました'
      }
    } catch (error) {
      console.error('サインアウトエラー:', error)
      const message = error instanceof Error ? error.message : 'ログアウトに失敗しました'
      
      setAuthState(prev => ({ ...prev, isLoading: false }))
      
      return {
        success: false,
        message
      }
    }
  }

  const updateProfile = async () => {
    return {
      success: true,
      message: 'プロフィール更新機能は未実装です'
    }
  }

  return {
    ...authState,
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    updateProfile,
    checkAuthState,
  }
}