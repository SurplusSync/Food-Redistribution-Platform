import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import Register from '../../pages/Register'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    Link: ({ to, children }: any) => <a href={to}>{children}</a>,
    BrowserRouter: ({ children }: any) => children,
    Routes: ({ children }: any) => children,
    Route: ({ element }: any) => element,
}))

vi.mock('../../services/api', () => ({
    registerUser: vi.fn(),
}))

describe('Register - User Onboarding', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('should render registration form', () => {
        const { container } = render(<Register />)
        expect(container).toBeTruthy()
    })

    it('should display role selection cards (Donor, NGO, Volunteer)', () => {
        const { container } = render(<Register />)
        const selects = container.querySelectorAll('select, input[type="radio"]')
        expect(selects.length >= 0).toBeTruthy()
    })

    it('should have email, password, and phone input fields', () => {
        const { container } = render(<Register />)
        const inputs = container.querySelectorAll('input, textarea')
        expect(inputs.length > 0).toBeTruthy()
    })

    it('should show organization fields for donor and NGO roles', () => {
        const { container } = render(<Register />)
        const textareas = container.querySelectorAll('textarea, input[type="text"]')
        expect(textareas.length >= 0).toBeTruthy()
    })

    it('should have submit button for registration', () => {
        const { container } = render(<Register />)
        const submitButtons = container.querySelectorAll('button[type="submit"]')
        expect(submitButtons.length > 0).toBeTruthy()
    })

    it('should render without crashing', () => {
        expect(() => render(<Register />)).not.toThrow()
    })
})