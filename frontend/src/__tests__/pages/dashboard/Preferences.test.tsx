import { render, screen, fireEvent } from '@testing-library/react'
import Preferences from '../../../pages/dashboard/Preferences'

describe('Preferences', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('a11y-contrast')
    document.documentElement.classList.remove('a11y-large-text')
  })

  it('renders language and accessibility settings', () => {
    render(<Preferences />)

    expect(screen.getByText('Language & Accessibility')).toBeTruthy()
    expect(screen.getByText('High contrast mode')).toBeTruthy()
    expect(screen.getByText('Large text mode')).toBeTruthy()
  })

  it('toggles high contrast class on root element', () => {
    render(<Preferences />)

    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[0])

    expect(document.documentElement.classList.contains('a11y-contrast')).toBe(true)
  })

  it('changes language and updates persisted setting', () => {
    render(<Preferences />)

    fireEvent.change(screen.getByDisplayValue('English'), { target: { value: 'hi' } })

    expect(localStorage.getItem('ui-lang')).toBe('hi')
    expect(screen.getByText('Bhasha aur Accessibility')).toBeTruthy()
  })
})
