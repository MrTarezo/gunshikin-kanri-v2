// amplify/backend.ts - Amplify Gen 2 最新版（修正版）
import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { storage } from './storage/resource'

/**
 * GUNSHIKIN-KANRI-V2 バックエンド定義
 * 軍資金管理・作戦計画・補給庫管理の統合バックエンド (既存スキーマ完全互換)
 */
export const backend = defineBackend({
  auth,
  data,
  storage,
})

// カスタム設定
const { cfnUserPool } = backend.auth.resources.cfnResources

// Cognito User Pool の詳細設定
if (cfnUserPool) {
  cfnUserPool.policies = {
    passwordPolicy: {
      minimumLength: 8,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      requireUppercase: true,
    }
  }
  
  cfnUserPool.accountRecoverySetting = {
    recoveryMechanisms: [
      {
        name: 'verified_email',
        priority: 1,
      },
    ],
  }
  
  cfnUserPool.autoVerifiedAttributes = ['email']
  cfnUserPool.usernameAttributes = ['email']
}

// カスタムアウトプット
backend.addOutput({
  custom: {
    appName: 'GUNSHIKIN-KANRI-V2',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      expenses: 'レシート撮影付き軍資金管理',
      todos: '戦略的作戦計画管理', 
      fridge: '補給庫状況監視システム'
    },
    compatibility: {
      schemaVersion: 'legacy-compatible',
      dataSource: 'existing-tables'
    }
  }
})