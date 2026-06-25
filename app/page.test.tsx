import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import HomePage from './page'

describe('HomePage', () => {
  it('renders the product name and tagline', () => {
    render(<HomePage />)

    expect(screen.getByText('LiftDash')).toBeInTheDocument()
    expect(screen.getByText('Track your sets, visualize your gains.')).toBeInTheDocument()
  })
})
