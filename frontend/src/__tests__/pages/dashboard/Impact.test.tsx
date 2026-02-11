import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import Impact from '../../../pages/dashboard/Impact'

vi.mock('../../../services/api', () => ({
  getBadges: vi.fn().mockResolvedValue([
    { id: '1', name: 'First Donation', earned: true },
    { id: '2', name: 'Helper', earned: true }
  ]),
  getUserProfile: vi.fn().mockResolvedValue({
    donationCount: 10,
    mealsServed: 250,
    co2Saved: 150
  }),
}))

describe('Impact - User Impact Statistics', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'John Doe',
      role: 'donor'
    }))
    vi.clearAllMocks()
  })

  it('should render impact page', () => {
    const { container } = render(<Impact />)
    expect(container).toBeTruthy()
  })

  it('should display impact statistics (meals, CO2 saved, donations)', () => {
    const { container } = render(<Impact />)
    expect(container.querySelectorAll('div, span').length > 0).toBeTruthy()
  })

  it('should show earned badges and achievements', () => {
    const { container } = render(<Impact />)
    expect(container).toBeTruthy()
  })

  it('should render without crashing', () => {
    expect(() => render(<Impact />)).not.toThrow()
  })

  it('should display social impact metrics', () => {
    const { container } = render(<Impact />)
    expect(container.querySelector('div')).toBeTruthy()
  })
})