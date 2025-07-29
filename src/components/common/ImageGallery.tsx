// src/components/common/ImageGallery.tsx
import { useState } from 'react'
import { ImagePreview } from './ImagePreview'
import { Button } from '../ui/button'
import { Grid, List as ListIcon, Trash2 } from 'lucide-react'

interface ImageData {
  id: string
  file: File
  url: string
  compressed?: File
  compressedUrl?: string
  timestamp: string
}

interface ImageGalleryProps {
  images: ImageData[]
  onRemove?: (id: string) => void
  title?: string
  emptyMessage?: string
  className?: string
}

export function ImageGallery({ 
  images, 
  onRemove, 
  title = "画像ギャラリー",
  emptyMessage = "画像がありません",
  className = ""
}: ImageGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  if (images.length === 0) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="text-4xl mb-2">🖼️</div>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title} ({images.length})</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 画像表示 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((image) => (
            <ImagePreview
              key={image.id}
              image={image}
              onRemove={onRemove}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm"
            >
              <img
                src={image.compressedUrl || image.url}
                alt="画像"
                className="w-16 h-16 object-cover rounded border"
              />
              <div className="flex-1">
                <p className="font-medium">{image.file.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(image.timestamp).toLocaleString('ja-JP')}
                </p>
                <p className="text-xs text-gray-500">
                  {(image.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {onRemove && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(image.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}