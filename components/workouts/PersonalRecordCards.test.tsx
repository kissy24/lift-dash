import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PersonalRecordCards } from './PersonalRecordCards'

describe('PersonalRecordCards', () => {
  it('renders personal record details with links to the recorded dates', () => {
    render(
      <PersonalRecordCards
        records={[
          {
            exerciseId: 'bench',
            exerciseName: 'ベンチプレス',
            weight: 85,
            reps: 6,
            date: '2026-07-03',
          },
        ]}
      />
    )

    expect(screen.getByRole('heading', { name: '自己ベスト' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'ベンチプレス' })).toBeInTheDocument()
    expect(screen.getByText('85 kg')).toBeInTheDocument()
    expect(screen.getByText('6 reps')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '2026-07-03の記録を見る' })).toHaveAttribute(
      'href',
      '/log/2026-07-03'
    )
  })

  it('renders an empty state when there are no records', () => {
    render(<PersonalRecordCards records={[]} />)

    expect(screen.getByText('自己ベストを表示できる記録がまだありません')).toBeInTheDocument()
  })
})
