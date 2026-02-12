import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Header() {
  const { dark, toggleDark } = useTheme();
  const { t } = useLanguage();

  return (
    <header className="bg-eu-blue text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-eu-yellow rounded-lg flex items-center justify-center">
          <span className="text-eu-blue font-bold text-xs">EU</span>
        </div>
        <h1 className="text-lg font-bold tracking-tight">{t('app_name')}</h1>
      </div>
      <button
        onClick={toggleDark}
        className="p-2 rounded-lg hover:bg-eu-blue-light transition-colors"
        aria-label="Toggle dark mode"
      >
        {dark ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </header>
  );
}
