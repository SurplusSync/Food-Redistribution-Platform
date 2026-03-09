import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Leaderboards from '../../../pages/dashboard/Leaderboards'

describe('Leaderboards', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({ name: 'Keshav' }))
  })

  it('renders weekly leaderboard by default', () => {
    render(<Leaderboards />)

    expect(screen.getByText('Leaderboards')).toBeTruthy()
    expect(screen.getByText('Anita Verma')).toBeTruthy()
    expect(screen.getByText(/Current profile: Keshav/i)).toBeTruthy()
  })

  it('switches to monthly leaderboard tab', () => {
    render(<Leaderboards />)

    fireEvent.click(screen.getByRole('button', { name: /monthly/i }))
    expect(screen.getByText('Sonia Mehta')).toBeTruthy()
  })

  it('applies filters and can show empty state', () => {
    render(<Leaderboards />)

    fireEvent.change(screen.getByDisplayValue('All cities'), { target: { value: 'faridabad' } })
    expect(screen.getByText('No leaderboard entries for selected filters.')).toBeTruthy()
  })
})
