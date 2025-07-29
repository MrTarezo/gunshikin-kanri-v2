// src/hooks/useImageOptimization.ts
import { useState, useCallback } from 'react'

interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}

/**
 * 画像最適化フック
 * レシート・食材画像の圧縮・変換
 */
export function useImageOptimization() {
  const [isProcessing, setIsProcessing] = useState(false)

  const optimizeImage = useCallback(async (
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<{ optimized: File; url: string }> => {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      format = 'jpeg'
    } = options

    setIsProcessing(true)

    try {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        const img = new Image()

        img.onload = () => {
          // アスペクト比を保持してリサイズ
          let { width, height } = img
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height

          // 画像を描画
          ctx.drawImage(img, 0, 0, width, height)

          // 最適化されたBlobを取得
          const mimeType = `image/${format}`
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimized = new File([blob], file.name, {
                  type: mimeType,
                  lastModified: Date.now(),
                })
                const url = URL.createObjectURL(optimized)
                resolve({ optimized, url })
              } else {
                reject(new Error('画像の最適化に失敗しました'))
              }
            },
            mimeType,
            quality
          )
        }

        img.onerror = () => {
          reject(new Error('画像の読み込みに失敗しました'))
        }

        img.src = URL.createObjectURL(file)
      })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const createThumbnail = useCallback(async (
    file: File,
    size: number = 150
  ): Promise<{ thumbnail: File; url: string }> => {
    return optimizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'jpeg'
    }).then(result => ({
      thumbnail: result.optimized,
      url: result.url
    }))
  }, [optimizeImage])

  return {
    optimizeImage,
    createThumbnail,
    isProcessing
  }
}

