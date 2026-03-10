import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SupportTickets from '../../../pages/dashboard/SupportTickets'
import { supportAPI, adminAPI } from '../../../services/api'

describe('SupportTickets', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(supportAPI.getMyTickets).mockResolvedValue({ data: [] } as any)
    vi.mocked(adminAPI.getAllTickets).mockResolvedValue({ data: [] } as any)
  })

  it('renders Support Tickets page with form', async () => {
    localStorage.setItem('user', JSON.stringify({ role: 'DONOR' }))
    render(<SupportTickets />)

    expect(screen.getByText('Support Tickets')).toBeTruthy()
    expect(screen.getByLabelText('Ticket subject')).toBeTruthy()
  })

  it('submits a new support ticket', async () => {
    localStorage.setItem('user', JSON.stringify({ role: 'DONOR' }))
    vi.mocked(supportAPI.createTicket).mockResolvedValue({ data: {} } as any)

    render(<SupportTickets />)

    fireEvent.change(screen.getByLabelText('Ticket subject'), { target: { value: 'Map not loading' } })
    fireEvent.change(screen.getByLabelText('Ticket description'), { target: { value: 'Map fails to render' } })
    fireEvent.click(screen.getByRole('button', { name: /submit ticket/i }))

    await waitFor(() => {
      expect(supportAPI.createTicket).toHaveBeenCalled()
    })
  })

  it('shows admin badge for ADMIN role', async () => {
    localStorage.setItem('user', JSON.stringify({ role: 'ADMIN' }))
    const mockTickets = [
      { id: '1', subject: 'Bug report', description: 'Details', priority: 'MEDIUM', status: 'OPEN', createdAt: new Date().toISOString() },
    ]
    vi.mocked(adminAPI.getAllTickets).mockResolvedValue({ data: mockTickets } as any)

    render(<SupportTickets />)

    await waitFor(() => {
      expect(screen.getByText('Admin Actions Enabled')).toBeTruthy()
    })
  })
})
