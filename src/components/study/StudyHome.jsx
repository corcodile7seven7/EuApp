import { useLanguage } from '../../context/LanguageContext';

export default function StudyHome() {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-bold">{t('study.title')}</h2>
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📚</div>
        <p className="text-gray-500 dark:text-gray-400">{t('study.coming_soon')}</p>
      </div>
    </div>
  );
}
