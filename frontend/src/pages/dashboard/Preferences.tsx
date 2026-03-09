import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Accessibility, Languages, Contrast, Type, Keyboard } from 'lucide-react'

type Lang = 'en' | 'hi'

const copy = {
  en: {
    title: 'Language & Accessibility',
    subtitle: 'Configure UI language, keyboard navigation, and readability settings.',
    lang: 'Language',
    highContrast: 'High contrast mode',
    largeText: 'Large text mode',
    keyboardHints: 'Show keyboard hints',
  },
  hi: {
    title: 'Bhasha aur Accessibility',
    subtitle: 'UI language, keyboard navigation aur readability settings ko configure karein.',
    lang: 'Bhasha',
    highContrast: 'High contrast mode',
    largeText: 'Large text mode',
    keyboardHints: 'Keyboard hints dikhayein',
  },
}

export default function Preferences() {
  const [lang, setLang] = useState<Lang>((localStorage.getItem('ui-lang') as Lang) || 'en')
  const [highContrast, setHighContrast] = useState(localStorage.getItem('a11y-contrast') === '1')
  const [largeText, setLargeText] = useState(localStorage.getItem('a11y-large-text') === '1')
  const [keyboardHints, setKeyboardHints] = useState(localStorage.getItem('a11y-keyboard-hints') !== '0')

  const text = useMemo(() => copy[lang], [lang])

  useEffect(() => {
    localStorage.setItem('ui-lang', lang)
  }, [lang])

  useEffect(() => {
    document.documentElement.classList.toggle('a11y-contrast', highContrast)
    localStorage.setItem('a11y-contrast', highContrast ? '1' : '0')
  }, [highContrast])

  useEffect(() => {
    document.documentElement.classList.toggle('a11y-large-text', largeText)
    localStorage.setItem('a11y-large-text', largeText ? '1' : '0')
  }, [largeText])

  useEffect(() => {
    localStorage.setItem('a11y-keyboard-hints', keyboardHints ? '1' : '0')
  }, [keyboardHints])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">{text.title}</h1>
        <p className="text-slate-400 mt-1">{text.subtitle}</p>
      </div>

      <div className="card p-5 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <label className="text-white font-medium flex items-center gap-2">
            <Languages className="w-4 h-4 text-emerald-400" />
            {text.lang}
          </label>
          <select className="select-field max-w-[240px]" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
            <option value="en">English</option>
            <option value="hi">Hinglish</option>
          </select>
        </div>

        <div className="divider" />

        <ToggleRow
          icon={<Contrast className="w-4 h-4 text-amber-400" />}
          label={text.highContrast}
          enabled={highContrast}
          onToggle={() => setHighContrast((prev) => !prev)}
        />

        <ToggleRow
          icon={<Type className="w-4 h-4 text-blue-400" />}
          label={text.largeText}
          enabled={largeText}
          onToggle={() => setLargeText((prev) => !prev)}
        />

        <ToggleRow
          icon={<Keyboard className="w-4 h-4 text-purple-400" />}
          label={text.keyboardHints}
          enabled={keyboardHints}
          onToggle={() => setKeyboardHints((prev) => !prev)}
        />
      </div>

      {keyboardHints && (
        <div className="card p-4 text-sm text-slate-300 flex items-start gap-2">
          <Accessibility className="w-4 h-4 text-emerald-400 mt-0.5" />
          Tip: Use Tab to move focus, Shift+Tab to go back, and Enter/Space to activate controls.
        </div>
      )}
    </div>
  )
}

type ToggleRowProps = {
  icon: ReactNode
  label: string
  enabled: boolean
  onToggle: () => void
}

function ToggleRow({ icon, label, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-slate-200 flex items-center gap-2">
        {icon}
        {label}
      </p>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`w-12 h-6 rounded-full p-1 transition ${enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
      >
        <span className={`block w-4 h-4 rounded-full bg-white transition ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}
