import { useState } from 'react'

const POPULAR_EMOJIS = [
  '💪', '🏃', '📚', '💧', '🧘', '🎯', '✍️', '🎨',
  '🎵', '🏋️', '🚴', '🏊', '🧑‍💻', '🌱', '🍎', '😴',
  '🧠', '💼', '📝', '🎓', '☕', '🌟', '⭐', '✨',
  '🔥', '💡', '🎬', '📱', '🎮', '🎸', '📖', '🛌'
]

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 text-4xl bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center"
      >
        {value || '😀'}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-4 grid grid-cols-8 gap-1 w-80">
            {POPULAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onChange(emoji)
                  setIsOpen(false)
                }}
                className="w-10 h-10 text-2xl hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
