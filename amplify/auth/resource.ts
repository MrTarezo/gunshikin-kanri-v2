// amplify/auth/resource.ts - 最小構成版（まず動作確認）
import { defineAuth } from '@aws-amplify/backend'

/**
 * 軍資金管理システム認証設定
 * 最小構成でまず動作確認 (Gen 2 最新仕様)
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  
  // 基本的なユーザー属性のみ
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    
    nickname: {
      required: false,
      mutable: true,
    },
  },
})