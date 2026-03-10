import { render, screen, waitFor } from '@testing-library/react'
import FeedbackRatings from '../../../pages/dashboard/FeedbackRatings'
import { getDonations, getFeedbackForDonation } from '../../../services/api'

describe('FeedbackRatings', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Keshav', role: 'DONOR' }))
    vi.clearAllMocks()
    vi.mocked(getDonations).mockResolvedValue([])
    vi.mocked(getFeedbackForDonation).mockResolvedValue([])
  })

  it('renders page title and rating summary', async () => {
    render(<FeedbackRatings />)

    await waitFor(() => {
      expect(screen.getByText('NGO Feedback & Ratings')).toBeTruthy()
    })
    expect(screen.getByText('Rating Summary')).toBeTruthy()
  })

  it('shows empty state when no feedback exists', async () => {
    render(<FeedbackRatings />)

    await waitFor(() => {
      expect(screen.getByText('No feedback submitted yet.')).toBeTruthy()
    })
  })
})
