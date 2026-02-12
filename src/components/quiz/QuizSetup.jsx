import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { SECTIONS } from '../../utils/scoring';

const availableSections = [
  { id: 'eu-knowledge', icon: '🇪🇺', colorClass: 'bg-eu-blue' },
  { id: 'digital-skills', icon: '💻', colorClass: 'bg-cyan-600' },
];

const questionCounts = [10, 15, 20, 30, 0]; // 0 = all

export default function QuizSetup() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('practice');
  const [numQ, setNumQ] = useState(0);

  const startQuiz = () => {
    if (!selected) return;
    navigate(`/quiz/${selected}?mode=${mode}&num=${numQ}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-bold">{t('quiz.select_section')}</h2>

      {/* Section cards */}
      <div className="grid gap-3">
        {availableSections.map(sec => {
          const cfg = SECTIONS[sec.id];
          const isSelected = selected === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setSelected(sec.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-eu-blue bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-dark-border hover:border-eu-blue/50'
              }`}
            >
              <span className="text-2xl">{sec.icon}</span>
              <div className="flex-1">
                <p className="font-semibold">{t('sections.' + sec.id)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {cfg.totalQuestions} {t('quiz.questions')} · {cfg.timePerQuestion}{t('common.sec')} {t('quiz.per_question')} · {t('dashboard.pass_threshold')}: {cfg.passScore}/{cfg.totalQuestions}
                </p>
              </div>
              <span className="text-sm font-medium text-gray-400">{Math.round(cfg.weight * 100)}%</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <>
          {/* Mode selection */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('quiz.practice_mode')} / {t('quiz.exam_mode')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('practice')}
                className={`p-3 rounded-xl border-2 text-sm transition-all ${
                  mode === 'practice' ? 'border-eu-blue bg-blue-50 dark:bg-blue-900/20 font-medium' : 'border-gray-200 dark:border-dark-border'
                }`}
              >
                <p className="font-semibold">{t('quiz.practice_mode')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('quiz.practice_desc')}</p>
              </button>
              <button
                onClick={() => setMode('exam')}
                className={`p-3 rounded-xl border-2 text-sm transition-all ${
                  mode === 'exam' ? 'border-eu-blue bg-blue-50 dark:bg-blue-900/20 font-medium' : 'border-gray-200 dark:border-dark-border'
                }`}
              >
                <p className="font-semibold">{t('quiz.exam_mode')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('quiz.exam_desc')}</p>
              </button>
            </div>
          </div>

          {/* Number of questions */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t('quiz.num_questions')}
            </h3>
            <div className="flex gap-2 flex-wrap">
              {questionCounts.map(n => (
                <button
                  key={n}
                  onClick={() => setNumQ(n)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    numQ === n ? 'bg-eu-blue text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {n === 0 ? t('quiz.all') : n}
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={startQuiz}
            className="w-full py-3.5 bg-eu-blue text-white rounded-xl font-bold text-lg hover:bg-eu-blue-light transition-colors"
          >
            {t('quiz.start')}
          </button>
        </>
      )}
    </div>
  );
}
