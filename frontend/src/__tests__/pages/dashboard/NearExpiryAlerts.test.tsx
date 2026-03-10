import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NearExpiryAlerts from '../../../pages/dashboard/NearExpiryAlerts'
import { getDonations } from '../../../services/api'

describe('NearExpiryAlerts', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders near-expiry alerts with data', async () => {
    vi.mocked(getDonations).mockResolvedValue([
      {
        id: '1',
        name: 'Cooked Rice Meal',
        status: 'AVAILABLE',
        quantity: 5,
        unit: 'kg',
        donorName: 'Alice',
        expiryTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min from now
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Bread Packets',
        status: 'AVAILABLE',
        quantity: 10,
        unit: 'packs',
        donorName: 'Bob',
        expiryTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 90 min from now
        createdAt: new Date().toISOString(),
      },
    ] as any)

    render(<NearExpiryAlerts />)

    await waitFor(() => {
      expect(screen.getByText('Near-Expiry Alerts')).toBeTruthy()
    })

    await waitFor(() => {
      expect(screen.getByText('Cooked Rice Meal')).toBeTruthy()
      expect(screen.getByText('Bread Packets')).toBeTruthy()
    })
  })

  it('filters by critical urgency', async () => {
    vi.mocked(getDonations).mockResolvedValue([
      {
        id: '1',
        name: 'Urgent Food',
        status: 'AVAILABLE',
        quantity: 5,
        unit: 'kg',
        donorName: 'Alice',
        expiryTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // critical: <=60 min
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Less Urgent Food',
        status: 'AVAILABLE',
        quantity: 10,
        unit: 'packs',
        donorName: 'Bob',
        expiryTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // warning: >60 min
        createdAt: new Date().toISOString(),
      },
    ] as any)

    render(<NearExpiryAlerts />)

    await waitFor(() => {
      expect(screen.getByText('Urgent Food')).toBeTruthy()
    })

    fireEvent.click(screen.getByRole('button', { name: /critical/i }))

    expect(screen.getByText('Urgent Food')).toBeTruthy()
    expect(screen.queryByText('Less Urgent Food')).toBeNull()
  })
})
