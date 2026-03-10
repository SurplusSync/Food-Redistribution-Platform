/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/no-unused-vars */
import { render, screen, waitFor } from '@testing-library/react'
import Impact from '../../../pages/dashboard/Impact'
import { getUserProfile, getCommunityStats, getMonthlyStats } from '../../../services/api'

describe('Impact - User Impact Statistics', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      name: 'John Doe',
      role: 'donor'
    }))
    vi.clearAllMocks()

    vi.mocked(getUserProfile).mockResolvedValue({
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
    } as any)

    vi.mocked(getCommunityStats).mockResolvedValue({
      totalDonations: 500,
      deliveredDonations: 420,
      activeDonations: 80,
      mealsProvided: 12500,
      kgRescued: 3300,
      co2Saved: 8200,
      totalDonors: 120,
      totalNGOs: 18,
      totalVolunteers: 45,
    } as any)

    vi.mocked(getMonthlyStats).mockResolvedValue([
      { label: 'Jan', total: 40, delivered: 35, claimed: 37, meals: 800 },
      { label: 'Feb', total: 45, delivered: 39, claimed: 41, meals: 900 },
    ] as any)
  })

  it('should render impact page with title', async () => {
    render(<Impact />)
    // i18n mock returns the key itself: t('yourImpact') => 'yourImpact'
    expect(await screen.findByText('yourImpact')).toBeTruthy()
  })

  it('should display impact statistics', async () => {
    render(<Impact />)
    // Main page stat labels for donor role - may appear multiple times on page
    await waitFor(() => {
      expect(screen.getAllByText('totalDonations').length).toBeGreaterThan(0)
    })
    expect(screen.getAllByText('mealsProvided').length).toBeGreaterThan(0)
    expect(screen.getAllByText('foodSaved').length).toBeGreaterThan(0)
  })

  it('should show karma achievements section', async () => {
    render(<Impact />)
    expect(await screen.findByText('karmaAchievements')).toBeTruthy()
  })

  it('should render without crashing', async () => {
    render(<Impact />)
    expect(await screen.findByText('yourImpact')).toBeTruthy()
  })

  it('should display community impact metrics', async () => {
    render(<Impact />)
    // communityImpact heading uses i18n key
    expect(await screen.findByText('communityImpact')).toBeTruthy()
    expect(screen.getByText('activeDonors')).toBeTruthy()
    expect(screen.getByText('partnerNGOs')).toBeTruthy()
  })
})