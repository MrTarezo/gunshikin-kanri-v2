// amplify/storage/resource.ts - Amplify Gen 2 ストレージ設定（修正版）
import { defineStorage } from '@aws-amplify/backend'

/**
 * 軍資金管理システム ストレージ設定
 * レシート・食材画像・庫室撮影の統合ストレージ (Gen 2 最新仕様)
 */
export const storage = defineStorage({
  name: 'gunshikinKanriStorage',
  
  // アクセス設定
  access: (allow) => ({
    // レシート画像（軍資金管理用） - expenseId別管理
    'receipts/*': [
      allow.authenticated.to(['read', 'write', 'delete'])
    ],
    
    // 食材画像（補給庫管理用）
    'fridge-items/{user_id}/*': [
      allow.authenticated.to(['read', 'write', 'delete'])
    ],
    
    // 庫室撮影画像
    'storage-photos/{user_id}/*': [
      allow.authenticated.to(['read', 'write', 'delete'])
    ],
    
    // ユーザープロフィール画像
    'profile-pictures/{user_id}/*': [
      allow.authenticated.to(['read', 'write', 'delete'])
    ],
    
    // 公開アセット（アプリアイコン等）
    'public/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
    ],
    
    // 一時アップロード領域
    'tmp/{user_id}/*': [
      allow.authenticated.to(['read', 'write', 'delete'])
    ],
  }),
})