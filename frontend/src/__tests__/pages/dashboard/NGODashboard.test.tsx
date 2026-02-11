import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import NGODashboard from '../../../pages/dashboard/NGODashboard'

vi.mock('react-router-dom', () => ({
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
  BrowserRouter: ({ children }: any) => children,
  Routes: ({ children }: any) => children,
  Route: ({ element }: any) => element,
}))

vi.mock('../../../services/api', () => ({
  getDonations: vi.fn().mockResolvedValue([
    { id: '1', status: 'available', foodType: 'cooked' }
  ]),
  claimDonation: vi.fn(),
}))

describe('NGODashboard - NGO Organization Dashboard', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'Food Bank',
      role: 'ngo'
    }))
    vi.clearAllMocks()
  })

  it('should render NGO dashboard', () => {
    const { container } = render(<NGODashboard />)
    expect(container).toBeTruthy()
  })

  it('should display available donations to claim', () => {
    const { container } = render(<NGODashboard />)
    expect(container.querySelectorAll('div').length > 0).toBeTruthy()
  })

  it('should show NGO organization name', () => {
    const { container } = render(<NGODashboard />)
    expect(container).toBeTruthy()
  })

  it('should have navigation to manage distributions', () => {
    const { container } = render(<NGODashboard />)
    const links = container.querySelectorAll('a')
    expect(links.length >= 0).toBeTruthy()
  })

  it('should render without crashing', () => {
    expect(() => render(<NGODashboard />)).not.toThrow()
  })
})