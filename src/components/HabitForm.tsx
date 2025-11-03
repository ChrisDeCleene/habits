import { useState } from 'react'
import { X } from 'lucide-react'
import { EmojiPicker } from './EmojiPicker'
import type { Frequency, Unit } from '../types/habit'

interface HabitFormProps {
  onSubmit: (habit: {
    name: string
    emoji: string
    goalMin: number
    goalMax: number | null
    unit: Unit
    frequency: Frequency
  }) => Promise<void>
  onCancel: () => void
}

export function HabitForm({ onSubmit, onCancel }: HabitFormProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [goalMin, setGoalMin] = useState('')
  const [goalMax, setGoalMax] = useState('')
  const [unit, setUnit] = useState<Unit>('times')
  const [frequency, setFrequency] = useState<Frequency>('daily')
  const [isRange, setIsRange] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const minValue = parseInt(goalMin)
    const maxValue = isRange && goalMax ? parseInt(goalMax) : null

    if (!name.trim()) {
      setError('Please enter a habit name')
      return
    }

    if (isNaN(minValue) || minValue < 1) {
      setError('Please enter a valid goal')
      return
    }

    if (isRange && maxValue && maxValue <= minValue) {
      setError('Maximum goal must be greater than minimum goal')
      return
    }

    try {
      setLoading(true)
      await onSubmit({
        name: name.trim(),
        emoji,
        goalMin: minValue,
        goalMax: maxValue,
        unit,
        frequency
      })
      onCancel()
    } catch (err) {
      console.error('Error creating habit:', err)
      setError('Failed to create habit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Habit</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-start gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <EmojiPicker value={emoji} onChange={setEmoji} />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Habit Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Exercise"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={50}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="workday">Workdays (Mon-Fri)</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                value={goalMin}
                onChange={(e) => setGoalMin(e.target.value)}
                placeholder="1"
                min="1"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {isRange && (
                <>
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    value={goalMax}
                    onChange={(e) => setGoalMax(e.target.value)}
                    placeholder="5"
                    min={parseInt(goalMin) + 1 || 2}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </>
              )}
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="times">times</option>
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
                <option value="blocks">25-min blocks</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isRange}
                onChange={(e) => {
                  setIsRange(e.target.checked)
                  if (!e.target.checked) setGoalMax('')
                }}
                className="rounded"
              />
              Set a range (e.g., 3-5 times)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
