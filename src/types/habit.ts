export type Frequency = 'daily' | 'workday' | 'weekly' | 'monthly'
export type Unit = 'times' | 'minutes' | 'hours' | 'blocks'

export interface Habit {
  id: string
  userId: string
  name: string
  emoji: string
  goalMin: number
  goalMax: number | null
  unit: Unit
  frequency: Frequency
  createdAt: Date
}

export interface HabitLog {
  habitId: string
  date: string // Format: YYYY-MM-DD
  value: number
  timestamp: Date
}

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}
