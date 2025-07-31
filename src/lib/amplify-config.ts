// src/lib/amplify-config.ts - 実用版
import { Amplify } from 'aws-amplify'

// Amplify設定を初期化する関数
export async function configureAmplify() {
  let outputs: any = null

  // 開発/本番環境に応じてAmplify設定
  if (import.meta.env.DEV) {
    console.log('🚀 開発モード: 実際のAmplify設定を使用（デバッグ有効）')
    // 開発環境では動的インポート
    try {
      outputs = await import('../../amplify_outputs.json')
    } catch (error) {
      console.warn('⚠️ amplify_outputs.jsonが見つかりません。開発モードで継続します。')
      // プレースホルダー設定を使用
      try {
        const response = await fetch('/amplify_outputs.json')
        outputs = await response.json()
      } catch {
        return null
      }
    }
  } else {
    console.log('🌟 本番モード: Amplify設定を使用')
    
    // Amplify Gen2では、ビルド時に環境変数として設定が提供される
    if (typeof window !== 'undefined' && (window as any).amplifyConfig) {
      console.log('✅ Amplify設定が環境変数から見つかりました')
      outputs = (window as any).amplifyConfig
    } else {
      // フォールバック: publicディレクトリから読み込み
      try {
        const response = await fetch('/amplify_outputs.json')
        outputs = await response.json()
      } catch (error) {
        console.error('❌ amplify_outputs.jsonの読み込みに失敗:', error)
        return null
      }
    }
  }

  if (outputs) {
    try {
      Amplify.configure(outputs)
      console.log('✅ Amplify設定完了', {
        region: outputs.auth?.aws_region,
        userPoolId: outputs.auth?.user_pool_id,
        apiUrl: outputs.data?.url,
        storageBucket: outputs.storage?.bucket_name
      })
      return outputs
    } catch (error) {
      console.error('❌ Amplify設定エラー:', error)
      return null
    }
  }
  
  return null
}