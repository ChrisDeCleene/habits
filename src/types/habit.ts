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
  order: number
  createdAt: Date
}

export interface HabitLog {
  id: string
  userId: string
  habitId: string
  date: Date
  value: number
  timezone: string
}

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}
