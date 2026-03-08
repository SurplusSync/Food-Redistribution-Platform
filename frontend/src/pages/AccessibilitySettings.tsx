import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translationEvents } from '../i18n';
import { clearTranslationCache } from '../services/translationService';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

export default function AccessibilitySettings() {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // Apply dark class on mount and when toggled
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Listen for translation progress events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setTranslating(detail.loading);
      setProgress({ done: detail.done, total: detail.total });
    };
    translationEvents.addEventListener('translating', handler);
    return () => translationEvents.removeEventListener('translating', handler);
  }, []);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nLanguage', langCode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t('accessibility')}
        </h1>

        {/* Language Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
            {t('selectLanguage')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('language')}
          </p>

          {/* Translation progress bar */}
          {translating && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                  Translating... {progress.done}/{progress.total}
                </span>
                <span className="text-xs text-green-600 dark:text-green-400">
                  {progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                First-time translation — cached for instant loading next time
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                  ${
                    i18n.language === lang.code
                      ? 'bg-green-600 text-white shadow-md ring-2 ring-green-400 ring-offset-2 dark:ring-offset-gray-800'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dark Mode / High-Contrast Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
            {t('highContrast')} / {t('darkMode')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Toggle high-contrast dark mode for improved readability.
          </p>

          <button
            onClick={() => setIsDark((prev) => !prev)}
            className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            style={{ backgroundColor: isDark ? '#16a34a' : '#d1d5db' }}
            aria-label="Toggle dark mode"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                isDark ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDark ? '🌙' : '☀️'}
          </span>
        </div>

        {/* Cache Management */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
            Translation Cache
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Translations are cached locally for instant loading. Clear the cache to re-translate.
          </p>
          <button
            onClick={() => {
              clearTranslationCache();
              if (i18n.language !== 'en') {
                const lang = i18n.language;
                i18n.changeLanguage('en');
                setTimeout(() => i18n.changeLanguage(lang), 100);
              }
            }}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Clear Translation Cache
          </button>
        </div>

        {/* Live Preview */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Preview
          </h2>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>{t('welcome')}</strong></p>
            <p>{t('dashboard')} &middot; {t('donations')} &middot; {t('settings')}</p>
            <p>{t('login')} &middot; {t('register')} &middot; {t('logout')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
