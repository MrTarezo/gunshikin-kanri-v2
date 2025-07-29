// src/components/common/ImageCapture.tsx
import { useState, useRef } from 'react'
import { Button } from '../ui/button'
import { Camera, Upload } from 'lucide-react'

interface ImageData {
  id: string
  file: File
  url: string
  compressed?: File
  compressedUrl?: string
  timestamp: string
}

interface ImageCaptureProps {
  onImageCapture: (imageData: ImageData) => void
  onImageRemove?: (id: string) => void
  maxImages?: number
  images?: ImageData[]
  accept?: string
  maxSizeMB?: number
  quality?: number
  className?: string
}

export function ImageCapture({
  onImageCapture,
  maxImages = 5,
  images = [],
  accept = "image/*",
  maxSizeMB = 2,
  quality = 0.8,
  className = ""
}: ImageCaptureProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // 画像圧縮関数
  const compressImage = async (file: File): Promise<{ compressed: File; compressedUrl: string }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // 最大サイズを設定（縦横どちらかが1200pxを超えないように）
        const maxWidth = 1200
        const maxHeight = 1200
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

        // 圧縮されたBlobを取得
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressed = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              const compressedUrl = URL.createObjectURL(compressed)
              resolve({ compressed, compressedUrl })
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (images.length >= maxImages) {
      alert(`最大${maxImages}枚まで選択できます`)
      return
    }

    setIsProcessing(true)

    try {
      for (let i = 0; i < Math.min(files.length, maxImages - images.length); i++) {
        const file = files[i]
        
        // ファイルサイズチェック
        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(`ファイルサイズは${maxSizeMB}MB以下にしてください`)
          continue
        }

        const originalUrl = URL.createObjectURL(file)
        const { compressed, compressedUrl } = await compressImage(file)

        const imageData: ImageData = {
          id: Date.now().toString() + i,
          file,
          url: originalUrl,
          compressed,
          compressedUrl,
          timestamp: new Date().toISOString(),
        }

        onImageCapture(imageData)
      }
    } catch (error) {
      console.error('画像処理エラー:', error)
      alert('画像の処理中にエラーが発生しました')
    } finally {
      setIsProcessing(false)
      // input要素をリセット
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const canAddMore = images.length < maxImages

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 撮影・選択ボタン */}
      {canAddMore && (
        <div className="flex flex-wrap gap-3">
          {/* カメラ撮影 */}
          <Button
            type="button"
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-300"
          >
            <Camera className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700">📸 撮影</span>
          </Button>

          {/* ファイル選択 */}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-300"
          >
            <Upload className="h-4 w-4 text-green-600" />
            <span className="text-green-700">📁 ファイル</span>
          </Button>

          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              処理中...
            </div>
          )}
        </div>
      )}

      {/* 隠しinput要素 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept={accept}
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        multiple={maxImages > 1}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        multiple={maxImages > 1}
      />

      {/* 画像プレビューグリッド */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              📸 撮影済み画像 ({images.length}/{maxImages})
            </h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image) => (
              <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={image.compressedUrl || image.url} 
                  alt="撮影画像" 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用ガイド */}
      {images.length === 0 && (
        <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-4xl mb-2">📸</div>
          <p className="text-sm text-gray-600 mb-2">
            レシートや領収書を撮影・選択してください
          </p>
          <p className="text-xs text-gray-500">
            最大{maxImages}枚まで・{maxSizeMB}MB以下
          </p>
        </div>
      )}
    </div>
  )
}
