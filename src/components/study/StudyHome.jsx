import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

function AccordionSection({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors"
      >
        <span className="text-lg">{icon}</span>
        <span className="flex-1 font-semibold text-sm">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

export default function StudyHome() {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">{t('study.title')}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('study.subtitle')}</p>

      <div className="space-y-3">
        {/* 1. Come funziona il concorso */}
        <AccordionSection title={t('study.competition_title')} icon="🏛️" defaultOpen={true}>
          <div className="space-y-2">
            <p className="font-medium text-eu-blue dark:text-eu-yellow">{t('study.competition_philosophy_title')}</p>
            <p>{t('study.competition_philosophy')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.competition_requirements_title')}</p>
            <p>{t('study.competition_requirements')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.competition_phases_title')}</p>
            <p>{t('study.competition_phase1')}</p>
            <p>{t('study.competition_phase2')}</p>
            <p>{t('study.competition_phase3')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.competition_eliminatory_title')}</p>
            <p>{t('study.competition_eliminatory')}</p>
          </div>
        </AccordionSection>

        {/* 2. Strategia e Tips */}
        <AccordionSection title={t('study.strategy_title')} icon="🎯">
          <div className="space-y-2">
            <p className="font-medium text-eu-blue dark:text-eu-yellow">{t('study.strategy_verbal_title')}</p>
            <p>{t('study.strategy_verbal')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.strategy_numerical_title')}</p>
            <p>{t('study.strategy_numerical')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.strategy_abstract_title')}</p>
            <p>{t('study.strategy_abstract')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.strategy_time_title')}</p>
            <p>{t('study.strategy_time')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.strategy_general_title')}</p>
            <p>{t('study.strategy_general')}</p>
          </div>
        </AccordionSection>

        {/* 3. Reasonable Accommodation / DSA */}
        <AccordionSection title={t('study.accommodation_title')} icon="♿">
          <div className="space-y-2">
            <p className="font-medium text-eu-blue dark:text-eu-yellow">{t('study.accommodation_what_title')}</p>
            <p>{t('study.accommodation_what')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.accommodation_procedure_title')}</p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">{t('study.accommodation_warning')}</p>
            </div>
            <p>{t('study.accommodation_procedure')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.accommodation_extra_time_title')}</p>
            <p>{t('study.accommodation_extra_time')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.accommodation_neurodiversity_title')}</p>
            <p>{t('study.accommodation_neurodiversity')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.accommodation_docs_title')}</p>
            <p>{t('study.accommodation_docs')}</p>
          </div>
        </AccordionSection>

        {/* 4. Lingue L1 e L2 */}
        <AccordionSection title={t('study.languages_title')} icon="🌍">
          <div className="space-y-2">
            <p className="font-medium text-eu-blue dark:text-eu-yellow">{t('study.languages_l1_title')}</p>
            <p>{t('study.languages_l1')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.languages_l2_title')}</p>
            <p>{t('study.languages_l2')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.languages_level_title')}</p>
            <p>{t('study.languages_level')}</p>

            <p className="font-medium text-eu-blue dark:text-eu-yellow mt-3">{t('study.languages_verbal_warning_title')}</p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p>{t('study.languages_verbal_warning')}</p>
            </div>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}
