import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { SECTIONS } from '../../utils/scoring';

const categories = [
  { id: 'eu-knowledge', icon: '🇪🇺', colorClass: 'bg-[#003399]' },
  { id: 'digital-skills', icon: '💻', colorClass: 'bg-[#0891B2]' },
  { id: 'verbal-reasoning', icon: '📝', colorClass: 'bg-[#7C3AED]' },
  { id: 'numerical-reasoning', icon: '🔢', colorClass: 'bg-[#059669]' },
  { id: 'abstract-reasoning', icon: '🔷', colorClass: 'bg-[#D97706]' },
  { id: 'temporal', icon: '📅', colorClass: 'bg-[#D97706]' },
  { id: 'eu-institutions', icon: '🏛️', colorClass: 'bg-[#6D28D9]' },
  { id: 'acronyms', icon: '🔤', colorClass: 'bg-[#BE185D]' },
  { id: 'situational', icon: '🎯', colorClass: 'bg-[#059669]' },
  { id: 'it-advanced', icon: '⚙️', colorClass: 'bg-[#0891B2]' },
];

const questionCounts = [10, 15, 20, 30, 0]; // 0 = all

export default function QuizSetup() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [mode, setMode] = useState('practice');
  const [numQ, setNumQ] = useState(20);

  const startCategory = (id) => {
    navigate(`/quiz/${id}?mode=${mode}&num=${numQ}`);
  };

  const startAll = () => {
    navigate(`/quiz/all?mode=${mode}&num=${numQ}`);
  };

  const startMixed = () => {
    navigate(`/quiz/mixed?mode=${mode}&num=${numQ}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-bold">{t('quiz.select_section')}</h2>

      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map(cat => {
          const cfg = SECTIONS[cat.id];
          if (!cfg) return null;
          return (
            <button
              key={cat.id}
              onClick={() => startCategory(cat.id)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-dark-border hover:border-eu-blue dark:hover:border-eu-yellow transition-all text-center group hover:shadow-md"
            >
              <span className={`w-12 h-12 rounded-xl ${cat.colorClass} flex items-center justify-center text-2xl text-white shadow-sm`}>
                {cat.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight group-hover:text-eu-blue dark:group-hover:text-eu-yellow transition-colors">
                  {t('sections.' + cat.id)}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  {cfg.totalQuestions} {t('quiz.questions')}
                </p>
                {t('sections_desc.' + cat.id) && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {t('sections_desc.' + cat.id)}
                  </p>
                )}
              </div>
              {cfg.weight > 0 && (
                <span className="text-[10px] font-medium text-eu-blue dark:text-eu-yellow bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-full">
                  {Math.round(cfg.weight * 100)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Multi-category modes */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={startAll}
          className="p-4 rounded-xl border-2 border-gray-200 dark:border-dark-border hover:border-eu-blue dark:hover:border-eu-yellow transition-all text-left hover:shadow-md"
        >
          <p className="font-semibold text-sm">{t('quiz.all_categories')}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{t('quiz.all_categories_desc')}</p>
        </button>
        <button
          onClick={startMixed}
          className="p-4 rounded-xl border-2 border-gray-200 dark:border-dark-border hover:border-eu-blue dark:hover:border-eu-yellow transition-all text-left hover:shadow-md"
        >
          <p className="font-semibold text-sm">{t('quiz.mixed_mode')}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{t('quiz.mixed_mode_desc')}</p>
        </button>
      </div>

      {/* Settings bar */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 space-y-4">
        {/* Mode toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide min-w-[4rem]">
            {t('quiz.choose_mode')}
          </span>
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => setMode('practice')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                mode === 'practice'
                  ? 'bg-eu-blue text-white'
                  : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400'
              }`}
            >
              {t('quiz.practice_mode')}
            </button>
            <button
              onClick={() => setMode('exam')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                mode === 'exam'
                  ? 'bg-eu-blue text-white'
                  : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400'
              }`}
            >
              {t('quiz.exam_mode')}
            </button>
          </div>
        </div>

        {/* Question count */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide min-w-[4rem]">
            {t('quiz.num_questions')}
          </span>
          <div className="flex gap-2 flex-wrap flex-1">
            {questionCounts.map(n => (
              <button
                key={n}
                onClick={() => setNumQ(n)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  numQ === n
                    ? 'bg-eu-blue text-white'
                    : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400'
                }`}
              >
                {n === 0 ? t('quiz.all') : n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
