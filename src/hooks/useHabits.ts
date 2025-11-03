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
      orderBy('createdAt', 'desc')
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
    await addDoc(habitsRef, {
      ...habitData,
      userId,
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

  return {
    habits,
    loading,
    error,
    addHabit,
    updateHabit,
    deleteHabit
  }
}
