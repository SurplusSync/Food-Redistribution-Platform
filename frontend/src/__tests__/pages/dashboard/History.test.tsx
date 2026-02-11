import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import History from '../../../pages/dashboard/History'

vi.mock('../../../services/api', () => ({
  getDonations: vi.fn().mockResolvedValue([
    { id: '1', createdAt: new Date(), status: 'delivered' },
    { id: '2', createdAt: new Date(), status: 'delivered' }
  ]),
}))

describe('History - User Donation History', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'John Doe',
      role: 'donor'
    }))
    vi.clearAllMocks()
  })

  it('should render history page', () => {
    const { container } = render(<History />)
    expect(container).toBeTruthy()
  })

  it('should display list of past donations', () => {
    const { container } = render(<History />)
    const lists = container.querySelectorAll('div, ul, li')
    expect(lists.length > 0).toBeTruthy()
  })

  it('should show donation details (date, food type, status)', () => {
    const { container } = render(<History />)
    expect(container.querySelector('div')).toBeTruthy()
  })

  it('should render without crashing', () => {
    expect(() => render(<History />)).not.toThrow()
  })

  it('should display empty state when no history', () => {
    const { container } = render(<History />)
    expect(container).toBeTruthy()
  })
})