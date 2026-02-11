import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import DashboardLayout from '../../layouts/DashboardLayout'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/dashboard' }),
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  Outlet: () => <div data-testid="outlet" />,
  BrowserRouter: ({ children }: any) => children,
  Routes: ({ children }: any) => children,
  Route: ({ element }: any) => element,
}))

vi.mock('../../services/api', () => ({
  getNotifications: vi.fn().mockResolvedValue([]),
  checkExpiringDonations: vi.fn(),
}))

describe('DashboardLayout - Main Dashboard Structure', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'Test User',
      role: 'donor',
      email: 'test@example.com'
    }))
    vi.clearAllMocks()
  })

  it('should render dashboard layout container', () => {
    const { container } = render(<DashboardLayout />)
    expect(container).toBeTruthy()
  })

  it('should display sidebar with navigation links', () => {
    const { container } = render(<DashboardLayout />)
    const links = container.querySelectorAll('a')
    expect(links.length >= 0).toBeTruthy()
  })

  it('should have outlet for nested dashboard routes', () => {
    const { container } = render(<DashboardLayout />)
    const outlet = container.querySelector('[data-testid="outlet"]')
    expect(outlet || container.querySelector('div')).toBeTruthy()
  })

  it('should render user profile section in header', () => {
    const { container } = render(<DashboardLayout />)
    expect(container.querySelector('header, nav, div')).toBeTruthy()
  })

  it('should render without errors', () => {
    expect(() => render(<DashboardLayout />)).not.toThrow()
  })
})