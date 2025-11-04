import { useState } from 'react'
import { Plus, Minus, Trash2, Pencil } from 'lucide-react'
import type { Habit } from '../types/habit'
import { useTodayLog, useCurrentPeriodLog } from '../hooks/useHabitLogs'

interface HabitCardProps {
  habit: Habit
  userId: string
  onLog: (habitId: string, value: number) => Promise<void>
  onUpdate: (logId: string, value: number) => Promise<void>
  onDelete: (habitId: string) => Promise<void>
  onEdit?: (habit: Habit) => void
}

export function HabitCard({ habit, userId, onLog, onUpdate, onDelete, onEdit }: HabitCardProps) {
  const { todayLog, loading: todayLogLoading } = useTodayLog(userId, habit.id)
  const { totalValue, loading: periodLogLoading } = useCurrentPeriodLog(userId, habit.id, habit.frequency)
  const [deleting, setDeleting] = useState(false)

  // For daily/workday habits, use today's log. For weekly/monthly, use the period total
  const usesPeriodTracking = habit.frequency === 'weekly' || habit.frequency === 'monthly'
  const currentValue = usesPeriodTracking ? totalValue : (todayLog?.value || 0)
  const logLoading = usesPeriodTracking ? periodLogLoading : todayLogLoading

  const { goalMin, goalMax, unit } = habit

  const handleIncrement = async () => {
    // For period tracking, we always update/create today's log
    // The period total is calculated automatically by summing all logs
    if (todayLog) {
      await onUpdate(todayLog.id, todayLog.value + 1)
    } else {
      await onLog(habit.id, 1)
    }
  }

  const handleDecrement = async () => {
    // For period tracking, we only decrement today's log (not the total)
    if (!todayLog || todayLog.value <= 0) return
    await onUpdate(todayLog.id, todayLog.value - 1)
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${habit.name}"? This cannot be undone.`)) {
      setDeleting(true)
      try {
        await onDelete(habit.id)
      } catch (err) {
        console.error('Error deleting habit:', err)
        setDeleting(false)
      }
    }
  }

  const getProgressStatus = () => {
    if (currentValue === 0) return 'none'
    if (goalMax) {
      if (currentValue >= goalMin && currentValue <= goalMax) return 'complete'
      if (currentValue > goalMax) return 'exceeded'
      return 'partial'
    } else {
      if (currentValue >= goalMin) return 'complete'
      return 'partial'
    }
  }

  const getGoalText = () => {
    if (goalMax) {
      return `${goalMin}-${goalMax} ${unit}`
    }
    return `${goalMin} ${unit}`
  }

  const status = getProgressStatus()
  const progressPercentage = goalMax
    ? Math.min((currentValue / goalMax) * 100, 100)
    : Math.min((currentValue / goalMin) * 100, 100)

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{habit.emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{habit.name}</h3>
            <p className="text-sm text-gray-500">
              {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)} • {getGoalText()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(habit)}
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title="Edit habit"
            >
              <Pencil className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            title="Delete habit"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              status === 'complete' ? 'bg-green-500' :
              status === 'exceeded' ? 'bg-blue-500' :
              status === 'partial' ? 'bg-yellow-500' :
              'bg-gray-300'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={currentValue === 0 || logLoading}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
            {currentValue}
          </span>
          <button
            onClick={handleIncrement}
            disabled={logLoading}
            className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm">
          {status === 'complete' && (
            <span className="text-green-600 font-medium">✓ Goal reached!</span>
          )}
          {status === 'exceeded' && (
            <span className="text-blue-600 font-medium">🎉 Exceeded goal!</span>
          )}
          {status === 'partial' && (
            <span className="text-gray-500">
              {goalMax ? `${goalMin}-${goalMax}` : goalMin} to go
            </span>
          )}
          {status === 'none' && (
            <span className="text-gray-400">Not started</span>
          )}
        </div>
      </div>
    </div>
  )
}
