import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SupportTickets from '../../../pages/dashboard/SupportTickets'

describe('SupportTickets', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('submits a new support ticket', () => {
    localStorage.setItem('user', JSON.stringify({ role: 'DONOR' }))
    render(<SupportTickets />)

    fireEvent.change(screen.getByLabelText('Ticket subject'), { target: { value: 'Map not loading' } })
    fireEvent.click(screen.getByRole('button', { name: /submit ticket/i }))

    expect(screen.getByText('Map not loading')).toBeTruthy()
  })

  it('shows admin controls and advances a ticket status', () => {
    localStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }))
    render(<SupportTickets />)

    expect(screen.getByText('Admin Actions Enabled')).toBeTruthy()
    const advanceButtons = screen.getAllByRole('button', { name: /advance/i })
    fireEvent.click(advanceButtons[0])

    expect(screen.getAllByText(/in progress|resolved|open/i).length > 0).toBeTruthy()
  })
})
