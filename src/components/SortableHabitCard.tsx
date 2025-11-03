import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { HabitCard } from './HabitCard'
import type { Habit } from '../types/habit'

interface SortableHabitCardProps {
  habit: Habit
  userId: string
  onLog: (habitId: string, value: number) => Promise<void>
  onUpdate: (logId: string, value: number) => Promise<void>
  onDelete: (habitId: string) => Promise<void>
  onEdit?: (habit: Habit) => void
}

export function SortableHabitCard({
  habit,
  userId,
  onLog,
  onUpdate,
  onDelete,
  onEdit
}: SortableHabitCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: habit.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>

      {/* Habit Card */}
      <div className="pl-8">
        <HabitCard
          habit={habit}
          userId={userId}
          onLog={onLog}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </div>
    </div>
  )
}
