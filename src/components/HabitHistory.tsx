import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import type { Habit, HabitLog } from '../types/habit'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { ProgressChart } from './ProgressChart'

interface HabitHistoryProps {
  habit: Habit
  userId: string
  onClose: () => void
  onUpdateLog: (logId: string, newValue: number) => Promise<void>
  onCreateLog: (habitId: string, value: number, date: Date) => Promise<void>
}

export function HabitHistory({ habit, userId, onClose, onUpdateLog, onCreateLog }: HabitHistoryProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [allLogs, setAllLogs] = useState<HabitLog[]>([]) // All logs for chart
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  // Fetch all logs for the chart (last 90 days)
  useEffect(() => {
    const logsRef = collection(db, 'habitLogs')
    const q = query(
      logsRef,
      where('userId', '==', userId),
      where('habitId', '==', habit.id),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logsData: HabitLog[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date()
        })) as HabitLog[]

        setAllLogs(logsData)
      },
      (err) => {
        console.error('Error fetching all logs:', err)
      }
    )

    return () => unsubscribe()
  }, [userId, habit.id])

  // Fetch logs for the current month (for calendar)
  useEffect(() => {
    setLoading(true)

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)

    const logsRef = collection(db, 'habitLogs')
    const q = query(
      logsRef,
      where('userId', '==', userId),
      where('habitId', '==', habit.id),
      where('date', '>=', Timestamp.fromDate(monthStart)),
      where('date', '<=', Timestamp.fromDate(monthEnd)),
      orderBy('date', 'asc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logsData: HabitLog[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date()
        })) as HabitLog[]

        setLogs(logsData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching logs:', err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId, habit.id, currentMonth])

  // Get log for a specific date
  const getLogForDate = (date: Date) => {
    return logs.find(log => isSameDay(new Date(log.date), date))
  }

  // Get color class based on value and goal
  const getColorClass = (value: number) => {
    if (value <= 0) return 'bg-gray-100 text-gray-400'

    if (value < habit.goalMin) {
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    }

    if (habit.goalMax && value > habit.goalMax) {
      return 'bg-purple-100 text-purple-800 border border-purple-200'
    }

    return 'bg-green-100 text-green-800 border border-green-200'
  }

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDayClick = (date: Date) => {
    const log = getLogForDate(date)
    setSelectedDate(date)
    setEditValue(log ? log.value.toString() : '')
  }

  const handleSaveLog = async () => {
    if (!selectedDate) return

    const value = editValue.trim() === '' ? 0 : parseInt(editValue, 10)
    const log = getLogForDate(selectedDate)

    try {
      if (log) {
        await onUpdateLog(log.id, value)
      } else {
        await onCreateLog(habit.id, value, selectedDate)
      }
      setSelectedDate(null)
      setEditValue('')
    } catch (error) {
      console.error('Error saving log:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {habit.emoji} {habit.name} - History
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Goal: {habit.goalMin}{habit.goalMax ? `-${habit.goalMax}` : '+'} {habit.unit} per {habit.frequency === 'workday' ? 'workday' : habit.frequency}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close history"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Chart */}
        <div className="px-6 py-6 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Trends</h3>
          <ProgressChart habit={habit} logs={allLogs} />
        </div>

        {/* Month Navigation */}
        <div className="px-6 py-4 flex items-center justify-between border-b">
          <button
            onClick={handlePreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day) => {
                const log = getLogForDate(day)
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isToday = isSameDay(day, new Date())

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    disabled={!isCurrentMonth}
                    className={`
                      aspect-square p-2 rounded-lg text-sm
                      ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'hover:ring-2 hover:ring-blue-500 cursor-pointer'}
                      ${isToday ? 'ring-2 ring-blue-500' : ''}
                      ${log ? getColorClass(log.value) : 'bg-gray-50 text-gray-700'}
                    `}
                  >
                    <div className="font-medium">{format(day, 'd')}</div>
                    {log && (
                      <div className="text-xs font-bold mt-1">
                        {log.value}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        {selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value ({habit.unit})
                </label>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setSelectedDate(null)
                    setEditValue('')
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLog}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
