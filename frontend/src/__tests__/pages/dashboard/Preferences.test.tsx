/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/no-unused-vars */
import { render, screen, fireEvent } from '@testing-library/react'
import Preferences from '../../../pages/dashboard/Preferences'

describe('Preferences', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('a11y-contrast')
    document.documentElement.classList.remove('a11y-large-text')
    document.documentElement.classList.remove('a11y-keyboard-hints')
  })

  it('renders accessibility settings without a language selector', () => {
    render(<Preferences />)

    expect(screen.getByText('Preferences')).toBeTruthy()
    expect(screen.getByText('High contrast mode')).toBeTruthy()
    expect(screen.getByText('Large text mode')).toBeTruthy()
    expect(screen.queryByDisplayValue('English')).toBeNull()
  })

  it('toggles high contrast class on root element', () => {
    render(<Preferences />)

    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[0])

    expect(document.documentElement.classList.contains('a11y-contrast')).toBe(true)
    expect(localStorage.getItem('a11y-contrast')).toBe('1')
  })

  it('toggles large text class on root element', () => {
    render(<Preferences />)

    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[1])

    expect(document.documentElement.classList.contains('a11y-large-text')).toBe(true)
    expect(localStorage.getItem('a11y-large-text')).toBe('1')
  })

  it('toggles keyboard hints class and persists setting', () => {
    render(<Preferences />)

    const switches = screen.getAllByRole('switch')
    // keyboard hints is on by default (localStorage !== '0'), toggle it off
    fireEvent.click(switches[2])

    expect(document.documentElement.classList.contains('a11y-keyboard-hints')).toBe(false)
    expect(localStorage.getItem('a11y-keyboard-hints')).toBe('0')
  })
})
