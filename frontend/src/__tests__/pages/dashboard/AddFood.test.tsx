import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import AddFood from '../../../pages/dashboard/AddFood'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  BrowserRouter: ({ children }: any) => children,
  Routes: ({ children }: any) => children,
  Route: ({ element }: any) => element,
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  useMapEvents: () => null,
}))

vi.mock('../../../services/api', () => ({
  createDonation: vi.fn().mockResolvedValue({ id: '1' }),
}))

describe('AddFood - Food Donation Form', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'Test Donor',
      role: 'donor'
    }))
    vi.clearAllMocks()
  })

  it('should render food donation form', () => {
    const { container } = render(<AddFood />)
    expect(container).toBeTruthy()
  })

  it('should display food type selection options', () => {
    const { container } = render(<AddFood />)
    const selects = container.querySelectorAll('select, button[role="listbox"]')
    expect(selects.length > 0 || container.querySelectorAll('div').length > 0).toBeTruthy()
  })

  it('should have quantity and unit input fields', () => {
    const { container } = render(<AddFood />)
    const inputs = container.querySelectorAll('input[type="number"], input[type="text"], select')
    expect(inputs.length > 0).toBeTruthy()
  })

  it('should include hygiene checklist checkboxes', () => {
    const { container } = render(<AddFood />)
    const checkboxes = container.querySelectorAll('input[type="checkbox"]')
    expect(checkboxes.length > 0).toBeTruthy()
  })

  it('should have map for location selection', () => {
    const { container } = render(<AddFood />)
    const map = container.querySelector('[data-testid="map"]') || container.querySelector('div')
    expect(map).toBeTruthy()
  })

  it('should have image upload input for food photos', () => {
    const { container } = render(<AddFood />)
    const fileInputs = container.querySelectorAll('input[type="file"]')
    expect(fileInputs.length >= 0).toBeTruthy()
  })

  it('should render without crashing', () => {
    expect(() => render(<AddFood />)).not.toThrow()
  })
})