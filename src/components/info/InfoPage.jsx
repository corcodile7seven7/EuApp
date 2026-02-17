import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SECTIONS } from '../../utils/scoring';

function AccordionSection({ title, icon, children }) {
  const [open, setOpen] = useState(false);
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
        <div className="px-4 pb-4 text-sm text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

const sectionMeta = [
  { id: 'eu-knowledge', icon: '🇪🇺' },
  { id: 'digital-skills', icon: '💻' },
  { id: 'verbal-reasoning', icon: '📝' },
  { id: 'numerical-reasoning', icon: '🔢' },
  { id: 'abstract-reasoning', icon: '🔷' },
  { id: 'temporal', icon: '📅' },
  { id: 'eu-institutions', icon: '🏛️' },
  { id: 'acronyms', icon: '🔤' },
  { id: 'situational', icon: '🎯' },
  { id: 'it-advanced', icon: '⚙️' },
];

export default function InfoPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">{t('info.title')}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('info.subtitle')}</p>

      <div className="space-y-3">
        {/* How the quiz works */}
        <AccordionSection title={t('info.how_it_works')} icon="📖">
          <p>{t('info.how_it_works_p1')}</p>
          <p>{t('info.how_it_works_p2')}</p>
          <p>{t('info.how_it_works_p3')}</p>
        </AccordionSection>

        {/* Scoring rules */}
        <AccordionSection title={t('info.scoring_rules')} icon="📊">
          <p>{t('info.scoring_p1')}</p>
          <p>{t('info.scoring_p2')}</p>
          <p>{t('info.scoring_p3')}</p>
        </AccordionSection>

        {/* Categories */}
        <AccordionSection title={t('info.categories_title')} icon="📂">
          <div className="space-y-3">
            {sectionMeta.map(sec => {
              const cfg = SECTIONS[sec.id];
              if (!cfg) return null;
              return (
                <div key={sec.id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-dark-border/30">
                  <span className="text-lg">{sec.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{t('sections.' + sec.id)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('sections_desc.' + sec.id)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {cfg.totalQuestions} {t('quiz.questions')} · {cfg.timePerQuestion}{t('common.sec')}/{t('quiz.question').toLowerCase()}
                      {cfg.weight > 0 && ` · ${t('dashboard.weight')}: ${Math.round(cfg.weight * 100)}%`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </AccordionSection>

        {/* Available modes */}
        <AccordionSection title={t('info.modes_title')} icon="🎮">
          <p><strong>{t('quiz.practice_mode')}:</strong> {t('info.mode_practice')}</p>
          <p><strong>{t('quiz.exam_mode')}:</strong> {t('info.mode_exam')}</p>
          <p><strong>{t('quiz.all_categories')}:</strong> {t('info.mode_all')}</p>
          <p><strong>{t('quiz.mixed_mode')}:</strong> {t('info.mode_mixed')}</p>
        </AccordionSection>

        {/* Navigation guide */}
        <AccordionSection title={t('info.navigation_title')} icon="🧭">
          <p>{t('info.navigation_p1')}</p>
          <p>{t('info.navigation_p2')}</p>
          <p>{t('info.navigation_p3')}</p>
        </AccordionSection>

        {/* Assessment system */}
        <AccordionSection title={t('info.assessment_title')} icon="📈">
          <p>{t('info.assessment_p1')}</p>
          <p>{t('info.assessment_p2')}</p>
          <p>{t('info.assessment_p3')}</p>
        </AccordionSection>
      </div>
    </div>
  );
}
