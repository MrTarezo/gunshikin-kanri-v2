// src/lib/amplify-config.ts - 実用版
import { Amplify } from 'aws-amplify'
import outputs from '../../amplify_outputs.json'

// 開発/本番環境に応じてAmplify設定
if (import.meta.env.DEV) {
  console.log('🚀 開発モード: 実際のAmplify設定を使用（デバッグ有効）')
} else {
  console.log('🌟 本番モード: Amplify設定を使用')
}

try {
  Amplify.configure(outputs)
  console.log('✅ Amplify設定完了', {
    region: outputs.auth.aws_region,
    userPoolId: outputs.auth.user_pool_id,
    apiUrl: outputs.data.url,
    storageBucket: outputs.storage.bucket_name
  })
} catch (error) {
  console.error('❌ Amplify設定エラー:', error)
}

export default outputs