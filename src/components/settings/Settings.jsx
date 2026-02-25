import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { storage } from '../../utils/storage';
import { getStoredApiKey, setApiKey, testConnection } from '../../utils/deepseek';
import { getTotalGeneratedCount } from '../../utils/questionStorage';

export default function Settings() {
  const navigate = useNavigate();
  const { lang, setLang, quizLang, setQuizLang, t } = useLanguage();
  const { dark, toggleDark } = useTheme();
  const [totalGenerated] = useState(() => getTotalGeneratedCount());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const [apiKey, setApiKeyState] = useState(() => getStoredApiKey());
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const handleSaveApiKey = useCallback(() => {
    setApiKey(apiKey);
    setTestResult(null);
  }, [apiKey]);

  const handleTestConnection = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testConnection();
    setTestResult(result.success ? 'ok' : result.error);
    setTesting(false);
  }, []);

  const handleExport = () => {
    const data = storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `epso-prep-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (window.confirm(t('settings.import_confirm'))) {
          storage.importAll(data);
          window.location.reload();
        }
      } catch {
        alert(t('common.error'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    storage.clear();
    setShowResetConfirm(false);
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-bold">{t('settings.title')}</h2>

      {/* Language */}
      <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-200 dark:border-dark-border space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('settings.language')}</label>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setLang('it')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${lang === 'it' ? 'bg-eu-blue text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300'}`}
            >
              🇮🇹 {t('settings.italian')}
            </button>
            <button
              onClick={() => setLang('en')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${lang === 'en' ? 'bg-eu-blue text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300'}`}
            >
              🇬🇧 {t('settings.english')}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('settings.quiz_language')}</label>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setQuizLang('it')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${quizLang === 'it' ? 'bg-eu-blue text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300'}`}
            >
              🇮🇹 {t('settings.italian')}
            </button>
            <button
              onClick={() => setQuizLang('en')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${quizLang === 'en' ? 'bg-eu-blue text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300'}`}
            >
              🇬🇧 {t('settings.english')}
            </button>
          </div>
        </div>

        {/* Dark mode */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('settings.dark_mode')}</span>
          <button
            onClick={toggleDark}
            className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-eu-blue' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${dark ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Functions */}
      <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-200 dark:border-dark-border space-y-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('settings.ai_title')}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('settings.ai_desc')}</p>

        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('settings.api_key')}</label>
          <div className="flex gap-2 mt-1">
            <div className="flex-1 relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                onBlur={handleSaveApiKey}
                placeholder={t('settings.api_key_placeholder')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-eu-blue/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {showApiKey ? '🙈' : '👁'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50"
          >
            {testing ? t('common.loading') : t('settings.test_connection')}
          </button>
          {apiKey && (
            <button
              onClick={() => { setApiKeyState(''); setApiKey(''); setTestResult(null); }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-dark-border text-gray-500 hover:bg-gray-200 transition-colors"
            >
              {t('settings.clear_key')}
            </button>
          )}
        </div>

        {testResult && (
          <p className={`text-xs font-medium ${testResult === 'ok' ? 'text-pass-green' : 'text-fail-red'}`}>
            {testResult === 'ok' ? t('settings.connection_ok') : `${t('settings.connection_error')}: ${testResult}`}
          </p>
        )}
      </div>

      {/* AI Question Generator */}
      <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-200 dark:border-dark-border space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('generator.settings_card_title')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('generator.settings_card_desc')}</p>
          </div>
          {totalGenerated > 0 && (
            <span className="shrink-0 text-xs bg-eu-blue text-white rounded-full px-2 py-0.5 font-medium">
              {totalGenerated} {t('generator.total_generated')}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/question-generator')}
          className="w-full py-2.5 rounded-lg text-sm font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
        >
          {t('generator.settings_card_btn')}
        </button>
      </div>

      {/* Data management */}
      <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-200 dark:border-dark-border space-y-3">
        <button
          onClick={handleExport}
          className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {t('settings.export')}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {t('settings.import')}
        </button>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/20 text-fail-red hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            {t('settings.reset')}
          </button>
        ) : (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-fail-red mb-2">{t('settings.reset_confirm')}</p>
            <div className="flex gap-2">
              <button onClick={handleReset} className="flex-1 py-2 bg-fail-red text-white rounded-lg text-sm font-medium">
                {t('common.confirm')}
              </button>
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 bg-gray-200 dark:bg-dark-border rounded-lg text-sm font-medium">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">{t('settings.version')} 1.0.0-mvp</p>
    </div>
  );
}
