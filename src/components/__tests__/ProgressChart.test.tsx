import { describe, it, expect, vi, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import { render, screen } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import { ProgressChart } from '../ProgressChart'
import type { Habit, HabitLog } from '../../types/habit'
import { subDays } from 'date-fns'

// Mock Recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: ({ name, dataKey }: { name: string; dataKey: string }) => <div data-testid="line" data-name={name} data-key={dataKey}></div>,
  XAxis: () => <div data-testid="x-axis"></div>,
  YAxis: () => <div data-testid="y-axis"></div>,
  CartesianGrid: () => <div data-testid="cartesian-grid"></div>,
  Tooltip: () => <div data-testid="tooltip"></div>,
  Legend: () => <div data-testid="legend"></div>,
  ReferenceLine: ({ y, label }: { y: number; label: { value: string } }) => (
    <div data-testid="reference-line" data-y={y} data-label={label.value}></div>
  ),
}))

describe('ProgressChart', () => {
  const mockHabit: Habit = {
    id: 'habit-1',
    userId: 'user-1',
    name: 'Morning Exercise',
    emoji: '💪',
    goalMin: 5,
    goalMax: 10,
    unit: 'times',
    frequency: 'daily',
    order: 0,
    createdAt: new Date()
  }

  const habitWithoutMaxGoal: Habit = {
    ...mockHabit,
    goalMax: null
  }

  // Helper to create logs for a date range
  const createLogs = (days: number): HabitLog[] => {
    const logs: HabitLog[] = []
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i)
      logs.push({
        id: `log-${i}`,
        userId: 'user-1',
        habitId: 'habit-1',
        date: date,
        value: Math.floor(Math.random() * 15) + 1, // Random value 1-15
        timezone: 'America/New_York'
      })
    }
    return logs
  }

  // Don't set up fake timers globally - only use them in specific tests that need deterministic dates
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders the chart container', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const logs = createLogs(30)
      render(<ProgressChart habit={mockHabit} logs={logs} />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('renders chart components', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const logs = createLogs(30)
      render(<ProgressChart habit={mockHabit} logs={logs} />)

      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })

    it('renders data line with habit name', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const logs = createLogs(30)
      render(<ProgressChart habit={mockHabit} logs={logs} />)

      const line = screen.getByTestId('line')
      expect(line).toHaveAttribute('data-name', 'Morning Exercise')
      expect(line).toHaveAttribute('data-key', 'value')
    })

    it('renders goal min reference line', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const logs = createLogs(30)
      render(<ProgressChart habit={mockHabit} logs={logs} />)

      const referenceLines = screen.getAllByTestId('reference-line')
      const goalMinLine = referenceLines.find(line =>
        line.getAttribute('data-label') === 'Goal Min: 5'
      )
      expect(goalMinLine).toBeInTheDocument()
      expect(goalMinLine).toHaveAttribute('data-y', '5')
    })

    it('renders goal max reference line when goalMax exists', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const logs = createLogs(30)
      render(<ProgressChart habit={mockHabit} logs={logs} />)

      const referenceLines = screen.getAllByTestId('reference-line')
      const goalMaxLine = referenceLines.find(line =>
        line.getAttribute('data-label') === 'Goal Max: 10'
      )
      expect(goalMaxLine).toBeInTheDocument()
      expect(goalMaxLine).toHaveAttribute('data-y', '10')
    })

    it('does not render goal max reference line when goalMax is null', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const logs = createLogs(30)
      render(<ProgressChart habit={habitWithoutMaxGoal} logs={logs} />)

      const referenceLines = screen.getAllByTestId('reference-line')
      // Should only have one reference line (goalMin)
      expect(referenceLines).toHaveLength(1)
      expect(referenceLines[0]).toHaveAttribute('data-label', 'Goal Min: 5')
    })

    it('shows no data message when logs array is empty', () => {
      render(<ProgressChart habit={mockHabit} logs={[]} />)

      expect(screen.getByText('No data available for the selected period')).toBeInTheDocument()
      expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument()
    })
  })

  describe('Time Period Selector', () => {
    it('renders all time period buttons', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const logs = createLogs(90)
      render(<ProgressChart habit={mockHabit} logs={logs} />)

      expect(screen.getByRole('button', { name: '7 days' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '30 days' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '60 days' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '90 days' })).toBeInTheDocument()
    })

    it('has 30 days selected by default', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const logs = createLogs(90)
      render(<ProgressChart habit={mockHabit} logs={logs} />)

      const button30Days = screen.getByRole('button', { name: '30 days' })
      expect(button30Days).toHaveClass('bg-purple-500')
    })

    it('changes selected period when button is clicked', async () => {
      const user = userEvent.setup()
      const logs = createLogs(90)
      render(<ProgressChart habit={mockHabit} logs={logs} />)

      const button7Days = screen.getByRole('button', { name: '7 days' })
      const button30Days = screen.getByRole('button', { name: '30 days' })

      // Initially 30 days is selected
      expect(button30Days).toHaveClass('bg-purple-500')
      expect(button7Days).not.toHaveClass('bg-purple-500')

      // Click 7 days button
      await user.click(button7Days)

      // Now 7 days should be selected
      expect(button7Days).toHaveClass('bg-purple-500')
      expect(button30Days).not.toHaveClass('bg-purple-500')
    })

    it('applies correct styling to selected button', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const logs = createLogs(90)
      render(<ProgressChart habit={mockHabit} logs={logs} />)

      const selectedButton = screen.getByRole('button', { name: '30 days' })
      const unselectedButton = screen.getByRole('button', { name: '7 days' })

      expect(selectedButton).toHaveClass('bg-purple-500', 'text-white')
      expect(unselectedButton).toHaveClass('bg-gray-100', 'text-gray-700')
    })

    it('allows switching between all time periods', async () => {
      const user = userEvent.setup()
      const logs = createLogs(90)
      render(<ProgressChart habit={mockHabit} logs={logs} />)

      const periods = ['7 days', '30 days', '60 days', '90 days']

      for (const period of periods) {
        const button = screen.getByRole('button', { name: period })
        await user.click(button)
        expect(button).toHaveClass('bg-purple-500')
      }
    })
  })

  describe('Data Filtering', () => {
    it('shows no data message when no logs exist in the selected period', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      // Create logs from 100 days ago
      const oldLogs: HabitLog[] = [{
        id: 'log-1',
        userId: 'user-1',
        habitId: 'habit-1',
        date: subDays(new Date(), 100),
        value: 5,
        timezone: 'America/New_York'
      }]

      render(<ProgressChart habit={mockHabit} logs={oldLogs} />)

      // With 30 days selected (default), old logs shouldn't appear
      expect(screen.getByText('No data available for the selected period')).toBeInTheDocument()
    })

    it('filters logs correctly for 7 day period', async () => {
      const user = userEvent.setup()

      // Create logs: 5 recent + 1 old
      const recentLogs = createLogs(5)
      const oldLog: HabitLog = {
        id: 'old-log',
        userId: 'user-1',
        habitId: 'habit-1',
        date: subDays(new Date(), 10),
        value: 100,
        timezone: 'America/New_York'
      }
      const allLogs = [...recentLogs, oldLog]

      render(<ProgressChart habit={mockHabit} logs={allLogs} />)

      // Switch to 7 days
      await user.click(screen.getByRole('button', { name: '7 days' }))

      // Chart should render (has recent data within 7 days)
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles logs with zero values', () => {
      const logsWithZeros: HabitLog[] = [
        {
          id: 'log-1',
          userId: 'user-1',
          habitId: 'habit-1',
          date: new Date(),
          value: 0,
          timezone: 'America/New_York'
        }
      ]

      render(<ProgressChart habit={mockHabit} logs={logsWithZeros} />)

      // Should show no data message for all zero values
      expect(screen.getByText('No data available for the selected period')).toBeInTheDocument()
    })

    it('handles habit with very large goal values', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const habitWithLargeGoal: Habit = {
        ...mockHabit,
        goalMin: 1000,
        goalMax: 2000
      }

      const logs = createLogs(30)
      render(<ProgressChart habit={habitWithLargeGoal} logs={logs} />)

      const referenceLines = screen.getAllByTestId('reference-line')
      expect(referenceLines).toHaveLength(2)
    })

    it('handles single log entry', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const singleLog: HabitLog[] = [{
        id: 'log-1',
        userId: 'user-1',
        habitId: 'habit-1',
        date: new Date(),
        value: 7,
        timezone: 'America/New_York'
      }]

      render(<ProgressChart habit={mockHabit} logs={singleLog} />)

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('handles logs spanning exactly the selected period', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const logs = createLogs(30) // Exactly 30 days
      render(<ProgressChart habit={mockHabit} logs={logs} />)

      // With 30 days selected (default), should show all logs
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  describe('Different Habit Types', () => {
    it('renders chart for weekly habit', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const weeklyHabit: Habit = {
        ...mockHabit,
        frequency: 'weekly'
      }

      const logs = createLogs(30)
      render(<ProgressChart habit={weeklyHabit} logs={logs} />)

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('renders chart for monthly habit', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const monthlyHabit: Habit = {
        ...mockHabit,
        frequency: 'monthly'
      }

      const logs = createLogs(30)
      render(<ProgressChart habit={monthlyHabit} logs={logs} />)

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('renders chart for workday habit', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const workdayHabit: Habit = {
        ...mockHabit,
        frequency: 'workday'
      }

      const logs = createLogs(30)
      render(<ProgressChart habit={workdayHabit} logs={logs} />)

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })
})
