import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format, subDays, isAfter, isBefore, startOfDay } from 'date-fns'
import type { Habit, HabitLog } from '../types/habit'

type TimePeriod = 7 | 30 | 60 | 90

interface ProgressChartProps {
  habit: Habit
  logs: HabitLog[]
}

export function ProgressChart({ habit, logs }: ProgressChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(30)

  const periods: { value: TimePeriod; label: string }[] = [
    { value: 7, label: '7 days' },
    { value: 30, label: '30 days' },
    { value: 60, label: '60 days' },
    { value: 90, label: '90 days' }
  ]

  // Prepare chart data
  const chartData = useMemo(() => {
    const days = selectedPeriod
    const today = startOfDay(new Date())
    const startDate = subDays(today, days - 1)

    // Filter logs within the date range
    const filteredLogs = logs.filter(log => {
      const logDate = startOfDay(new Date(log.date))
      return (isAfter(logDate, startDate) || logDate.getTime() === startDate.getTime()) &&
             (isBefore(logDate, today) || logDate.getTime() === today.getTime())
    })

    // Create a map of date -> value
    const logMap = new Map<string, number>()
    filteredLogs.forEach(log => {
      const dateKey = format(new Date(log.date), 'yyyy-MM-dd')
      logMap.set(dateKey, log.value)
    })

    // Generate array of all dates in range with values
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i)
      const dateKey = format(date, 'yyyy-MM-dd')
      const value = logMap.get(dateKey) || 0

      data.push({
        date: dateKey,
        displayDate: format(date, 'MMM d'),
        value: value,
        goalMin: habit.goalMin,
        goalMax: habit.goalMax
      })
    }

    return data
  }, [logs, selectedPeriod, habit.goalMin, habit.goalMax])

  // Calculate Y-axis domain to include goals
  const yAxisDomain = useMemo(() => {
    const values = chartData.map(d => d.value)
    const maxValue = Math.max(...values, habit.goalMin, habit.goalMax || 0)
    // Add padding, minimum of 1 to avoid [0, 0] domain
    return [0, Math.max(1, Math.ceil(maxValue * 1.1))]
  }, [chartData, habit.goalMin, habit.goalMax])

  // Check if there are any logs with non-zero values in the period
  const hasData = useMemo(() => {
    return chartData.some(d => d.value > 0)
  }, [chartData])

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for the selected period
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Time Period Selector */}
      <div className="flex justify-center gap-2 mb-4">
        {periods.map(period => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === period.value
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 12 }}
            tickMargin={8}
            interval={selectedPeriod > 30 ? Math.floor(selectedPeriod / 7) : selectedPeriod > 14 ? 2 : 1}
          />
          <YAxis
            domain={yAxisDomain}
            tick={{ fontSize: 12 }}
            tickMargin={8}
            label={{ value: habit.unit, angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />

          {/* Goal Min Reference Line */}
          <ReferenceLine
            y={habit.goalMin}
            stroke="#22c55e"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `Goal Min: ${habit.goalMin}`,
              position: 'right',
              fill: '#22c55e',
              fontSize: 12
            }}
          />

          {/* Goal Max Reference Line (if exists) */}
          {habit.goalMax && (
            <ReferenceLine
              y={habit.goalMax}
              stroke="#3b82f6"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Goal Max: ${habit.goalMax}`,
                position: 'right',
                fill: '#3b82f6',
                fontSize: 12
              }}
            />
          )}

          {/* Actual Values Line */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name={habit.name}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
