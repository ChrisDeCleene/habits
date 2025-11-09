import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import { render, screen } from '../../test/test-utils'
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
  const mockOnCreateLog = vi.fn()

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

  const workdayHabit: Habit = {
    id: 'habit-4',
    userId: 'user-1',
    name: 'Workday Standup',
    emoji: '💼',
    goalMin: 1,
    goalMax: 1,
    unit: 'times',
    frequency: 'workday',
    order: 3,
    createdAt: new Date()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
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
          onCreateLog={mockOnCreateLog}
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
          onCreateLog={mockOnCreateLog}
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
          onCreateLog={mockOnCreateLog}
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
          onCreateLog={mockOnCreateLog}
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
          onCreateLog={mockOnCreateLog}
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
          onCreateLog={mockOnCreateLog}
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
          onCreateLog={mockOnCreateLog}
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
          onCreateLog={mockOnCreateLog}
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
          onCreateLog={mockOnCreateLog}
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
          onCreateLog={mockOnCreateLog}
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
          onCreateLog={mockOnCreateLog}
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
          onCreateLog={mockOnCreateLog}
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
          onCreateLog={mockOnCreateLog}
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
          onCreateLog={mockOnCreateLog}
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

  describe('Workday Habits - Weekend Indicator', () => {
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

    it('shows rest day message on Saturday', () => {
      // Mock Date to return a Saturday (day 6)
      const saturday = new Date('2025-01-04T12:00:00') // January 4, 2025 is a Saturday
      vi.useFakeTimers()
      vi.setSystemTime(saturday)

      render(
        <HabitCard
          habit={workdayHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onCreateLog={mockOnCreateLog}
        />
      )

      expect(screen.getByText(/Rest Day - Enjoy your weekend!/i)).toBeInTheDocument()
      expect(screen.getByText('☕')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /increment/i })).not.toBeInTheDocument()
    })

    it('shows rest day message on Sunday', () => {
      // Mock Date to return a Sunday (day 0)
      const sunday = new Date('2025-01-05T12:00:00') // January 5, 2025 is a Sunday
      vi.useFakeTimers()
      vi.setSystemTime(sunday)

      render(
        <HabitCard
          habit={workdayHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onCreateLog={mockOnCreateLog}
        />
      )

      expect(screen.getByText(/Rest Day - Enjoy your weekend!/i)).toBeInTheDocument()
      expect(screen.getByText('☕')).toBeInTheDocument()
    })

    it('shows normal interface on Monday (weekday)', () => {
      // Mock Date to return a Monday (day 1)
      const monday = new Date('2025-01-06T12:00:00') // January 6, 2025 is a Monday
      vi.useFakeTimers()
      vi.setSystemTime(monday)

      render(
        <HabitCard
          habit={workdayHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onCreateLog={mockOnCreateLog}
        />
      )

      expect(screen.queryByText(/Rest Day/i)).not.toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
      const buttons = screen.getAllByRole('button')
      const incrementButton = buttons.find(btn => btn.querySelector('.lucide-plus'))
      expect(incrementButton).toBeInTheDocument()
    })

    it('shows (Weekend) label on workday habit during weekend', () => {
      const saturday = new Date('2025-01-04T12:00:00') // January 4, 2025 is a Saturday
      vi.useFakeTimers()
      vi.setSystemTime(saturday)

      render(
        <HabitCard
          habit={workdayHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onCreateLog={mockOnCreateLog}
        />
      )

      expect(screen.getByText('(Weekend)')).toBeInTheDocument()
    })
  })

  describe('Period Display', () => {
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

    it('shows week period range for weekly habits', () => {
      // Set a specific date to make test deterministic
      const wednesday = new Date('2025-11-12') // A Wednesday
      vi.useFakeTimers()
      vi.setSystemTime(wednesday)

      render(
        <HabitCard
          habit={weeklyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onCreateLog={mockOnCreateLog}
        />
      )

      // Week should be Nov 10 (Mon) - Nov 16 (Sun)
      expect(screen.getByText(/Week: Nov 10 - Nov 16/i)).toBeInTheDocument()
    })

    it('shows month period range for monthly habits', () => {
      const midNovember = new Date('2025-11-15')
      vi.useFakeTimers()
      vi.setSystemTime(midNovember)

      render(
        <HabitCard
          habit={monthlyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onCreateLog={mockOnCreateLog}
        />
      )

      // Month should be Nov 1 - Nov 30
      expect(screen.getByText(/Month: Nov 1 - Nov 30/i)).toBeInTheDocument()
    })

    it('does not show period range for daily habits', () => {
      render(
        <HabitCard
          habit={dailyHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onCreateLog={mockOnCreateLog}
        />
      )

      expect(screen.queryByText(/Week:/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Month:/i)).not.toBeInTheDocument()
    })

    it('does not show period range for workday habits', () => {
      render(
        <HabitCard
          habit={workdayHabit}
          userId="user-1"
          onLog={mockOnLog}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onCreateLog={mockOnCreateLog}
        />
      )

      expect(screen.queryByText(/Week:/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Month:/i)).not.toBeInTheDocument()
    })
  })
})
