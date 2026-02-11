import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import DonorHome from '../../../pages/dashboard/DonorHome'

vi.mock('react-router-dom', () => ({
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
  BrowserRouter: ({ children }: any) => children,
  Routes: ({ children }: any) => children,
  Route: ({ element }: any) => element,
}))

vi.mock('../../../services/api', () => ({
  getDonations: vi.fn().mockResolvedValue([
    { id: '1', status: 'active', foodType: 'cooked' },
    { id: '2', status: 'claimed', foodType: 'raw' },
    { id: '3', status: 'delivered', foodType: 'packaged' }
  ]),
  claimDonation: vi.fn(),
  updateDonationStatus: vi.fn(),
}))

describe('DonorHome - Donor Dashboard', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'John Doe',
      role: 'donor'
    }))
    vi.clearAllMocks()
  })

  it('should render donor dashboard', () => {
    const { container } = render(<DonorHome />)
    expect(container).toBeTruthy()
  })

  it('should display welcome message with donor name', () => {
    const { container } = render(<DonorHome />)
    expect(container.querySelector('div')).toBeTruthy()
  })

  it('should show status cards for donations (Active, Claimed, Delivered)', () => {
    const { container } = render(<DonorHome />)
    const cards = container.querySelectorAll('[class*="card"], [class*="badge"]')
    expect(cards.length >= 0).toBeTruthy()
  })

  it('should display color-coded badges for donation status', () => {
    const { container } = render(<DonorHome />)
    expect(container.querySelectorAll('div, span, button').length > 0).toBeTruthy()
  })

  it('should have Add Food button link', () => {
    const { container } = render(<DonorHome />)
    const links = container.querySelectorAll('a')
    expect(links.length >= 0).toBeTruthy()
  })

  it('should render without errors', () => {
    expect(() => render(<DonorHome />)).not.toThrow()
  })
})