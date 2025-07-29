// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react'

/**
 * ローカルストレージフック
 * オフライン対応・設定保存用
 */
export function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // 初期値の取得
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`ローカルストレージの読み込みエラー (${key}):`, error)
      return initialValue
    }
  })

  // 値の更新
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`ローカルストレージの保存エラー (${key}):`, error)
    }
  }

  return [storedValue, setValue]
}
