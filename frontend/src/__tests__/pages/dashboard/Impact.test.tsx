import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Impact from '../../../pages/dashboard/Impact'

vi.mock('../../../services/api', () => ({
  getUserProfile: vi.fn().mockResolvedValue({
    id: '1',
    name: 'John Doe',
    role: 'DONOR',
    trustScore: 4.8,
    karmaPoints: 120,
    level: 3,
    donationCount: 10,
    mealsServed: 250,
    co2Saved: 150,
    impactStats: {
      totalDonations: 10,
      mealsProvided: 250,
      kgSaved: 60,
    },
  }),
  getCommunityStats: vi.fn().mockResolvedValue({
    totalDonations: 500,
    deliveredDonations: 420,
    activeDonations: 80,
    mealsProvided: 12500,
    kgRescued: 3300,
    co2Saved: 8200,
    totalDonors: 120,
    totalNGOs: 18,
    totalVolunteers: 45,
  }),
  getMonthlyStats: vi.fn().mockResolvedValue([
    { label: 'Jan', total: 40, delivered: 35, claimed: 37, meals: 800 },
    { label: 'Feb', total: 45, delivered: 39, claimed: 41, meals: 900 },
  ]),
}))

describe('Impact - User Impact Statistics', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'John Doe',
      role: 'donor'
    }))
    vi.clearAllMocks()
  })

  it('should render impact page', async () => {
    render(<Impact />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Your Impact' })).toBeTruthy()
  })

  it('should display impact statistics (meals, CO2 saved, donations)', async () => {
    render(<Impact />)
    expect(await screen.findByText('Total Donations')).toBeTruthy()
    expect(screen.getAllByText('Meals Provided').length).toBeGreaterThan(0)
    expect(screen.getByText('Food Saved')).toBeTruthy()
  })

  it('should show earned badges and achievements', async () => {
    render(<Impact />)
    expect(await screen.findByText(/Karma & Achievements/i)).toBeTruthy()
    expect(screen.getByText('Newcomer')).toBeTruthy()
  })

  it('should render without crashing', async () => {
    render(<Impact />)
    expect(await screen.findByText('Total Donations')).toBeTruthy()
  })

  it('should display social impact metrics', async () => {
    render(<Impact />)
    expect(await screen.findByText(/Community Impact/i)).toBeTruthy()
    expect(screen.getByText('Active Donors')).toBeTruthy()
    expect(screen.getByText('Partner NGOs')).toBeTruthy()
  })
})