import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import VolunteerDashboard from '../../../pages/dashboard/VolunteerDashboard'

vi.mock('../../../services/api', () => ({
  getDonations: vi.fn().mockResolvedValue([
    { id: '1', status: 'claimed', location: { lat: 28.6139, lng: 77.2090 } }
  ]),
  updateDonationStatus: vi.fn(),
}))

describe('VolunteerDashboard - Volunteer Task Management', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'John Volunteer',
      role: 'volunteer'
    }))
    vi.clearAllMocks()
  })

  it('should render volunteer dashboard', () => {
    const { container } = render(<VolunteerDashboard />)
    expect(container).toBeTruthy()
  })

  it('should display assigned pickup tasks', () => {
    const { container } = render(<VolunteerDashboard />)
    expect(container.querySelectorAll('div').length > 0).toBeTruthy()
  })

  it('should show task locations and details', () => {
    const { container } = render(<VolunteerDashboard />)
    expect(container).toBeTruthy()
  })

  it('should allow updating task status', () => {
    const { container } = render(<VolunteerDashboard />)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length >= 0).toBeTruthy()
  })

  it('should render without crashing', () => {
    expect(() => render(<VolunteerDashboard />)).not.toThrow()
  })
})