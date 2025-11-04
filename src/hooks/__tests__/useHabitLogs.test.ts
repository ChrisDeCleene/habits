import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCurrentPeriodLog } from '../useHabitLogs'
import type { Frequency } from '../../types/habit'

// Mock Firestore
vi.mock('../../lib/firebase', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn((_query, successCallback) => {
    // Call the success callback immediately with mock data
    successCallback({
      docs: []
    })
    return vi.fn() // Return unsubscribe function
  }),
  Timestamp: {
    fromDate: vi.fn((date) => date)
  }
}))

describe('useCurrentPeriodLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns zero values when userId is undefined', () => {
    const { result } = renderHook(() =>
      useCurrentPeriodLog(undefined, 'habit-1', 'daily')
    )

    expect(result.current.totalValue).toBe(0)
    expect(result.current.logs).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('returns zero values when habitId is undefined', () => {
    const { result } = renderHook(() =>
      useCurrentPeriodLog('user-1', undefined, 'daily')
    )

    expect(result.current.totalValue).toBe(0)
    expect(result.current.logs).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  // Note: We can't reliably test the initial loading state since onSnapshot
  // calls the callback synchronously in our mocked implementation

  it('handles daily frequency', async () => {
    const { result } = renderHook(() =>
      useCurrentPeriodLog('user-1', 'habit-1', 'daily')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.totalValue).toBe(0)
    expect(result.current.logs).toEqual([])
  })

  it('handles weekly frequency', async () => {
    const { result } = renderHook(() =>
      useCurrentPeriodLog('user-1', 'habit-1', 'weekly')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.totalValue).toBe(0)
    expect(result.current.logs).toEqual([])
  })

  it('handles monthly frequency', async () => {
    const { result } = renderHook(() =>
      useCurrentPeriodLog('user-1', 'habit-1', 'monthly')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.totalValue).toBe(0)
    expect(result.current.logs).toEqual([])
  })

  it('handles workday frequency', async () => {
    const { result } = renderHook(() =>
      useCurrentPeriodLog('user-1', 'habit-1', 'workday')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.totalValue).toBe(0)
    expect(result.current.logs).toEqual([])
  })

  it('sums up values from multiple logs', async () => {
    const now = new Date()
    const mockLogs = [
      { id: 'log-1', userId: 'user-1', habitId: 'habit-1', value: 3, date: { toDate: () => now }, timezone: 'UTC' },
      { id: 'log-2', userId: 'user-1', habitId: 'habit-1', value: 2, date: { toDate: () => now }, timezone: 'UTC' },
      { id: 'log-3', userId: 'user-1', habitId: 'habit-1', value: 4, date: { toDate: () => now }, timezone: 'UTC' }
    ]

    const { onSnapshot } = await import('firebase/firestore')
    vi.mocked(onSnapshot).mockImplementation((_query, successCallback) => {
      const snapshot = {
        docs: mockLogs.map(log => ({
          id: log.id,
          data: () => log
        }))
      }
      // Type assertion for the mock snapshot
      ;(successCallback as (snapshot: unknown) => void)(snapshot)
      return vi.fn()
    })

    const { result } = renderHook(() =>
      useCurrentPeriodLog('user-1', 'habit-1', 'weekly')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.totalValue).toBe(9) // 3 + 2 + 4
    expect(result.current.logs).toHaveLength(3)
  })

  it('updates when frequency changes', async () => {
    const { result, rerender } = renderHook(
      ({ frequency }: { frequency: Frequency }) =>
        useCurrentPeriodLog('user-1', 'habit-1', frequency),
      { initialProps: { frequency: 'daily' as Frequency } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Change frequency
    rerender({ frequency: 'weekly' as Frequency })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
})
