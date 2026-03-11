import { useEffect, useState, type ReactNode } from 'react'
import { Accessibility, Contrast, Type, Keyboard } from 'lucide-react'

export default function Preferences() {
  const [highContrast, setHighContrast] = useState(localStorage.getItem('a11y-contrast') === '1')
  const [largeText, setLargeText] = useState(localStorage.getItem('a11y-large-text') === '1')
  const [keyboardHints, setKeyboardHints] = useState(localStorage.getItem('a11y-keyboard-hints') !== '0')

  useEffect(() => {
    document.documentElement.classList.toggle('a11y-contrast', highContrast)
    localStorage.setItem('a11y-contrast', highContrast ? '1' : '0')
  }, [highContrast])

  useEffect(() => {
    document.documentElement.classList.toggle('a11y-large-text', largeText)
    localStorage.setItem('a11y-large-text', largeText ? '1' : '0')
  }, [largeText])

  useEffect(() => {
    document.documentElement.classList.toggle('a11y-keyboard-hints', keyboardHints)
    localStorage.setItem('a11y-keyboard-hints', keyboardHints ? '1' : '0')
  }, [keyboardHints])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Preferences</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Configure keyboard navigation and readability settings.</p>
      </div>

      <div className="card p-5 space-y-5">
        <ToggleRow
          icon={<Contrast className="w-4 h-4 text-amber-400" />}
          label="High contrast mode"
          desc="Increases border and text contrast for better visibility."
          enabled={highContrast}
          onToggle={() => setHighContrast((prev) => !prev)}
        />

        <div className="divider" />

        <ToggleRow
          icon={<Type className="w-4 h-4 text-blue-400" />}
          label="Large text mode"
          desc="Increases font size across the entire dashboard."
          enabled={largeText}
          onToggle={() => setLargeText((prev) => !prev)}
        />

        <div className="divider" />

        <ToggleRow
          icon={<Keyboard className="w-4 h-4 text-purple-400" />}
          label="Show keyboard hints"
          desc="Highlights focused elements and shows keyboard navigation indicators."
          enabled={keyboardHints}
          onToggle={() => setKeyboardHints((prev) => !prev)}
        />
      </div>

      {keyboardHints && (
        <div className="card p-4 text-sm text-gray-700 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <Accessibility className="w-4 h-4" />
            Keyboard Navigation
          </div>
          <ul className="space-y-1 text-gray-600 dark:text-slate-400 ml-6 list-disc">
            <li><kbd className="bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded text-xs">Tab</kbd> — move focus forward</li>
            <li><kbd className="bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded text-xs">Shift+Tab</kbd> — move focus backward</li>
            <li><kbd className="bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded text-xs">Enter</kbd> / <kbd className="bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded text-xs">Space</kbd> — activate buttons &amp; toggles</li>
            <li><kbd className="bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded text-xs">Esc</kbd> — close modals &amp; dropdowns</li>
          </ul>
        </div>
      )}
    </div>
  )
}

type ToggleRowProps = {
  icon: ReactNode
  label: string
  desc?: string
  enabled: boolean
  onToggle: () => void
}

function ToggleRow({ icon, label, desc, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-gray-900 dark:text-slate-200 flex items-center gap-2">
          {icon}
          {label}
        </p>
        {desc && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 ml-6">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`w-12 h-6 rounded-full p-1 transition ${enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'}`}
      >
        <span className={`block w-4 h-4 rounded-full bg-white transition ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}
