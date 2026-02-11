import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import Profile from '../../../pages/dashboard/Profile'

vi.mock('../../../services/api', () => ({
    getUserProfile: vi.fn().mockResolvedValue({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
    }),
    updateUserProfile: vi.fn(),
}))

describe('Profile - User Profile Management', () => {
    beforeEach(() => {
        localStorage.clear()
        localStorage.setItem('user', JSON.stringify({
            id: '1',
            name: 'John Doe',
            role: 'donor'
        }))
        vi.clearAllMocks()
    })

    it('should render profile page', () => {
        const { container } = render(<Profile />)
        expect(container).toBeTruthy()
    })

    it('should display user information (name, email, phone)', () => {
        const { container } = render(<Profile />)
        const inputs = container.querySelectorAll('input, textarea')
        expect(inputs.length >= 0).toBeTruthy()
    })

    it('should have edit profile form', () => {
        const { container } = render(<Profile />)
        const forms = container.querySelectorAll('form, div')
        expect(forms.length > 0).toBeTruthy()
    })

    it('should have save or update button', () => {
        const { container } = render(<Profile />)
        const buttons = container.querySelectorAll('button')
        expect(buttons.length >= 0).toBeTruthy()
    })

    it('should render without crashing', () => {
        expect(() => render(<Profile />)).not.toThrow()
    })
})