import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { render, screen } from "../../test/test-utils";
import { Dashboard } from "../Dashboard";
import * as useAuthModule from "../../hooks/useAuth";
import * as useHabitsModule from "../../hooks/useHabits";
import * as useHabitLogsModule from "../../hooks/useHabitLogs";

describe("Dashboard", () => {
  const mockSignOut = vi.fn();
  const mockAddHabit = vi.fn();
  const mockDeleteHabit = vi.fn();
  const mockLogHabit = vi.fn();
  const mockUpdateLog = vi.fn();

  const mockUser = {
    uid: "test-uid",
    email: "test@example.com",
    displayName: "Test User",
    photoURL: "https://example.com/photo.jpg",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      user: mockUser,
      loading: false,
      signInWithGoogle: vi.fn(),
      signOut: mockSignOut,
    });

    vi.spyOn(useHabitsModule, "useHabits").mockReturnValue({
      habits: [],
      loading: false,
      error: null,
      addHabit: mockAddHabit,
      updateHabit: vi.fn(),
      deleteHabit: mockDeleteHabit,
    });

    vi.spyOn(useHabitLogsModule, "useHabitLogs").mockReturnValue({
      logs: [],
      loading: false,
      error: null,
      logHabit: mockLogHabit,
      updateLog: mockUpdateLog,
    });
  });

  it("renders the dashboard with header", () => {
    render(<Dashboard />);
    expect(screen.getByText("Habit Tracker")).toBeInTheDocument();
  });

  it("displays user photo when available", () => {
    render(<Dashboard />);
    const img = screen.getByRole("img", { name: "Test User" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", mockUser.photoURL);
  });

  it("renders sign out button", () => {
    render(<Dashboard />);
    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
  });

  it("calls signOut when sign out button is clicked", async () => {
    render(<Dashboard />);
    const signOutButton = screen.getByRole("button", { name: /sign out/i });

    await signOutButton.click();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("shows empty state when no habits exist", () => {
    render(<Dashboard />);
    expect(screen.getByText("No habits yet")).toBeInTheDocument();
    expect(
      screen.getByText(/Start building better routines/i)
    ).toBeInTheDocument();
  });

  it("displays add habit button", () => {
    render(<Dashboard />);
    const addButtons = screen.getAllByRole("button", { name: /add habit/i });
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it("displays current date", () => {
    render(<Dashboard />);
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(screen.getByText(today)).toBeInTheDocument();
  });
});
