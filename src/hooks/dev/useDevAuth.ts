// src/hooks/dev/useDevAuth.ts - 開発用認証フック
import { useState } from 'react'

export function useDevAuth() {
  const [authState] = useState({
    user: { username: 'dev-user' },
    isLoading: false,
    isAuthenticated: true,
    nickname: 'ポー（開発）',
    email: 'dev@example.com',
  })

  const signIn = async () => ({
    success: true,
    message: '開発モードでログインしました'
  })

  const signUp = async () => ({
    success: true,
    message: '開発モードでサインアップしました'
  })

  const confirmSignUp = async () => ({
    success: true,
    message: '開発モードで確認しました'
  })

  const signOut = async () => ({
    success: true,
    message: '開発モードでログアウトしました'
  })

  const updateProfile = async () => ({
    success: true,
    message: '開発モードでプロフィール更新しました'
  })

  const checkAuthState = async () => {
    // 何もしない
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