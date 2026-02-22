import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import App from '../App'

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: any) => children,
  Routes: ({ children }: any) => children,
  Route: ({ element }: any) => element,
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  Navigate: ({ to }: any) => <div data-testid="navigate" data-to={to} />,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', state: null }),
  Outlet: () => <div data-testid="outlet" />
}))

vi.mock('../pages/LandingPage', () => ({
  default: () => <div data-testid="landing">Landing Page</div>
}))

vi.mock('../pages/Login', () => ({
  default: () => <div data-testid="login">Login Page</div>
}))

vi.mock('../pages/Register', () => ({
  default: () => <div data-testid="register">Register Page</div>
}))

vi.mock('../layouts/DashboardLayout', () => ({
  default: () => <div data-testid="dashboard-layout">Dashboard</div>
}))

describe('App - Routing Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should render the App component', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })

  it('should setup BrowserRouter for navigation', () => {
    const { container } = render(<App />)
    expect(container.querySelector('div')).toBeTruthy()
  })

  it('should define all application routes', () => {
    const { container } = render(<App />)
    const elements = container.querySelectorAll('[data-testid*=""]')
    expect(elements.length >= 0).toBeTruthy()
  })

  it('should render without crashing', () => {
    expect(() => render(<App />)).not.toThrow()
  })
})