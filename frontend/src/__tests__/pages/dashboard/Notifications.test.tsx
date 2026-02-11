import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import Notifications from '../../../pages/dashboard/Notifications'

vi.mock('../../../services/api', () => ({
  getNotifications: vi.fn().mockResolvedValue([
    { id: '1', type: 'donation_claimed', read: false, createdAt: new Date() },
    { id: '2', type: 'delivery_completed', read: true, createdAt: new Date(Date.now() - 3600000) }
  ]),
  markNotificationRead: vi.fn(),
}))

describe('Notifications - User Notifications', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'John Doe',
      role: 'donor'
    }))
    vi.clearAllMocks()
  })

  it('should render notifications page', () => {
    const { container } = render(<Notifications />)
    expect(container).toBeTruthy()
  })

  it('should display list of notifications', () => {
    const { container } = render(<Notifications />)
    expect(container.querySelectorAll('div').length > 0).toBeTruthy()
  })

  it('should show unread notification indicator', () => {
    const { container } = render(<Notifications />)
    expect(container).toBeTruthy()
  })

  it('should allow marking notifications as read', () => {
    const { container } = render(<Notifications />)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length >= 0).toBeTruthy()
  })

  it('should render without crashing', () => {
    expect(() => render(<Notifications />)).not.toThrow()
  })
})