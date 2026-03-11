import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'

// Restore accessibility preferences on every page load
const html = document.documentElement
if (localStorage.getItem('a11y-contrast') === '1') html.classList.add('a11y-contrast')
if (localStorage.getItem('a11y-large-text') === '1') html.classList.add('a11y-large-text')
if (localStorage.getItem('a11y-keyboard-hints') !== '0') html.classList.add('a11y-keyboard-hints')


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
