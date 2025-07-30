// amplify/auth/resource.ts - 完全権限設定版
import { defineAuth } from '@aws-amplify/backend'

/**
 * 軍資金管理システム認証設定
 * データアクセス権限を含む完全設定 (Gen 2 最新仕様)
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  
  // データアクセスに必要なユーザー属性
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    
    nickname: {
      required: false,
      mutable: true,
    },
    
    // データ管理用の追加属性
    preferredUsername: {
      required: false,
      mutable: true,
    },
  },
  
  // 本番環境ではMFA推奨
  multifactor: {
    mode: 'OPTIONAL', // 本番では 'REQUIRED' を検討
    totp: true,
    sms: false, // SMSは本番では有効化を検討
  },
})