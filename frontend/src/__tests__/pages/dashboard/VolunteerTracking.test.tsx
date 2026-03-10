/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/no-unused-vars */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VolunteerTracking from '../../../pages/dashboard/VolunteerTracking'
import { getMyDeliveries } from '../../../services/api'

describe('VolunteerTracking', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({ id: 'v1', name: 'Test Volunteer', role: 'VOLUNTEER' }))
    vi.clearAllMocks()
    vi.mocked(getMyDeliveries).mockResolvedValue([])
  })

  it('renders tracking page with title and sections', async () => {
    render(<VolunteerTracking />)

    expect(screen.getByText('Volunteer Location Tracking')).toBeTruthy()
    expect(screen.getByText('Live Location')).toBeTruthy()

    await waitFor(() => {
      expect(screen.getByText('Active Deliveries')).toBeTruthy()
    })
  })

  it('shows empty delivery state', async () => {
    render(<VolunteerTracking />)

    await waitFor(() => {
      expect(screen.getByText('No active deliveries right now.')).toBeTruthy()
    })
  })

  it('toggles location sharing state', async () => {
    render(<VolunteerTracking />)

    // Initial state: not sharing (Paused)
    expect(screen.getByText('Paused')).toBeTruthy()
    const startButton = screen.getByRole('button', { name: /start sharing/i })
    fireEvent.click(startButton)

    expect(screen.getByText('Live')).toBeTruthy()
    expect(screen.getByRole('button', { name: /stop sharing/i })).toBeTruthy()
  })
})
