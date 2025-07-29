// src/components/common/ImagePreview.tsx
import { useState } from 'react'
import { Button } from '../ui/button'
import { Eye, Trash2, X } from 'lucide-react'

interface ImageData {
  id: string
  file: File
  url: string
  compressed?: File
  compressedUrl?: string
  timestamp: string
}

interface ImagePreviewProps {
  image: ImageData
  onRemove?: (id: string) => void
}

export function ImagePreview({ image, onRemove }: ImagePreviewProps) {
  const [isEnlarged, setIsEnlarged] = useState(false)
  const [imageError, setImageError] = useState(false)

  const displayUrl = image.compressedUrl || image.url
  const originalUrl = image.url

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (imageError) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center p-2 border border-gray-200">
        <div className="text-2xl mb-2">❌</div>
        <p className="text-xs text-gray-500 text-center">画像の読み込みに失敗</p>
        {onRemove && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(image.id)}
            className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      {/* プレビューカード */}
      <div className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all">
        <img
          src={displayUrl}
          alt="撮影画像"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEnlarged(true)}
              className="bg-white bg-opacity-90 hover:bg-opacity-100"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {onRemove && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemove(image.id)}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 画像情報 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
          <p className="text-xs text-white opacity-90">
            {formatTimestamp(image.timestamp)}
          </p>
          <p className="text-xs text-white opacity-70">
            {formatFileSize(image.file.size)}
          </p>
        </div>
      </div>

      {/* 拡大表示モーダル */}
      {isEnlarged && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={originalUrl}
              alt="拡大画像"
              className="max-w-full max-h-full object-contain"
            />
            
            {/* 閉じるボタン */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEnlarged(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* 画像詳細 */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
              <p className="text-sm">📅 {formatTimestamp(image.timestamp)}</p>
              <p className="text-sm">📦 {formatFileSize(image.file.size)}</p>
              <p className="text-sm">📐 {image.file.name}</p>
            </div>

            {/* 削除ボタン */}
            {onRemove && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onRemove(image.id)
                  setIsEnlarged(false)
                }}
                className="absolute top-4 left-4 bg-red-600 text-white hover:bg-red-700 border-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
