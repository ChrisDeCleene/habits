import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen } from "../../test/test-utils";
import { SortableHabitCard } from "../SortableHabitCard";
import type { Habit } from "../../types/habit";

// Mock @dnd-kit/sortable
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

// Mock useHabitLogs hooks
vi.mock("../../hooks/useHabitLogs", () => ({
  useTodayLog: () => ({
    todayLog: null,
    loading: false,
  }),
  useCurrentPeriodLog: () => ({
    totalValue: 0,
    logs: [],
    loading: false,
  }),
}));

describe("SortableHabitCard", () => {
  const mockHabit: Habit = {
    id: "test-habit",
    userId: "test-user",
    name: "Test Habit",
    emoji: "🎯",
    goalMin: 5,
    goalMax: 10,
    unit: "times",
    frequency: "daily",
    order: 0,
    createdAt: new Date(),
  };

  const mockOnLog = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnCreateLog = vi.fn();

  it("renders the habit card with drag handle", () => {
    render(
      <SortableHabitCard
        habit={mockHabit}
        userId="test-user"
        onLog={mockOnLog}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onCreateLog={mockOnCreateLog}
      />
    );

    expect(screen.getByText("Test Habit")).toBeInTheDocument();
  });

  it("displays the habit emoji", () => {
    render(
      <SortableHabitCard
        habit={mockHabit}
        userId="test-user"
        onLog={mockOnLog}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onCreateLog={mockOnCreateLog}
      />
    );

    expect(screen.getByText("🎯")).toBeInTheDocument();
  });

  it("passes edit handler to HabitCard", () => {
    render(
      <SortableHabitCard
        habit={mockHabit}
        userId="test-user"
        onLog={mockOnLog}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onCreateLog={mockOnCreateLog}
      />
    );

    const editButton = screen.getByTitle("Edit habit");
    expect(editButton).toBeInTheDocument();
  });

  it("shows goal information correctly", () => {
    render(
      <SortableHabitCard
        habit={mockHabit}
        userId="test-user"
        onLog={mockOnLog}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onCreateLog={mockOnCreateLog}
      />
    );

    // Should show the range goal
    expect(screen.getByText(/5-10 times/i)).toBeInTheDocument();
  });

  it("renders with single goal (no range)", () => {
    const singleGoalHabit = {
      ...mockHabit,
      goalMax: null,
    };

    render(
      <SortableHabitCard
        habit={singleGoalHabit}
        userId="test-user"
        onLog={mockOnLog}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onCreateLog={mockOnCreateLog}
      />
    );

    expect(screen.getByText(/5 times/i)).toBeInTheDocument();
  });

  it("shows frequency information", () => {
    render(
      <SortableHabitCard
        habit={mockHabit}
        userId="test-user"
        onLog={mockOnLog}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onCreateLog={mockOnCreateLog}
      />
    );

    expect(screen.getByText(/daily/i)).toBeInTheDocument();
  });
});
