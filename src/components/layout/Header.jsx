import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useProfile } from '../../context/ProfileContext';

export default function Header() {
  const { dark, toggleDark } = useTheme();
  const { t } = useLanguage();
  const { activeProfile, switchProfile } = useProfile();
  const [confirmSwitch, setConfirmSwitch] = useState(false);

  return (
    <header className="bg-eu-blue text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-eu-yellow rounded-lg flex items-center justify-center">
          <span className="text-eu-blue font-bold text-xs">EU</span>
        </div>
        <h1 className="text-lg font-bold tracking-tight">{t('app_name')}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Profile badge */}
        {activeProfile && (
          <div className="relative">
            <button
              onClick={() => setConfirmSwitch(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow transition-opacity hover:opacity-80"
              style={{ backgroundColor: activeProfile.color }}
              title={`Profilo: ${activeProfile.name}`}
            >
              {activeProfile.initial}
            </button>

            {/* Confirm dialog */}
            {confirmSwitch && (
              <div className="absolute right-0 top-10 bg-white text-gray-800 rounded-xl shadow-xl p-4 w-52 z-50 border border-gray-100">
                <p className="text-sm font-medium mb-3">Cambia profilo?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setConfirmSwitch(false); switchProfile(); }}
                    className="flex-1 bg-eu-blue text-white text-xs py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Sì, cambia
                  </button>
                  <button
                    onClick={() => setConfirmSwitch(false)}
                    className="flex-1 bg-gray-100 text-gray-600 text-xs py-1.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dark mode toggle */}
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
      </div>

      {/* Backdrop to close confirm dialog */}
      {confirmSwitch && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setConfirmSwitch(false)}
        />
      )}
    </header>
  );
}
