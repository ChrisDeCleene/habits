import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import { HabitHistory } from '../HabitHistory'
import type { Habit } from '../../types/habit'

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {},
  auth: {},
  analytics: null
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()),
  GoogleAuthProvider: vi.fn()
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn((_query, successCallback) => {
    successCallback({ docs: [] })
    return vi.fn()
  }),
  Timestamp: {
    fromDate: vi.fn((date) => date)
  }
}))

describe('HabitHistory', () => {
  const mockOnClose = vi.fn()
  const mockOnUpdateLog = vi.fn()
  const mockOnCreateLog = vi.fn()

  const testHabit: Habit = {
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the habit history modal', () => {
    render(
      <HabitHistory
        habit={testHabit}
        userId="user-1"
        onClose={mockOnClose}
        onUpdateLog={mockOnUpdateLog}
        onCreateLog={mockOnCreateLog}
      />
    )

    expect(screen.getByText(/💪 Daily Exercise - History/i)).toBeInTheDocument()
    expect(screen.getByText(/Goal: 5-10 times per daily/i)).toBeInTheDocument()
  })

  it('displays the current month', () => {
    render(
      <HabitHistory
        habit={testHabit}
        userId="user-1"
        onClose={mockOnClose}
        onUpdateLog={mockOnUpdateLog}
        onCreateLog={mockOnCreateLog}
      />
    )

    const now = new Date()
    const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    expect(screen.getByText(monthYear)).toBeInTheDocument()
  })

  it('displays day headers', () => {
    render(
      <HabitHistory
        habit={testHabit}
        userId="user-1"
        onClose={mockOnClose}
        onUpdateLog={mockOnUpdateLog}
        onCreateLog={mockOnCreateLog}
      />
    )

    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('Wed')).toBeInTheDocument()
    expect(screen.getByText('Thu')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
  })

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <HabitHistory
        habit={testHabit}
        userId="user-1"
        onClose={mockOnClose}
        onUpdateLog={mockOnUpdateLog}
        onCreateLog={mockOnCreateLog}
      />
    )

    const closeButton = screen.getByLabelText('Close history')
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('navigates to previous month', async () => {
    const user = userEvent.setup()

    render(
      <HabitHistory
        habit={testHabit}
        userId="user-1"
        onClose={mockOnClose}
        onUpdateLog={mockOnUpdateLog}
        onCreateLog={mockOnCreateLog}
      />
    )

    const prevButton = screen.getByLabelText('Previous month')
    await user.click(prevButton)

    // Should show previous month
    const now = new Date()
    now.setMonth(now.getMonth() - 1)
    const prevMonthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    await waitFor(() => {
      expect(screen.getByText(prevMonthYear)).toBeInTheDocument()
    })
  })

  it('navigates to next month', async () => {
    const user = userEvent.setup()

    render(
      <HabitHistory
        habit={testHabit}
        userId="user-1"
        onClose={mockOnClose}
        onUpdateLog={mockOnUpdateLog}
        onCreateLog={mockOnCreateLog}
      />
    )

    const nextButton = screen.getByLabelText('Next month')
    await user.click(nextButton)

    // Should show next month
    const now = new Date()
    now.setMonth(now.getMonth() + 1)
    const nextMonthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    await waitFor(() => {
      expect(screen.getByText(nextMonthYear)).toBeInTheDocument()
    })
  })

  it('displays logs with values on calendar days', async () => {
    const now = new Date()
    const mockLogs = [
      {
        id: 'log-1',
        userId: 'user-1',
        habitId: 'habit-1',
        value: 5,
        date: { toDate: () => now },
        timezone: 'UTC'
      }
    ]

    const { onSnapshot } = await import('firebase/firestore')
    vi.mocked(onSnapshot).mockImplementation((_query, successCallback) => {
      const snapshot = {
        docs: mockLogs.map(log => ({
          id: log.id,
          data: () => log
        }))
      }
      ;(successCallback as (snapshot: unknown) => void)(snapshot)
      return vi.fn()
    })

    render(
      <HabitHistory
        habit={testHabit}
        userId="user-1"
        onClose={mockOnClose}
        onUpdateLog={mockOnUpdateLog}
        onCreateLog={mockOnCreateLog}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Should display the value on the calendar
    const dayButtons = screen.getAllByRole('button')
    const dayWithValue = dayButtons.find(btn => btn.textContent?.includes('5'))
    expect(dayWithValue).toBeInTheDocument()
  })

  it('opens edit dialog when clicking on a day', async () => {
    const user = userEvent.setup()

    render(
      <HabitHistory
        habit={testHabit}
        userId="user-1"
        onClose={mockOnClose}
        onUpdateLog={mockOnUpdateLog}
        onCreateLog={mockOnCreateLog}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Find all buttons in the calendar grid (excluding header and navigation buttons)
    const allButtons = screen.getAllByRole('button')
    const calendarDayButtons = allButtons.filter(btn => {
      const text = btn.textContent || ''
      const isNotDisabled = !btn.hasAttribute('disabled')
      const hasNumericContent = /\d+/.test(text)
      const isNotNavigation = !btn.getAttribute('aria-label')?.includes('month')
      const isNotClose = !btn.getAttribute('aria-label')?.includes('Close')

      return isNotDisabled && hasNumericContent && isNotNavigation && isNotClose
    })

    expect(calendarDayButtons.length).toBeGreaterThan(0)

    // Click on the first available day
    await user.click(calendarDayButtons[0])

    // Should show edit dialog
    await waitFor(() => {
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    }, { timeout: 2000 })

    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('creates a new log when saving with no existing log', async () => {
    const user = userEvent.setup()

    render(
      <HabitHistory
        habit={testHabit}
        userId="user-1"
        onClose={mockOnClose}
        onUpdateLog={mockOnUpdateLog}
        onCreateLog={mockOnCreateLog}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Find calendar day buttons
    const allButtons = screen.getAllByRole('button')
    const calendarDayButtons = allButtons.filter(btn => {
      const text = btn.textContent || ''
      const isNotDisabled = !btn.hasAttribute('disabled')
      const hasNumericContent = /\d+/.test(text)
      const isNotNavigation = !btn.getAttribute('aria-label')?.includes('month')
      const isNotClose = !btn.getAttribute('aria-label')?.includes('Close')
      return isNotDisabled && hasNumericContent && isNotNavigation && isNotClose
    })

    expect(calendarDayButtons.length).toBeGreaterThan(0)

    // Click on a day
    await user.click(calendarDayButtons[0])

    // Wait for dialog to appear
    const input = await screen.findByRole('spinbutton')

    // Enter a value
    await user.clear(input)
    await user.type(input, '7')

    // Click save
    const saveButton = screen.getByText('Save')
    await user.click(saveButton)

    // Should call onCreateLog
    await waitFor(() => {
      expect(mockOnCreateLog).toHaveBeenCalled()
      const callArgs = mockOnCreateLog.mock.calls[0]
      expect(callArgs[0]).toBe('habit-1')
      expect(callArgs[1]).toBe(7)
      expect(callArgs[2]).toBeInstanceOf(Date)
    })
  })

  it('updates existing log when saving', async () => {
    const now = new Date()
    const mockLogs = [
      {
        id: 'log-1',
        userId: 'user-1',
        habitId: 'habit-1',
        value: 5,
        date: { toDate: () => now },
        timezone: 'UTC'
      }
    ]

    const { onSnapshot } = await import('firebase/firestore')
    vi.mocked(onSnapshot).mockImplementation((_query, successCallback) => {
      const snapshot = {
        docs: mockLogs.map(log => ({
          id: log.id,
          data: () => log
        }))
      }
      ;(successCallback as (snapshot: unknown) => void)(snapshot)
      return vi.fn()
    })

    const user = userEvent.setup()

    render(
      <HabitHistory
        habit={testHabit}
        userId="user-1"
        onClose={mockOnClose}
        onUpdateLog={mockOnUpdateLog}
        onCreateLog={mockOnCreateLog}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Find a button that has a colored background (indicating it has a log value)
    // These buttons have classes like bg-yellow-100, bg-green-100, or bg-purple-100
    const allButtons = screen.getAllByRole('button')
    const dayWithValue = allButtons.find(btn => {
      const className = btn.className || ''
      return (
        !btn.hasAttribute('disabled') &&
        (className.includes('bg-yellow-100') ||
         className.includes('bg-green-100') ||
         className.includes('bg-purple-100'))
      )
    })

    expect(dayWithValue).toBeDefined()

    if (dayWithValue) {
      await user.click(dayWithValue)

      // Wait for dialog and get input
      const input = await screen.findByRole('spinbutton') as HTMLInputElement

      // Wait for value to populate
      await waitFor(() => {
        expect(input.value).toBe('5')
      })

      // Change the value
      await user.clear(input)
      await user.type(input, '8')

      // Click save
      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      // Should call onUpdateLog
      await waitFor(() => {
        expect(mockOnUpdateLog).toHaveBeenCalledWith('log-1', 8)
      })
    }
  })

  it('cancels edit dialog without saving', async () => {
    const user = userEvent.setup()

    render(
      <HabitHistory
        habit={testHabit}
        userId="user-1"
        onClose={mockOnClose}
        onUpdateLog={mockOnUpdateLog}
        onCreateLog={mockOnCreateLog}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Find calendar day buttons
    const allButtons = screen.getAllByRole('button')
    const calendarDayButtons = allButtons.filter(btn => {
      const text = btn.textContent || ''
      const isNotDisabled = !btn.hasAttribute('disabled')
      const hasNumericContent = /\d+/.test(text)
      const isNotNavigation = !btn.getAttribute('aria-label')?.includes('month')
      const isNotClose = !btn.getAttribute('aria-label')?.includes('Close')
      return isNotDisabled && hasNumericContent && isNotNavigation && isNotClose
    })

    expect(calendarDayButtons.length).toBeGreaterThan(0)

    // Click on a day
    await user.click(calendarDayButtons[0])

    // Wait for dialog to appear
    const input = await screen.findByRole('spinbutton')

    // Enter a value
    await user.type(input, '7')

    // Click cancel
    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    // Should not call onCreateLog or onUpdateLog
    expect(mockOnCreateLog).not.toHaveBeenCalled()
    expect(mockOnUpdateLog).not.toHaveBeenCalled()

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    })
  })

  it('displays goal information correctly for habit with max goal', () => {
    render(
      <HabitHistory
        habit={testHabit}
        userId="user-1"
        onClose={mockOnClose}
        onUpdateLog={mockOnUpdateLog}
        onCreateLog={mockOnCreateLog}
      />
    )

    expect(screen.getByText(/Goal: 5-10 times per daily/i)).toBeInTheDocument()
  })

  it('displays goal information correctly for habit without max goal', () => {
    const habitNoMax = {
      ...testHabit,
      goalMax: null
    }

    render(
      <HabitHistory
        habit={habitNoMax}
        userId="user-1"
        onClose={mockOnClose}
        onUpdateLog={mockOnUpdateLog}
        onCreateLog={mockOnCreateLog}
      />
    )

    expect(screen.getByText(/Goal: 5\+ times per daily/i)).toBeInTheDocument()
  })
})
