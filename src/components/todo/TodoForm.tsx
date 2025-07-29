// src/components/todo/TodoForm.tsx
import { useState } from 'react'
import { Button } from '../ui/button'
import { Plus, X, Calendar, User, Flag } from 'lucide-react'

interface TodoData {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in-progress' | 'completed'
  assignee: string
  dueDate: string
  category: string
  createdAt: string
  completedAt?: string
}

interface TodoFormProps {
  onAdd: (todo: Omit<TodoData, 'id' | 'createdAt' | 'completedAt'>) => void
  nickname: string
}

export function TodoForm({ onAdd, nickname }: TodoFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    status: 'pending' as const,
    assignee: nickname,
    dueDate: '',
    category: '一般作戦',
  })

  const priorities = [
    { value: 'low', label: '🟢 低優先度', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: '🟡 中優先度', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: '🟠 高優先度', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: '🔴 緊急', color: 'bg-red-100 text-red-800' },
  ]

  const categories = [
    { value: '一般作戦', label: '⚔️ 一般作戦', color: 'bg-blue-100 text-blue-800' },
    { value: '補給作戦', label: '📦 補給作戦', color: 'bg-green-100 text-green-800' },
    { value: '偵察任務', label: '🔍 偵察任務', color: 'bg-purple-100 text-purple-800' },
    { value: '資金作戦', label: '💰 資金作戦', color: 'bg-yellow-100 text-yellow-800' },
    { value: '緊急対応', label: '🚨 緊急対応', color: 'bg-red-100 text-red-800' },
    { value: '定期任務', label: '🔄 定期任務', color: 'bg-gray-100 text-gray-800' },
  ]

  const assignees = ['ポー', 'モンチ']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    onAdd({
      ...formData,
      status: 'pending',
    })

    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      assignee: nickname,
      dueDate: '',
      category: '一般作戦',
    })
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
      >
        <Plus className="h-4 w-4" />
        新規作戦
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">⚔️ 新規作戦立案</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 作戦名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              作戦名 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例: 食材補給作戦"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* 作戦詳細 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              作戦詳細
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="作戦の詳細を記述..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              作戦種別
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 優先度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Flag className="inline h-4 w-4 mr-1" />
              優先度
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* 担当者 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="inline h-4 w-4 mr-1" />
              担当者
            </label>
            <select
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {assignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>

          {/* 期限 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              作戦期限
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* 送信ボタン */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
              作戦開始
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

