import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NearExpiryAlerts from '../../../pages/dashboard/NearExpiryAlerts'

describe('NearExpiryAlerts', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders near-expiry alerts', () => {
    render(<NearExpiryAlerts />)

    expect(screen.getByText('Near-Expiry Alerts')).toBeTruthy()
    expect(screen.getByText('Cooked Rice Meal')).toBeTruthy()
  })

  it('filters critical alerts and handles item removal', () => {
    render(<NearExpiryAlerts />)

    fireEvent.click(screen.getByRole('button', { name: /critical/i }))
    expect(screen.getByText('Bread Packets')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /mark handled/i }))
    expect(screen.queryByText('Bread Packets')).toBeNull()
  })
})
