'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { MUSCLE_GROUP_LABELS } from '@/lib/exercises/muscle-groups'
import type { DashboardMetrics, DashboardSeries } from '@/lib/workouts/dashboard-metrics'

type DashboardChartsProps = {
  metrics: DashboardMetrics
}

type ChartCardProps = {
  title: string
  isEmpty: boolean
  children: React.ReactNode
}

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2', '#4f46e5']

export function DashboardCharts({ metrics }: DashboardChartsProps) {
  return (
    <section className="grid gap-6">
      <ExerciseLineChart series={metrics.maxWeightByExercise} />
      <ExerciseVolumeChart series={metrics.volumeByExercise} />
      <FrequencyHeatmap frequency={metrics.frequency} />
      <MuscleGroupDonutChart data={metrics.muscleGroupVolumes} />
      <WeeklyVolumeChart data={metrics.weeklyVolumes} />
    </section>
  )
}

function ExerciseLineChart({ series }: { series: DashboardSeries[] }) {
  const data = mergeSeries(series)
  return (
    <ChartCard title="最大重量推移" isEmpty={series.length === 0}>
      <ResponsiveContainer height={260} width="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {series.map((exercise, index) => (
            <Line
              dataKey={exercise.exerciseName}
              key={exercise.exerciseId}
              stroke={COLORS[index % COLORS.length]}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <SeriesLegend series={series} />
    </ChartCard>
  )
}

function ExerciseVolumeChart({ series }: { series: DashboardSeries[] }) {
  const data = mergeSeries(series)
  return (
    <ChartCard title="総ボリューム推移" isEmpty={series.length === 0}>
      <ResponsiveContainer height={260} width="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {series.map((exercise, index) => (
            <Bar
              dataKey={exercise.exerciseName}
              fill={COLORS[index % COLORS.length]}
              key={exercise.exerciseId}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <SeriesLegend series={series} />
    </ChartCard>
  )
}

function FrequencyHeatmap({ frequency }: { frequency: DashboardMetrics['frequency'] }) {
  const hasSessions = frequency.some((day) => day.sessionCount > 0)

  return (
    <ChartCard title="トレーニング頻度" isEmpty={!hasSessions}>
      <div className="grid grid-cols-10 gap-1 sm:grid-cols-[repeat(15,minmax(0,1fr))]">
        {frequency.map((day) => (
          <div
            className={`rounded-md p-2 text-center text-xs ${heatmapClassName(day.sessionCount)}`}
            key={day.date}
            title={`${day.date}: ${day.sessionCount}セッション`}
          >
            <span className="block font-medium">{day.date}</span>
            <span className="text-primary">{day.sessionCount}回</span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

function heatmapClassName(sessionCount: number): string {
  if (sessionCount >= 3) return 'bg-primary text-primary-foreground'
  if (sessionCount === 2) return 'bg-primary/60 text-primary-foreground'
  if (sessionCount === 1) return 'bg-primary/20 text-primary'
  return 'bg-muted text-muted-foreground'
}

function MuscleGroupDonutChart({ data }: { data: DashboardMetrics['muscleGroupVolumes'] }) {
  const chartData = data.map((item) => ({
    name: MUSCLE_GROUP_LABELS[item.muscleGroup],
    value: item.volume,
  }))
  return (
    <ChartCard title="部位別割合" isEmpty={data.length === 0}>
      <ResponsiveContainer height={260} width="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" innerRadius={60} nameKey="name" outerRadius={90}>
            {chartData.map((item, index) => (
              <Cell fill={COLORS[index % COLORS.length]} key={item.name} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
        {data.map((item) => (
          <li key={item.muscleGroup}>
            {MUSCLE_GROUP_LABELS[item.muscleGroup]} {item.volume.toLocaleString('ja-JP')} kg
          </li>
        ))}
      </ul>
    </ChartCard>
  )
}

function WeeklyVolumeChart({ data }: { data: DashboardMetrics['weeklyVolumes'] }) {
  return (
    <ChartCard title="週次ボリューム" isEmpty={data.length === 0}>
      <ResponsiveContainer height={260} width="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="weekStart" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="volume" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function ChartCard({ title, isEmpty, children }: ChartCardProps) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      {isEmpty ? (
        <p className="mt-4 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          表示できる記録がまだありません
        </p>
      ) : (
        <div className="mt-4">{children}</div>
      )}
    </section>
  )
}

function SeriesLegend({ series }: { series: DashboardSeries[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
      {series.map((exercise) => (
        <li key={exercise.exerciseId}>{exercise.exerciseName}</li>
      ))}
    </ul>
  )
}

function mergeSeries(series: DashboardSeries[]): Array<Record<string, number | string>> {
  const byDate = new Map<string, Record<string, number | string>>()

  series.forEach((exercise) => {
    exercise.points.forEach((point) => {
      const current = byDate.get(point.date) ?? { date: point.date }
      current[exercise.exerciseName] = point.value
      byDate.set(point.date, current)
    })
  })

  return [...byDate.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)))
}
