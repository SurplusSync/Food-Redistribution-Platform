/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/no-unused-vars */
import { render, screen, waitFor } from '@testing-library/react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { getNotifications, getUserProfile } from '../../services/api'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/dashboard' }),
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  Outlet: () => <div data-testid="outlet" />,
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
    vi.mocked(getNotifications).mockResolvedValue([])
    vi.mocked(getUserProfile).mockResolvedValue({} as any)
  })

  it('should render dashboard layout container', () => {
    const { container } = render(<DashboardLayout />)
    expect(container).toBeTruthy()
  })

  it('should display sidebar with navigation links', () => {
    render(<DashboardLayout />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('should have outlet for nested dashboard routes', async () => {
    const { container } = render(<DashboardLayout />)
    // Outlet renders after profile is ready
    await waitFor(() => {
      expect(container.querySelector('[data-testid="outlet"]')).toBeTruthy()
    })
  })

  it('should render user name in sidebar', () => {
    render(<DashboardLayout />)
    expect(screen.getByText('Test User')).toBeTruthy()
  })

  it('should render without errors', () => {
    expect(() => render(<DashboardLayout />)).not.toThrow()
  })
})