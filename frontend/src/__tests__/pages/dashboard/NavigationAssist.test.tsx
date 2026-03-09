import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import NavigationAssist from '../../../pages/dashboard/NavigationAssist'

describe('NavigationAssist', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders route cards with external map links', () => {
    render(<NavigationAssist />)

    expect(screen.getByText('Google Maps Navigation')).toBeTruthy()
    const routeLinks = screen.getAllByRole('link', { name: /open route/i })
    expect(routeLinks.length).toBe(2)
    expect(routeLinks[0].getAttribute('href')).toContain('google.com/maps/dir')
  })
})
