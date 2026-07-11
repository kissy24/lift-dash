import { describe, expect, it } from 'vitest'

import { buildPersonalRecords, type PersonalRecordWorkoutSession } from './personal-records'

const SESSIONS: PersonalRecordWorkoutSession[] = [
  {
    id: 'session-1',
    date: '2026-07-01',
    created_at: '2026-07-01T09:00:00Z',
    workout_sets: [
      {
        id: 'set-1',
        weight: 80,
        reps: 8,
        created_at: '2026-07-01T09:01:00Z',
        exercises: { id: 'bench', name: 'ベンチプレス' },
      },
      {
        id: 'set-2',
        weight: 100,
        reps: 5,
        created_at: '2026-07-01T09:02:00Z',
        exercises: { id: 'squat', name: 'スクワット' },
      },
    ],
  },
  {
    id: 'session-2',
    date: '2026-07-03',
    created_at: '2026-07-03T10:00:00Z',
    workout_sets: [
      {
        id: 'set-3',
        weight: 85,
        reps: 6,
        created_at: '2026-07-03T10:01:00Z',
        exercises: { id: 'bench', name: 'ベンチプレス' },
      },
      {
        id: 'set-4',
        weight: 110,
        reps: 3,
        created_at: '2026-07-03T10:02:00Z',
        exercises: { id: 'squat', name: 'スクワット' },
      },
    ],
  },
]

describe('buildPersonalRecords', () => {
  it('returns the heaviest set for each exercise', () => {
    expect(buildPersonalRecords(SESSIONS)).toEqual([
      {
        exerciseId: 'bench',
        exerciseName: 'ベンチプレス',
        weight: 85,
        reps: 6,
        date: '2026-07-03',
      },
      {
        exerciseId: 'squat',
        exerciseName: 'スクワット',
        weight: 110,
        reps: 3,
        date: '2026-07-03',
      },
    ])
  })

  it('uses the latest record when the maximum weight is tied', () => {
    const tiedSessions: PersonalRecordWorkoutSession[] = [
      ...SESSIONS,
      {
        id: 'session-3',
        date: '2026-07-04',
        created_at: '2026-07-04T09:00:00Z',
        workout_sets: [
          {
            id: 'set-5',
            weight: 85,
            reps: 4,
            created_at: '2026-07-04T09:01:00Z',
            exercises: { id: 'bench', name: 'ベンチプレス' },
          },
        ],
      },
      {
        id: 'session-4',
        date: '2026-07-04',
        created_at: '2026-07-04T12:00:00Z',
        workout_sets: [
          {
            id: 'set-6',
            weight: 85,
            reps: 2,
            created_at: '2026-07-04T12:01:00Z',
            exercises: { id: 'bench', name: 'ベンチプレス' },
          },
          {
            id: 'set-7',
            weight: 85,
            reps: 1,
            created_at: '2026-07-04T12:02:00Z',
            exercises: { id: 'bench', name: 'ベンチプレス' },
          },
        ],
      },
    ]

    expect(
      buildPersonalRecords(tiedSessions).find((record) => record.exerciseId === 'bench')
    ).toEqual({
      exerciseId: 'bench',
      exerciseName: 'ベンチプレス',
      weight: 85,
      reps: 1,
      date: '2026-07-04',
    })
  })

  it('ignores deleted exercise relations and returns an empty result without records', () => {
    expect(
      buildPersonalRecords([
        {
          id: 'session-1',
          date: '2026-07-01',
          created_at: '2026-07-01T09:00:00Z',
          workout_sets: [
            {
              id: 'set-1',
              weight: 80,
              reps: 8,
              created_at: '2026-07-01T09:01:00Z',
              exercises: null,
            },
          ],
        },
      ])
    ).toEqual([])
    expect(buildPersonalRecords([])).toEqual([])
  })
})
