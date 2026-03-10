/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/no-unused-vars */
import { render, screen, waitFor } from '@testing-library/react'
import Leaderboards from '../../../pages/dashboard/Leaderboards'
import { getLeaderboard } from '../../../services/api'

describe('Leaderboards', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({ name: 'Keshav' }))
    vi.clearAllMocks()
    vi.mocked(getLeaderboard).mockResolvedValue([
      { id: '1', name: 'Anita Verma', role: 'DONOR', karmaPoints: 350 },
      { id: '2', name: 'Sonia Mehta', role: 'NGO', karmaPoints: 280 },
    ] as any)
  })

  it('renders leaderboard title and current profile', async () => {
    render(<Leaderboards />)

    expect(screen.getByText('leaderboardsTitle')).toBeTruthy()
    await waitFor(() => {
      expect(screen.getByText(/currentProfileLabel/i)).toBeTruthy()
    })
  })

  it('displays leaderboard entries from API', async () => {
    render(<Leaderboards />)

    await waitFor(() => {
      expect(screen.getByText('Anita Verma')).toBeTruthy()
      expect(screen.getByText('Sonia Mehta')).toBeTruthy()
    })
  })

  it('shows empty state when no entries match filter', async () => {
    vi.mocked(getLeaderboard).mockResolvedValue([])

    render(<Leaderboards />)

    await waitFor(() => {
      expect(screen.getByText('noLeaderboardEntries')).toBeTruthy()
    })
  })
})
