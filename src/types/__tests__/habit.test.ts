import { describe, it, expect } from 'vitest'
import type { Habit, HabitLog, Frequency, Unit } from '../habit'

describe('Habit Types', () => {
  it('should accept valid Frequency values', () => {
    const frequencies: Frequency[] = ['daily', 'workday', 'weekly', 'monthly']
    frequencies.forEach(freq => {
      expect(['daily', 'workday', 'weekly', 'monthly']).toContain(freq)
    })
  })

  it('should accept valid Unit values', () => {
    const units: Unit[] = ['times', 'minutes', 'hours', 'blocks']
    units.forEach(unit => {
      expect(['times', 'minutes', 'hours', 'blocks']).toContain(unit)
    })
  })

  it('should create a valid Habit object', () => {
    const habit: Habit = {
      id: '123',
      userId: 'user-456',
      name: 'Morning Exercise',
      emoji: '💪',
      goalMin: 3,
      goalMax: 5,
      unit: 'times',
      frequency: 'weekly',
      createdAt: new Date()
    }

    expect(habit.id).toBe('123')
    expect(habit.name).toBe('Morning Exercise')
    expect(habit.goalMax).toBe(5)
  })

  it('should create a Habit with null goalMax', () => {
    const habit: Habit = {
      id: '123',
      userId: 'user-456',
      name: 'Daily Reading',
      emoji: '📚',
      goalMin: 30,
      goalMax: null,
      unit: 'minutes',
      frequency: 'daily',
      createdAt: new Date()
    }

    expect(habit.goalMax).toBeNull()
  })

  it('should create a valid HabitLog object', () => {
    const logDate = new Date('2025-11-03')
    const log: HabitLog = {
      id: 'log-123',
      userId: 'user-456',
      habitId: 'habit-123',
      date: logDate,
      value: 3,
      timezone: 'America/New_York'
    }

    expect(log.habitId).toBe('habit-123')
    expect(log.value).toBe(3)
    expect(log.date).toEqual(logDate)
  })
})
