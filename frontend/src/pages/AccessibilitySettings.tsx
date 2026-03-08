import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
];

export default function AccessibilitySettings() {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });


  // Apply dark class on mount and when toggled
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);



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
            {t('toggleHighContrastDesc')}
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

        {/* Live Preview */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            {t('preview')}
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
