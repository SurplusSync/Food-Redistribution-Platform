import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FeedbackRatings from '../../../pages/dashboard/FeedbackRatings'

describe('FeedbackRatings', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({ name: 'Keshav' }))
  })

  it('renders ratings summary', () => {
    render(<FeedbackRatings />)

    expect(screen.getByText('NGO Feedback & Ratings')).toBeTruthy()
    expect(screen.getByText(/Rating Summary/i)).toBeTruthy()
  })

  it('submits a new review and displays it', () => {
    render(<FeedbackRatings />)

    fireEvent.change(screen.getByPlaceholderText('Share your delivery experience'), {
      target: { value: 'Great coordination and quick pickup.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /submit feedback/i }))

    expect(screen.getByText('Great coordination and quick pickup.')).toBeTruthy()
    expect(screen.getByText(/By Keshav/i)).toBeTruthy()
  })
})
