import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { WorkoutCalendar } from './WorkoutCalendar'

const CALENDAR = {
  label: '2026年7月',
  previousMonthHref: '/log?month=2026-06',
  nextMonthHref: '/log?month=2026-08',
  weeks: [
    [
      { date: '2026-06-29', dayOfMonth: '29', isCurrentMonth: false },
      { date: '2026-06-30', dayOfMonth: '30', isCurrentMonth: false },
      { date: '2026-07-01', dayOfMonth: '1', isCurrentMonth: true },
      { date: '2026-07-02', dayOfMonth: '2', isCurrentMonth: true },
      { date: '2026-07-03', dayOfMonth: '3', isCurrentMonth: true },
      {
        date: '2026-07-04',
        dayOfMonth: '4',
        isCurrentMonth: true,
        href: '/log/2026-07-04',
        summary: { date: '2026-07-04', sessionCount: 2, setCount: 6, volume: 3600 },
      },
      { date: '2026-07-05', dayOfMonth: '5', isCurrentMonth: true },
    ],
  ],
}

describe('WorkoutCalendar', () => {
  it('renders month navigation and workout day links', () => {
    render(<WorkoutCalendar calendar={CALENDAR} />)

    expect(screen.getByRole('heading', { name: '2026年7月' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '前月' })).toHaveAttribute('href', '/log?month=2026-06')
    expect(screen.getByRole('link', { name: '翌月' })).toHaveAttribute('href', '/log?month=2026-08')

    const workoutDay = screen.getByRole('link', { name: /2026-07-04/ })
    expect(workoutDay).toHaveAttribute('href', '/log/2026-07-04')
    expect(workoutDay).toHaveTextContent('2セッション')
    expect(workoutDay).toHaveTextContent('6セット')
  })

  it('renders empty days without detail links', () => {
    render(<WorkoutCalendar calendar={CALENDAR} />)

    const emptyDay = screen.getByLabelText('2026-07-03')
    expect(within(emptyDay).queryByRole('link')).not.toBeInTheDocument()
  })
})
