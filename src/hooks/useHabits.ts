import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Habit, Frequency, Unit } from '../types/habit'

export function useHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setHabits([])
      setLoading(false)
      return
    }

    setLoading(true)
    const habitsRef = collection(db, 'habits')
    const q = query(
      habitsRef,
      where('userId', '==', userId),
      orderBy('order', 'asc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const habitsData: Habit[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Habit[]
        setHabits(habitsData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Error fetching habits:', err)
        setError(err as Error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  const addHabit = async (habitData: {
    name: string
    emoji: string
    goalMin: number
    goalMax: number | null
    unit: Unit
    frequency: Frequency
  }) => {
    if (!userId) throw new Error('User must be logged in to add habits')

    const habitsRef = collection(db, 'habits')
    // Assign order as the next highest number
    const maxOrder = habits.length > 0 ? Math.max(...habits.map(h => h.order)) : -1
    await addDoc(habitsRef, {
      ...habitData,
      userId,
      order: maxOrder + 1,
      createdAt: Timestamp.now()
    })
  }

  const updateHabit = async (habitId: string, updates: Partial<Omit<Habit, 'id' | 'userId' | 'createdAt'>>) => {
    const habitRef = doc(db, 'habits', habitId)
    await updateDoc(habitRef, updates)
  }

  const deleteHabit = async (habitId: string) => {
    const habitRef = doc(db, 'habits', habitId)
    await deleteDoc(habitRef)
  }

  const reorderHabits = async (habitIds: string[]) => {
    // Update order for all habits based on their new position
    const updates = habitIds.map((habitId, index) => {
      const habitRef = doc(db, 'habits', habitId)
      return updateDoc(habitRef, { order: index })
    })
    await Promise.all(updates)
  }

  return {
    habits,
    loading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    reorderHabits
  }
}
