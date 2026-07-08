import { describe, expect, it } from 'vitest'

import { buildWorkoutCalendar, parseWorkoutCalendarMonth } from './calendar'

describe('parseWorkoutCalendarMonth', () => {
  it('parses a valid yyyy-MM query as the visible month', () => {
    expect(dateParts(parseWorkoutCalendarMonth('2026-07', new Date(2026, 0, 15)))).toEqual({
      year: 2026,
      month: 6,
      date: 1,
    })
  })

  it('falls back to the current month when the query is invalid', () => {
    expect(dateParts(parseWorkoutCalendarMonth('invalid', new Date(2026, 0, 15)))).toEqual({
      year: 2026,
      month: 0,
      date: 1,
    })
  })

  it('falls back to the current month when the query is missing', () => {
    expect(dateParts(parseWorkoutCalendarMonth(undefined, new Date(2026, 0, 15)))).toEqual({
      year: 2026,
      month: 0,
      date: 1,
    })
  })
})

describe('buildWorkoutCalendar', () => {
  it('builds a Monday-start monthly grid with workout summaries', () => {
    const calendar = buildWorkoutCalendar({
      visibleMonth: new Date('2026-07-01T00:00:00.000Z'),
      summaries: [
        { date: '2026-07-04', sessionCount: 2, setCount: 6, volume: 3600 },
        { date: '2026-07-21', sessionCount: 1, setCount: 3, volume: 1200 },
      ],
    })

    expect(calendar.label).toBe('2026年7月')
    expect(calendar.previousMonthHref).toBe('/log?month=2026-06')
    expect(calendar.nextMonthHref).toBe('/log?month=2026-08')
    expect(calendar.weeks).toHaveLength(5)
    expect(calendar.weeks[0]?.map((day) => day.date)).toEqual([
      '2026-06-29',
      '2026-06-30',
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
      '2026-07-04',
      '2026-07-05',
    ])
    expect(calendar.weeks[0]?.[5]).toMatchObject({
      date: '2026-07-04',
      isCurrentMonth: true,
      href: '/log/2026-07-04',
      summary: { sessionCount: 2, setCount: 6, volume: 3600 },
    })
    expect(calendar.weeks[0]?.[0]).toMatchObject({
      date: '2026-06-29',
      isCurrentMonth: false,
    })
    expect(calendar.weeks[0]?.[0]).not.toHaveProperty('summary')
  })
})

function dateParts(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate(),
  }
}
