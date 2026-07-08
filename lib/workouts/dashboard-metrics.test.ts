import { describe, expect, it } from 'vitest'

import { buildDashboardMetrics, type DashboardWorkoutSession } from './dashboard-metrics'

const SESSIONS: DashboardWorkoutSession[] = [
  {
    id: 'session-1',
    date: '2026-07-01',
    workout_sets: [
      {
        id: 'set-1',
        weight: 60,
        reps: 10,
        exercises: { id: 'bench', name: 'ベンチプレス', muscle_group: 'chest' },
      },
      {
        id: 'set-2',
        weight: 65,
        reps: 8,
        exercises: { id: 'bench', name: 'ベンチプレス', muscle_group: 'chest' },
      },
    ],
  },
  {
    id: 'session-2',
    date: '2026-07-03',
    workout_sets: [
      {
        id: 'set-3',
        weight: 100,
        reps: 5,
        exercises: { id: 'squat', name: 'スクワット', muscle_group: 'legs' },
      },
      {
        id: 'set-4',
        weight: 70,
        reps: 6,
        exercises: { id: 'bench', name: 'ベンチプレス', muscle_group: 'chest' },
      },
    ],
  },
  {
    id: 'session-3',
    date: '2026-07-08',
    workout_sets: [
      {
        id: 'set-5',
        weight: 110,
        reps: 3,
        exercises: { id: 'squat', name: 'スクワット', muscle_group: 'legs' },
      },
    ],
  },
]

describe('buildDashboardMetrics', () => {
  it('builds max weight and volume series per exercise', () => {
    const metrics = buildDashboardMetrics(SESSIONS)

    expect(metrics.maxWeightByExercise).toEqual([
      {
        exerciseId: 'bench',
        exerciseName: 'ベンチプレス',
        points: [
          { date: '2026-07-01', value: 65 },
          { date: '2026-07-03', value: 70 },
        ],
      },
      {
        exerciseId: 'squat',
        exerciseName: 'スクワット',
        points: [
          { date: '2026-07-03', value: 100 },
          { date: '2026-07-08', value: 110 },
        ],
      },
    ])
    expect(metrics.volumeByExercise).toEqual([
      {
        exerciseId: 'bench',
        exerciseName: 'ベンチプレス',
        points: [
          { date: '2026-07-01', value: 1120 },
          { date: '2026-07-03', value: 420 },
        ],
      },
      {
        exerciseId: 'squat',
        exerciseName: 'スクワット',
        points: [
          { date: '2026-07-03', value: 500 },
          { date: '2026-07-08', value: 330 },
        ],
      },
    ])
  })

  it('builds frequency, muscle group, and weekly volume metrics', () => {
    const metrics = buildDashboardMetrics(SESSIONS, { referenceDate: new Date('2026-07-08') })

    expect(metrics.frequency).toHaveLength(30)
    expect(metrics.frequency.at(0)).toEqual({ date: '2026-06-09', sessionCount: 0 })
    expect(metrics.frequency.filter((day) => day.sessionCount > 0)).toEqual([
      { date: '2026-07-01', sessionCount: 1 },
      { date: '2026-07-03', sessionCount: 1 },
      { date: '2026-07-08', sessionCount: 1 },
    ])
    expect(metrics.muscleGroupVolumes).toEqual([
      { muscleGroup: 'chest', volume: 1540 },
      { muscleGroup: 'legs', volume: 830 },
    ])
    expect(metrics.weeklyVolumes).toEqual([
      { weekStart: '2026-06-29', volume: 2040 },
      { weekStart: '2026-07-06', volume: 330 },
    ])
  })

  it('limits muscle group volume to the latest 30 days', () => {
    const metrics = buildDashboardMetrics(
      [
        ...SESSIONS,
        {
          id: 'session-old',
          date: '2026-05-01',
          workout_sets: [
            {
              id: 'set-old',
              weight: 200,
              reps: 10,
              exercises: { id: 'deadlift', name: 'デッドリフト', muscle_group: 'back' },
            },
          ],
        },
      ],
      { referenceDate: new Date('2026-07-08') }
    )

    expect(metrics.muscleGroupVolumes).toEqual([
      { muscleGroup: 'chest', volume: 1540 },
      { muscleGroup: 'legs', volume: 830 },
    ])
  })

  it('returns empty metrics when there are no sessions', () => {
    expect(buildDashboardMetrics([], { referenceDate: new Date('2026-07-08') })).toEqual({
      maxWeightByExercise: [],
      volumeByExercise: [],
      frequency: Array.from({ length: 30 }, (_, index) => ({
        date: `2026-06-${String(index + 9).padStart(2, '0')}`,
        sessionCount: 0,
      })).map((day, index) =>
        index < 22
          ? day
          : { date: `2026-07-${String(index - 21).padStart(2, '0')}`, sessionCount: 0 }
      ),
      muscleGroupVolumes: [],
      weeklyVolumes: [],
    })
  })
})
