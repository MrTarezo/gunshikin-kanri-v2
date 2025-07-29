// src/components/fridge/FridgeStorage.tsx
import { useState } from 'react'
import { ImageCapture } from '../common/ImageCapture'
import { ImageGallery } from '../common/ImageGallery'
import { Button } from '../ui/button'
import { Camera, Eye, Thermometer, AlertTriangle } from 'lucide-react'

interface ImageData {
  id: string
  file: File
  url: string
  compressed?: File
  compressedUrl?: string
  timestamp: string
}

interface StorageLocation {
  id: string
  name: string
  icon: string
  temperature: string
  description: string
  color: string
  images: ImageData[]
  lastUpdated?: string
}

interface FridgeStorageProps {
  onStorageUpdate: (locationId: string, images: ImageData[]) => void
  storageData: StorageLocation[]
}

export function FridgeStorage({ onStorageUpdate, storageData }: FridgeStorageProps) {
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'camera'>('grid')

  const handleImageCapture = (locationId: string, imageData: ImageData) => {
    const location = storageData.find(s => s.id === locationId)
    if (location) {
      const updatedImages = [...location.images, imageData]
      onStorageUpdate(locationId, updatedImages)
    }
  }

  const handleImageRemove = (locationId: string, imageId: string) => {
    const location = storageData.find(s => s.id === locationId)
    if (location) {
      const updatedImages = location.images.filter(img => img.id !== imageId)
      onStorageUpdate(locationId, updatedImages)
    }
  }

  const getStorageStats = (location: StorageLocation) => {
    const totalImages = location.images.length
    const lastUpdate = location.lastUpdated 
      ? new Date(location.lastUpdated).toLocaleDateString('ja-JP')
      : '未撮影'
    
    return { totalImages, lastUpdate }
  }

  const isStorageEmpty = (location: StorageLocation) => {
    return location.images.length === 0
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">📸 補給庫状況撮影</h3>
          <p className="text-sm text-gray-600">各庫室の現在の状態を撮影・記録</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            📱 一覧
          </Button>
          <Button
            variant={viewMode === 'camera' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('camera')}
          >
            📸 撮影
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        /* グリッド表示モード */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storageData.map((location) => {
            const stats = getStorageStats(location)
            const isEmpty = isStorageEmpty(location)
            const latestImage = location.images[location.images.length - 1]

            return (
              <div
                key={location.id}
                className={`rounded-lg border-2 overflow-hidden transition-all hover:shadow-md ${location.color}`}
              >
                {/* 庫室情報ヘッダー */}
                <div className="p-4 bg-white bg-opacity-90">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{location.icon}</span>
                      <div>
                        <h4 className="font-semibold">{location.name}</h4>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Thermometer className="h-3 w-3" />
                          {location.temperature}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      <p className="flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        {stats.totalImages}枚
                      </p>
                      <p>{stats.lastUpdate}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{location.description}</p>
                </div>

                {/* 画像プレビュー */}
                <div className="relative aspect-video bg-gray-100">
                  {latestImage ? (
                    <img
                      src={latestImage.compressedUrl || latestImage.url}
                      alt={`${location.name}の状況`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <Camera className="h-8 w-8 mb-2" />
                      <p className="text-sm">未撮影</p>
                    </div>
                  )}
                  
                  {/* オーバーレイボタン */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedStorage(location.id)}
                        className="bg-white bg-opacity-90 text-gray-900 hover:bg-opacity-100"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        詳細
                      </Button>
                    </div>
                  </div>

                  {/* 警告アイコン */}
                  {isEmpty && (
                    <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-600 p-1 rounded-full">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* アクションボタン */}
                <div className="p-3 bg-white bg-opacity-90 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStorage(location.id)
                      setViewMode('camera')
                    }}
                    className="flex-1 text-xs"
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    撮影
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedStorage(location.id)}
                    className="flex-1 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    履歴
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* 撮影モード */
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-lg font-semibold mb-4">📸 庫室選択</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {storageData.map((location) => (
                <Button
                  key={location.id}
                  variant={selectedStorage === location.id ? "default" : "outline"}
                  onClick={() => setSelectedStorage(location.id)}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <span className="text-xl">{location.icon}</span>
                  <span className="text-xs">{location.name}</span>
                  <span className="text-xs text-gray-500">{location.temperature}</span>
                </Button>
              ))}
            </div>
          </div>

          {selectedStorage && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {(() => {
                const location = storageData.find(s => s.id === selectedStorage)
                if (!location) return null

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{location.icon}</span>
                      <div>
                        <h4 className="text-lg font-semibold">{location.name}</h4>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Thermometer className="h-3 w-3" />
                          {location.temperature} • {location.description}
                        </p>
                      </div>
                    </div>

                    <ImageCapture
                      onImageCapture={(imageData) => handleImageCapture(location.id, imageData)}
                      onImageRemove={(imageId) => handleImageRemove(location.id, imageId)}
                      images={location.images}
                      maxImages={5}
                      maxSizeMB={5}
                    />
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* 詳細モーダル */}
      {selectedStorage && viewMode === 'grid' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {(() => {
              const location = storageData.find(s => s.id === selectedStorage)
              if (!location) return null

              return (
                <>
                  <div className="flex justify-between items-center p-6 border-b">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{location.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{location.name}</h3>
                        <p className="text-sm text-gray-600">{location.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStorage(null)}
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="p-6">
                    <ImageGallery
                      images={location.images}
                      onRemove={(imageId) => handleImageRemove(location.id, imageId)}
                      title={`${location.name}の撮影履歴`}
                      emptyMessage={`${location.name}の写真がありません`}
                    />
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}