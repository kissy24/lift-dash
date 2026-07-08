import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('recharts', () => ({
  Bar: () => null,
  BarChart: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  Cell: () => null,
  Legend: () => null,
  Line: () => null,
  LineChart: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}))

import { DashboardCharts } from './DashboardCharts'

const METRICS = {
  maxWeightByExercise: [
    {
      exerciseId: 'bench',
      exerciseName: 'ベンチプレス',
      points: [
        { date: '2026-07-01', value: 65 },
        { date: '2026-07-03', value: 70 },
      ],
    },
  ],
  volumeByExercise: [
    {
      exerciseId: 'bench',
      exerciseName: 'ベンチプレス',
      points: [{ date: '2026-07-01', value: 1120 }],
    },
  ],
  frequency: [{ date: '2026-07-01', sessionCount: 1 }],
  muscleGroupVolumes: [{ muscleGroup: 'chest' as const, volume: 1120 }],
  weeklyVolumes: [{ weekStart: '2026-06-29', volume: 1120 }],
}

describe('DashboardCharts', () => {
  it('renders every dashboard chart section', () => {
    render(<DashboardCharts metrics={METRICS} />)

    expect(screen.getByRole('heading', { name: '最大重量推移' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '総ボリューム推移' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'トレーニング頻度' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '部位別割合' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '週次ボリューム' })).toBeInTheDocument()
    expect(screen.getAllByText('ベンチプレス')).toHaveLength(2)
    expect(screen.getByText('胸 1,120 kg')).toBeInTheDocument()
    expect(screen.getByText('2026-07-01')).toBeInTheDocument()
  })

  it('renders empty states when there is no metric data', () => {
    render(
      <DashboardCharts
        metrics={{
          maxWeightByExercise: [],
          volumeByExercise: [],
          frequency: [],
          muscleGroupVolumes: [],
          weeklyVolumes: [],
        }}
      />
    )

    expect(screen.getAllByText('表示できる記録がまだありません')).toHaveLength(5)
  })
})
