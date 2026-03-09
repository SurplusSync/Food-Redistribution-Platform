import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import VolunteerTracking from '../../../pages/dashboard/VolunteerTracking'

describe('VolunteerTracking', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders tracking page with timeline cards', () => {
    render(<VolunteerTracking />)

    expect(screen.getByText('Volunteer Location Tracking')).toBeTruthy()
    expect(screen.getByText('Delivery Timeline')).toBeTruthy()
    expect(screen.getByText('TR-101')).toBeTruthy()
    expect(screen.getByText('TR-102')).toBeTruthy()
  })

  it('toggles location sharing state', () => {
    render(<VolunteerTracking />)

    expect(screen.getByText('Live')).toBeTruthy()
    const toggleButton = screen.getByRole('button', { name: /stop sharing/i })
    fireEvent.click(toggleButton)

    expect(screen.getByText('Paused')).toBeTruthy()
    expect(screen.getByRole('button', { name: /start sharing/i })).toBeTruthy()
  })
})
