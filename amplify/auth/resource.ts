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
})