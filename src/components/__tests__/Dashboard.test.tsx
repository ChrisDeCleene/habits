import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { render, screen } from "../../test/test-utils";
import userEvent from "@testing-library/user-event";
import { Dashboard } from "../Dashboard";
import * as useAuthModule from "../../hooks/useAuth";
import * as useHabitsModule from "../../hooks/useHabits";
import * as useHabitLogsModule from "../../hooks/useHabitLogs";

describe("Dashboard", () => {
  const mockSignOut = vi.fn();
  const mockAddHabit = vi.fn();
  const mockUpdateHabit = vi.fn();
  const mockDeleteHabit = vi.fn();
  const mockReorderHabits = vi.fn();
  const mockLogHabit = vi.fn();
  const mockUpdateLog = vi.fn();

  const mockUser = {
    uid: "test-uid",
    email: "test@example.com",
    displayName: "Test User",
    photoURL: "https://example.com/photo.jpg",
  };

  const mockHabits = [
    {
      id: "habit-1",
      userId: "test-uid",
      name: "Morning Exercise",
      emoji: "💪",
      goalMin: 3,
      goalMax: 5,
      unit: "times" as const,
      frequency: "daily" as const,
      order: 0,
      createdAt: new Date("2025-01-01"),
    },
    {
      id: "habit-2",
      userId: "test-uid",
      name: "Read Books",
      emoji: "📚",
      goalMin: 30,
      goalMax: null,
      unit: "minutes" as const,
      frequency: "daily" as const,
      order: 1,
      createdAt: new Date("2025-01-02"),
    },
  ];

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
      updateHabit: mockUpdateHabit,
      deleteHabit: mockDeleteHabit,
      reorderHabits: mockReorderHabits,
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

  describe("Edit Functionality", () => {
    beforeEach(() => {
      vi.spyOn(useHabitsModule, "useHabits").mockReturnValue({
        habits: mockHabits,
        loading: false,
        error: null,
        addHabit: mockAddHabit,
        updateHabit: mockUpdateHabit,
        deleteHabit: mockDeleteHabit,
        reorderHabits: mockReorderHabits,
      });
    });

    it("displays edit button on habit cards", () => {
      render(<Dashboard />);
      const editButtons = screen.getAllByTitle("Edit habit");
      expect(editButtons).toHaveLength(2);
    });

    it("opens edit form when edit button is clicked", async () => {
      render(<Dashboard />);
      const editButtons = screen.getAllByTitle("Edit habit");

      await editButtons[0].click();

      // Should show "Edit Habit" title instead of "Create New Habit"
      expect(screen.getByText("Edit Habit")).toBeInTheDocument();
    });

    it("pre-fills form with habit data when editing", async () => {
      render(<Dashboard />);
      const editButtons = screen.getAllByTitle("Edit habit");

      await editButtons[0].click();

      // Check that form is pre-filled with habit data
      const nameInput = screen.getByPlaceholderText("e.g., Morning Exercise");
      expect(nameInput).toHaveValue("Morning Exercise");
    });

    it("calls updateHabit when editing and saving changes", async () => {
      const user = userEvent.setup();
      mockUpdateHabit.mockResolvedValue(undefined);

      render(<Dashboard />);
      const editButtons = screen.getAllByTitle("Edit habit");

      await user.click(editButtons[0]);

      // Change the name
      const nameInput = screen.getByPlaceholderText("e.g., Morning Exercise");
      await user.clear(nameInput);
      await user.type(nameInput, "Evening Exercise");

      // Submit the form
      const saveButton = screen.getByRole("button", { name: /save changes/i });
      await user.click(saveButton);

      expect(mockUpdateHabit).toHaveBeenCalledWith("habit-1", {
        name: "Evening Exercise",
        emoji: "💪",
        goalMin: 3,
        goalMax: 5,
        unit: "times",
        frequency: "daily",
      });
    });

    it("closes edit form after successful save", async () => {
      mockUpdateHabit.mockResolvedValue(undefined);

      render(<Dashboard />);
      const editButtons = screen.getAllByTitle("Edit habit");

      await editButtons[0].click();
      expect(screen.getByText("Edit Habit")).toBeInTheDocument();

      const saveButton = screen.getByRole("button", { name: /save changes/i });
      await saveButton.click();

      // Wait for form to close
      await vi.waitFor(() => {
        expect(screen.queryByText("Edit Habit")).not.toBeInTheDocument();
      });
    });

    it("can cancel editing without saving changes", async () => {
      render(<Dashboard />);
      const editButtons = screen.getAllByTitle("Edit habit");

      await editButtons[0].click();
      expect(screen.getByText("Edit Habit")).toBeInTheDocument();

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await cancelButton.click();

      expect(screen.queryByText("Edit Habit")).not.toBeInTheDocument();
      expect(mockUpdateHabit).not.toHaveBeenCalled();
    });
  });

  describe("Drag-to-Reorder Functionality", () => {
    beforeEach(() => {
      vi.spyOn(useHabitsModule, "useHabits").mockReturnValue({
        habits: mockHabits,
        loading: false,
        error: null,
        addHabit: mockAddHabit,
        updateHabit: mockUpdateHabit,
        deleteHabit: mockDeleteHabit,
        reorderHabits: mockReorderHabits,
      });
    });

    it("renders habits in order based on order field", () => {
      render(<Dashboard />);

      const habitNames = screen.getAllByRole("heading", { level: 3 });
      expect(habitNames[0]).toHaveTextContent("Morning Exercise");
      expect(habitNames[1]).toHaveTextContent("Read Books");
    });

    it("renders habits within drag-and-drop context", () => {
      const { container } = render(<Dashboard />);

      // Check that habits are rendered (drag handles will be visible on hover)
      expect(container.querySelectorAll(".relative.group").length).toBeGreaterThan(0);
    });
  });

  describe("Habit Display with Order", () => {
    it("displays multiple habits in correct order", () => {
      const habitsInOrder = [
        { ...mockHabits[0], order: 0 },
        { ...mockHabits[1], order: 1 },
      ];

      vi.spyOn(useHabitsModule, "useHabits").mockReturnValue({
        habits: habitsInOrder,
        loading: false,
        error: null,
        addHabit: mockAddHabit,
        updateHabit: mockUpdateHabit,
        deleteHabit: mockDeleteHabit,
        reorderHabits: mockReorderHabits,
      });

      render(<Dashboard />);

      const habitCards = screen.getAllByRole("heading", { level: 3 });
      expect(habitCards[0]).toHaveTextContent("Morning Exercise");
      expect(habitCards[1]).toHaveTextContent("Read Books");
    });

    it("respects custom order different from creation date", () => {
      const habitsReordered = [
        { ...mockHabits[1], order: 0 }, // Read Books first
        { ...mockHabits[0], order: 1 }, // Morning Exercise second
      ];

      vi.spyOn(useHabitsModule, "useHabits").mockReturnValue({
        habits: habitsReordered,
        loading: false,
        error: null,
        addHabit: mockAddHabit,
        updateHabit: mockUpdateHabit,
        deleteHabit: mockDeleteHabit,
        reorderHabits: mockReorderHabits,
      });

      render(<Dashboard />);

      const habitCards = screen.getAllByRole("heading", { level: 3 });
      expect(habitCards[0]).toHaveTextContent("Read Books");
      expect(habitCards[1]).toHaveTextContent("Morning Exercise");
    });
  });
});
