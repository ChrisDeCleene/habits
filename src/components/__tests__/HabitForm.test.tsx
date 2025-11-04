import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "../../test/test-utils";
import userEvent from "@testing-library/user-event";
import { HabitForm } from "../HabitForm";
import type { Habit } from "../../types/habit";

describe("HabitForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Create Mode", () => {
    it("renders create form with correct title", () => {
      render(<HabitForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText("Create New Habit")).toBeInTheDocument();
    });

    it("shows Create Habit button text", () => {
      render(<HabitForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByRole("button", { name: /create habit/i })).toBeInTheDocument();
    });

    it("has empty form fields initially", () => {
      render(<HabitForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const nameInput = screen.getByPlaceholderText("e.g., Morning Exercise");
      expect(nameInput).toHaveValue("");
    });

    it("calls onSubmit with form data when creating", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(<HabitForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const nameInput = screen.getByPlaceholderText("e.g., Morning Exercise");
      await user.type(nameInput, "Morning Run");

      const goalInput = screen.getByPlaceholderText("1");
      await user.type(goalInput, "5");

      const submitButton = screen.getByRole("button", { name: /create habit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "Morning Run",
          emoji: "🎯",
          goalMin: 5,
          goalMax: null,
          unit: "times",
          frequency: "daily",
        });
      });
    });
  });

  describe("Edit Mode", () => {
    const mockHabit: Habit = {
      id: "habit-1",
      userId: "user-1",
      name: "Morning Exercise",
      emoji: "💪",
      goalMin: 3,
      goalMax: 5,
      unit: "times",
      frequency: "daily",
      order: 0,
      createdAt: new Date(),
    };

    it("renders edit form with correct title", () => {
      render(
        <HabitForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={mockHabit}
        />
      );

      expect(screen.getByText("Edit Habit")).toBeInTheDocument();
    });

    it("shows Save Changes button text in edit mode", () => {
      render(
        <HabitForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={mockHabit}
        />
      );

      expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });

    it("pre-fills form with habit name", () => {
      render(
        <HabitForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={mockHabit}
        />
      );

      const nameInput = screen.getByPlaceholderText("e.g., Morning Exercise");
      expect(nameInput).toHaveValue("Morning Exercise");
    });

    it("pre-fills form with emoji", () => {
      render(
        <HabitForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={mockHabit}
        />
      );

      expect(screen.getByText("💪")).toBeInTheDocument();
    });

    it("pre-fills form with goal range", () => {
      render(
        <HabitForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={mockHabit}
        />
      );

      const minInput = screen.getByPlaceholderText("1");
      const maxInput = screen.getByPlaceholderText("5");

      expect(minInput).toHaveValue(3);
      expect(maxInput).toHaveValue(5);
    });

    it("pre-fills form with unit", () => {
      render(
        <HabitForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={mockHabit}
        />
      );

      const unitSelect = screen.getByDisplayValue("times");
      expect(unitSelect).toBeInTheDocument();
    });

    it("pre-fills form with frequency", () => {
      render(
        <HabitForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={mockHabit}
        />
      );

      const frequencySelect = screen.getByDisplayValue("Daily");
      expect(frequencySelect).toBeInTheDocument();
    });

    it("calls onSubmit with updated data when editing", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <HabitForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={mockHabit}
        />
      );

      // Change the name
      const nameInput = screen.getByPlaceholderText("e.g., Morning Exercise");
      await user.clear(nameInput);
      await user.type(nameInput, "Evening Exercise");

      const submitButton = screen.getByRole("button", { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "Evening Exercise",
          emoji: "💪",
          goalMin: 3,
          goalMax: 5,
          unit: "times",
          frequency: "daily",
        });
      });
    });

    it("shows range checkbox as checked when editing habit with range", () => {
      render(
        <HabitForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={mockHabit}
        />
      );

      const rangeCheckbox = screen.getByLabelText(/set a range/i);
      expect(rangeCheckbox).toBeChecked();
    });

    it("shows range checkbox as unchecked when editing habit without range", () => {
      const habitWithoutRange = {
        ...mockHabit,
        goalMax: null,
      };

      render(
        <HabitForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={habitWithoutRange}
        />
      );

      const rangeCheckbox = screen.getByLabelText(/set a range/i);
      expect(rangeCheckbox).not.toBeChecked();
    });
  });

  describe("Form Validation", () => {
    it("shows error when name is empty", async () => {
      render(<HabitForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole("button", { name: /create habit/i });
      await submitButton.click();

      expect(await screen.findByText("Please enter a habit name")).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("shows error when goal is invalid", async () => {
      const user = userEvent.setup();
      render(<HabitForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const nameInput = screen.getByPlaceholderText("e.g., Morning Exercise");
      await user.type(nameInput, "Test");

      const submitButton = screen.getByRole("button", { name: /create habit/i });
      await user.click(submitButton);

      expect(await screen.findByText("Please enter a valid goal")).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("sets min attribute on max goal input to prevent invalid ranges", async () => {
      const user = userEvent.setup();

      render(<HabitForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const minGoalInput = screen.getByPlaceholderText("1");
      await user.type(minGoalInput, "5");

      // Enable range
      const rangeCheckbox = screen.getByLabelText(/set a range/i);
      await user.click(rangeCheckbox);

      // Wait for the max input to appear
      const maxGoalInput = await screen.findByPlaceholderText("5");

      // Verify the max input has min attribute set to minGoal + 1
      expect(maxGoalInput).toHaveAttribute("min", "6");
    });
  });

  describe("Cancel Functionality", () => {
    it("calls onCancel when cancel button is clicked", async () => {
      render(<HabitForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await cancelButton.click();

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when X button is clicked", async () => {
      render(<HabitForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const closeButton = screen.getByRole("button", { name: "" }); // X button has no text
      await closeButton.click();

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });
});
