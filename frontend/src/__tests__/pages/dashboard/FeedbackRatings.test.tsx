/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/no-unused-vars */
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
      expect(screen.getByText('ngoFeedbackRatings')).toBeTruthy()
    })
    expect(screen.getByText('ratingSummary')).toBeTruthy()
  })

  it('shows empty state when no feedback exists', async () => {
    render(<FeedbackRatings />)

    await waitFor(() => {
      expect(screen.getByText('noFeedbackYet')).toBeTruthy()
    })
  })
})
