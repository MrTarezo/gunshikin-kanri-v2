// amplify/data/resource.ts (既存スキーマ完全互換版)
import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

/**
 * GUNSHIKIN-KANRI-V2 データスキーマ（既存完全互換版）
 * 既存のDynamoDBテーブル構造をそのまま再現
 */
const schema = a.schema({
  // 既存 Expense テーブルと完全に同じ構造
  Expense: a
    .model({
      id: a.id(),
      title: a.string().required(),
      amount: a.float().required(),
      paidBy: a.string().required(),
      comment: a.string(), // 既存フィールド名のまま
      date: a.date().required(),
      type: a.string(), // 既存はString型
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      receipt: a.string(), // 既存は単一文字列
      settled: a.boolean().required(),
      settlementMonth: a.string(),
      category: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  // 既存 Todo テーブルと完全に同じ構造  
  Todo: a
    .model({
      id: a.id(),
      title: a.string().required(),
      done: a.boolean().required(), // 既存フィールド名のまま
      owner: a.string(), // 既存フィールド
      dueDate: a.date(),
      assignee: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),

  // 既存 FridgeItem テーブルと完全に同じ構造
  FridgeItem: a
    .model({
      id: a.id(),
      name: a.string().required(),
      addedDate: a.date().required(), // 既存フィールド名のまま
      location: a.string(),
      isUrgent: a.boolean(), // 既存フィールド
      image: a.string(), // 既存は単一文字列
    })
    .authorization((allow) => [allow.owner()]),

  // 既存 Receipt テーブルと完全に同じ構造
  Receipt: a
    .model({
      id: a.id(),
      imageKey: a.string().required(),
      uploadedAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.owner()]),

  // ユーザープロフィール（新規追加のみ）
  UserProfile: a
    .model({
      userId: a.id().required(),
      nickname: a.string().required(),
      timezone: a.string().default('Asia/Tokyo'),
      preferences: a.json(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    // デプロイ時に必要（本番では後で削除検討）
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
})

// データベース設定（既存テーブル構造に最適化）
export const dataConfig = {
  tables: {
    // 既存テーブル設定
    Expense: {
      billing: 'ON_DEMAND',
      pointInTimeRecovery: true,
    },
    Todo: {
      billing: 'ON_DEMAND', 
      pointInTimeRecovery: true,
    },
    FridgeItem: {
      billing: 'ON_DEMAND',
      pointInTimeRecovery: true,
    },
    Receipt: {
      billing: 'ON_DEMAND',
      pointInTimeRecovery: true,
    },
  },
  
  // バックアップ設定
  backup: {
    enabled: true,
    retentionDays: 30,
  },
}