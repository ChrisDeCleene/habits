import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useHabits } from '../hooks/useHabits'
import { useHabitLogs } from '../hooks/useHabitLogs'
import { LogOut, Plus } from 'lucide-react'
import { HabitForm } from './HabitForm'
import { HabitCard } from './HabitCard'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { habits, loading, addHabit, deleteHabit } = useHabits(user?.uid)
  const { logHabit, updateLog } = useHabitLogs(user?.uid, undefined)
  const [showForm, setShowForm] = useState(false)

  const handleAddHabit = async (habitData: {
    name: string
    emoji: string
    goalMin: number
    goalMax: number | null
    unit: 'times' | 'minutes' | 'hours' | 'blocks'
    frequency: 'daily' | 'workday' | 'weekly' | 'monthly'
  }) => {
    await addHabit(habitData)
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Habit Tracker</h1>
          <div className="flex items-center gap-4">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full"
              />
            )}
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Today's Habits</h2>
            <p className="text-sm text-gray-600 mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Habit
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your habits...</p>
          </div>
        ) : habits.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No habits yet</h3>
              <p className="text-gray-600 mb-6">
                Start building better routines by creating your first habit tracker
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Your First Habit
              </button>
            </div>
          </div>
        ) : (
          /* Habit List */
          <div className="space-y-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                userId={user!.uid}
                onLog={logHabit}
                onUpdate={updateLog}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        )}
      </main>

      {/* Habit Form Modal */}
      {showForm && (
        <HabitForm
          onSubmit={handleAddHabit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
