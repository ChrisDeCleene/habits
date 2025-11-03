import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { LoginPage } from '../LoginPage'
import * as AuthContext from '../../contexts/AuthContext'

describe('LoginPage', () => {
  const mockSignInWithGoogle = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: vi.fn()
    })
  })

  it('renders the login page with correct heading', () => {
    render(<LoginPage />)
    expect(screen.getByText('Habit Tracker')).toBeInTheDocument()
    expect(screen.getByText('Track your daily habits and reach your goals')).toBeInTheDocument()
  })

  it('renders the Google sign-in button', () => {
    render(<LoginPage />)
    const button = screen.getByRole('button', { name: /continue with google/i })
    expect(button).toBeInTheDocument()
  })

  it('calls signInWithGoogle when button is clicked', async () => {
    render(<LoginPage />)
    const button = screen.getByRole('button', { name: /continue with google/i })

    await button.click()

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when signing in', async () => {
    render(<LoginPage />)
    const button = screen.getByRole('button', { name: /continue with google/i })

    mockSignInWithGoogle.mockImplementation(() => new Promise(() => {})) // Never resolves
    button.click()

    // Wait for next tick
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
  })

  it('shows error message when sign-in fails', async () => {
    mockSignInWithGoogle.mockRejectedValue(new Error('Auth failed'))

    render(<LoginPage />)
    const button = screen.getByRole('button', { name: /continue with google/i })

    await button.click()

    // Wait for error to appear
    await screen.findByText(/failed to sign in/i)

    expect(screen.getByText(/failed to sign in/i)).toBeInTheDocument()
  })
})
