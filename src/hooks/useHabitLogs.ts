import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  orderBy
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { HabitLog } from '../types/habit'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { Frequency } from '../types/habit'

export function useHabitLogs(userId: string | undefined, habitId: string | undefined) {
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId || !habitId) {
      setLogs([])
      setLoading(false)
      return
    }

    setLoading(true)
    const logsRef = collection(db, 'habitLogs')
    const q = query(
      logsRef,
      where('userId', '==', userId),
      where('habitId', '==', habitId),
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
        setLogs(logsData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Error fetching habit logs:', err)
        setError(err as Error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId, habitId])

  const logHabit = async (habitId: string, value: number, date: Date = new Date()) => {
    if (!userId) throw new Error('User must be logged in to log habits')

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const zonedDate = toZonedTime(date, timezone)
    const dayStart = startOfDay(zonedDate)

    const logsRef = collection(db, 'habitLogs')
    await addDoc(logsRef, {
      userId,
      habitId,
      value,
      date: Timestamp.fromDate(dayStart),
      timezone
    })
  }

  const updateLog = async (logId: string, value: number) => {
    const logRef = doc(db, 'habitLogs', logId)
    await updateDoc(logRef, { value })
  }

  return {
    logs,
    loading,
    error,
    logHabit,
    updateLog
  }
}

// Hook to get today's log for a specific habit
export function useTodayLog(userId: string | undefined, habitId: string | undefined) {
  const [todayLog, setTodayLog] = useState<HabitLog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !habitId) {
      setTodayLog(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const now = new Date()
    const zonedDate = toZonedTime(now, timezone)
    const dayStart = startOfDay(zonedDate)
    const dayEnd = endOfDay(zonedDate)

    const logsRef = collection(db, 'habitLogs')
    const q = query(
      logsRef,
      where('userId', '==', userId),
      where('habitId', '==', habitId),
      where('date', '>=', Timestamp.fromDate(dayStart)),
      where('date', '<=', Timestamp.fromDate(dayEnd))
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const logData = snapshot.docs[0]
          setTodayLog({
            id: logData.id,
            ...logData.data(),
            date: logData.data().date?.toDate() || new Date()
          } as HabitLog)
        } else {
          setTodayLog(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching today log:', err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId, habitId])

  return { todayLog, loading }
}

// Helper function to get period start and end based on frequency
function getPeriodBounds(frequency: Frequency, timezone: string) {
  const now = new Date()
  const zonedDate = toZonedTime(now, timezone)

  switch (frequency) {
    case 'daily':
    case 'workday':
      return {
        start: startOfDay(zonedDate),
        end: endOfDay(zonedDate)
      }
    case 'weekly':
      return {
        start: startOfWeek(zonedDate, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(zonedDate, { weekStartsOn: 1 })
      }
    case 'monthly':
      return {
        start: startOfMonth(zonedDate),
        end: endOfMonth(zonedDate)
      }
    default:
      return {
        start: startOfDay(zonedDate),
        end: endOfDay(zonedDate)
      }
  }
}

// Hook to get current period's total progress for a habit
export function useCurrentPeriodLog(
  userId: string | undefined,
  habitId: string | undefined,
  frequency: Frequency
) {
  const [totalValue, setTotalValue] = useState(0)
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !habitId) {
      setTotalValue(0)
      setLogs([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const { start, end } = getPeriodBounds(frequency, timezone)

    const logsRef = collection(db, 'habitLogs')
    const q = query(
      logsRef,
      where('userId', '==', userId),
      where('habitId', '==', habitId),
      where('date', '>=', Timestamp.fromDate(start)),
      where('date', '<=', Timestamp.fromDate(end)),
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

        // Sum up all values in the period
        const total = logsData.reduce((sum, log) => sum + log.value, 0)

        setLogs(logsData)
        setTotalValue(total)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching period logs:', err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId, habitId, frequency])

  return { totalValue, logs, loading }
}
