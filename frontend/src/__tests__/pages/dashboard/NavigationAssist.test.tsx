import { render, screen, waitFor } from '@testing-library/react'
import NavigationAssist from '../../../pages/dashboard/NavigationAssist'
import { getDonations } from '../../../services/api'

describe('NavigationAssist', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders title and shows empty state when no active routes', async () => {
    vi.mocked(getDonations).mockResolvedValue([])

    render(<NavigationAssist />)

    expect(screen.getByText('Google Maps Navigation')).toBeTruthy()

    await waitFor(() => {
      expect(screen.getByText('No active pickups or deliveries')).toBeTruthy()
    })
  })

  it('renders navigate links for active donations', async () => {
    vi.mocked(getDonations).mockResolvedValue([
      {
        id: '1',
        name: 'Rice Donation',
        foodType: 'packaged',
        status: 'CLAIMED',
        quantity: 10,
        unit: 'kg',
        donorName: 'John',
        location: { address: '123 Main St', lat: 28.61, lng: 77.23 },
        expiryTime: new Date(Date.now() + 3600000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ] as any)

    render(<NavigationAssist />)

    await waitFor(() => {
      expect(screen.getByText('Rice Donation')).toBeTruthy()
    })
  })
})
