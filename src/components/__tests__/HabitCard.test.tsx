import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import { HabitCard } from '../HabitCard'
import type { Habit } from '../../types/habit'
import * as useHabitLogsModule from '../../hooks/useHabitLogs'

// Mock the hooks
vi.mock('../../hooks/useHabitLogs', () => ({
  useTodayLog: vi.fn(),
  useCurrentPeriodLog: vi.fn()
}))

describe('HabitCard', () => {
  const mockOnLog = vi.fn()
  const mockOnUpdate = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnEdit = vi.fn()

  const dailyHabit: Habit = {
    id: 'habit-1',
    userId: 'user-1',
    name: 'Daily Exercise',
    emoji: '💪',
    goalMin: 5,
    goalMax: 10,
    unit: 'times',
    frequency: 'daily',
    order: 0,
    createdAt: new Date()
  }

  const weeklyHabit: Habit = {
    id: 'habit-2',
    userId: 'user-1',
    name: 'Weekly Reading',
    emoji: '📚',
    goalMin: 10,
    goalMax: 15,
    unit: 'hours',
    frequency: 'weekly',
    order: 1,
    createdAt: new Date()
  }

  const monthlyHabit: Habit = {
    id: 'habit-3',
    userId: 'user-1',
    name: 'Monthly Meditation',
    emoji: '🧘',
    goalMin: 20,
    goalMax: null,
    unit: 'minutes',
    frequency: 'monthly',
    order: 2,
    createdAt: new Date()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Daily Habit Tracking', () => {
    beforeEach(() => {
      vi.mocked(useHabitLogsModule.useTodayLog).mockReturnValue({
        todayLog: null,
        loading: false
      })

      vi.mocked(useHabitLogsModule.useCurrentPeriodLog).mockReturnValue({
        totalValue: 0,
        logs: [],
        loading: false
      })
    })

    it('displays zero for daily habit with no logs', () => {
      render(
        <HabitCard
          habit={dailyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('displays today\'s value for daily habit', () => {
      vi.mocked(useHabitLogsModule.useTodayLog).mockReturnValue({
        todayLog: { id: 'log-1', value: 3, date: new Date(), userId: 'user-1', habitId: 'habit-1', timezone: 'UTC' },
        loading: false
      })

      render(
        <HabitCard
          habit={dailyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('Weekly Habit Tracking', () => {
    beforeEach(() => {
      vi.mocked(useHabitLogsModule.useTodayLog).mockReturnValue({
        todayLog: null,
        loading: false
      })

      vi.mocked(useHabitLogsModule.useCurrentPeriodLog).mockReturnValue({
        totalValue: 0,
        logs: [],
        loading: false
      })
    })

    it('displays zero for weekly habit with no logs', () => {
      render(
        <HabitCard
          habit={weeklyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('displays total value for weekly habit across the week', () => {
      vi.mocked(useHabitLogsModule.useCurrentPeriodLog).mockReturnValue({
        totalValue: 7, // Sum of logs across the week
        logs: [
          { id: 'log-1', value: 2, date: new Date(), userId: 'user-1', habitId: 'habit-2', timezone: 'UTC' },
          { id: 'log-2', value: 3, date: new Date(), userId: 'user-1', habitId: 'habit-2', timezone: 'UTC' },
          { id: 'log-3', value: 2, date: new Date(), userId: 'user-1', habitId: 'habit-2', timezone: 'UTC' }
        ],
        loading: false
      })

      render(
        <HabitCard
          habit={weeklyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.getByText('7')).toBeInTheDocument()
    })

    it('increments today\'s log for weekly habit', async () => {
      const user = userEvent.setup()
      vi.mocked(useHabitLogsModule.useTodayLog).mockReturnValue({
        todayLog: { id: 'log-1', value: 2, date: new Date(), userId: 'user-1', habitId: 'habit-2', timezone: 'UTC' },
        loading: false
      })

      render(
        <HabitCard
          habit={weeklyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      // Find the increment button (the one with the plus icon)
      const buttons = screen.getAllByRole('button')
      const incrementButton = buttons.find(btn => btn.querySelector('.lucide-plus'))

      if (incrementButton) {
        await user.click(incrementButton)
      }

      expect(mockOnUpdate).toHaveBeenCalledWith('log-1', 3)
    })

    it('creates new log when incrementing weekly habit with no today log', async () => {
      const user = userEvent.setup()

      render(
        <HabitCard
          habit={weeklyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      // Find the increment button (the one with the plus icon)
      const buttons = screen.getAllByRole('button')
      const incrementButton = buttons.find(btn => btn.querySelector('.lucide-plus'))

      if (incrementButton) {
        await user.click(incrementButton)
      }

      expect(mockOnLog).toHaveBeenCalledWith('habit-2', 1)
    })
  })

  describe('Monthly Habit Tracking', () => {
    beforeEach(() => {
      vi.mocked(useHabitLogsModule.useTodayLog).mockReturnValue({
        todayLog: null,
        loading: false
      })

      vi.mocked(useHabitLogsModule.useCurrentPeriodLog).mockReturnValue({
        totalValue: 0,
        logs: [],
        loading: false
      })
    })

    it('displays zero for monthly habit with no logs', () => {
      render(
        <HabitCard
          habit={monthlyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('displays total value for monthly habit across the month', () => {
      vi.mocked(useHabitLogsModule.useCurrentPeriodLog).mockReturnValue({
        totalValue: 45, // Sum of logs across the month
        logs: [
          { id: 'log-1', value: 15, date: new Date(), userId: 'user-1', habitId: 'habit-3', timezone: 'UTC' },
          { id: 'log-2', value: 20, date: new Date(), userId: 'user-1', habitId: 'habit-3', timezone: 'UTC' },
          { id: 'log-3', value: 10, date: new Date(), userId: 'user-1', habitId: 'habit-3', timezone: 'UTC' }
        ],
        loading: false
      })

      render(
        <HabitCard
          habit={monthlyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.getByText('45')).toBeInTheDocument()
    })
  })

  describe('Progress Status', () => {
    beforeEach(() => {
      vi.mocked(useHabitLogsModule.useTodayLog).mockReturnValue({
        todayLog: null,
        loading: false
      })

      vi.mocked(useHabitLogsModule.useCurrentPeriodLog).mockReturnValue({
        totalValue: 0,
        logs: [],
        loading: false
      })
    })

    it('shows "Not started" for weekly habit with zero progress', () => {
      render(
        <HabitCard
          habit={weeklyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.getByText('Not started')).toBeInTheDocument()
    })

    it('shows "Goal reached!" for weekly habit within range', () => {
      vi.mocked(useHabitLogsModule.useCurrentPeriodLog).mockReturnValue({
        totalValue: 12, // Within 10-15 range
        logs: [],
        loading: false
      })

      render(
        <HabitCard
          habit={weeklyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.getByText('✓ Goal reached!')).toBeInTheDocument()
    })

    it('shows "Exceeded goal!" for weekly habit above range', () => {
      vi.mocked(useHabitLogsModule.useCurrentPeriodLog).mockReturnValue({
        totalValue: 20, // Above 15 max
        logs: [],
        loading: false
      })

      render(
        <HabitCard
          habit={weeklyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.getByText('🎉 Exceeded goal!')).toBeInTheDocument()
    })

    it('shows partial progress for weekly habit below goal', () => {
      vi.mocked(useHabitLogsModule.useCurrentPeriodLog).mockReturnValue({
        totalValue: 5, // Below 10 min
        logs: [],
        loading: false
      })

      render(
        <HabitCard
          habit={weeklyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.getByText('10-15 to go')).toBeInTheDocument()
    })
  })

  describe('Decrement Behavior', () => {
    it('does not decrement when today log value is 0', async () => {
      const user = userEvent.setup()
      vi.mocked(useHabitLogsModule.useTodayLog).mockReturnValue({
        todayLog: { id: 'log-1', value: 0, date: new Date(), userId: 'user-1', habitId: 'habit-2', timezone: 'UTC' },
        loading: false
      })

      render(
        <HabitCard
          habit={weeklyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      // Find the decrement button (first button, before the value)
      const buttons = screen.getAllByRole('button')
      const decrementButton = buttons.find(btn => btn.querySelector('.lucide-minus'))

      if (decrementButton) {
        await user.click(decrementButton)
      }

      expect(mockOnUpdate).not.toHaveBeenCalled()
    })

    it('decrements today\'s log for weekly habit', async () => {
      const user = userEvent.setup()
      vi.mocked(useHabitLogsModule.useTodayLog).mockReturnValue({
        todayLog: { id: 'log-1', value: 5, date: new Date(), userId: 'user-1', habitId: 'habit-2', timezone: 'UTC' },
        loading: false
      })

      render(
        <HabitCard
          habit={weeklyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      )

      const buttons = screen.getAllByRole('button')
      const decrementButton = buttons.find(btn => btn.querySelector('.lucide-minus'))

      if (decrementButton) {
        await user.click(decrementButton)
      }

      expect(mockOnUpdate).toHaveBeenCalledWith('log-1', 4)
    })
  })
})
