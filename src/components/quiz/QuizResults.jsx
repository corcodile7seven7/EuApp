import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SECTIONS } from '../../utils/scoring';
import EnhancedExplanation from './EnhancedExplanation';

const optionLabels = ['A', 'B', 'C', 'D'];

export default function QuizResults({ result, questions, onRetry, onBack }) {
  const { t, quizLang } = useLanguage();
  const [expanded, setExpanded] = useState({});
  const cfg = SECTIONS[result.section];
  const scaledPass = Math.round((cfg.passScore / cfg.totalQuestions) * result.total);

  const mins = Math.floor(result.elapsed / 60);
  const secs = result.elapsed % 60;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Score card */}
      <div className={`rounded-2xl p-6 text-center ${result.passed ? 'bg-green-50 dark:bg-green-900/20 border-2 border-pass-green' : 'bg-red-50 dark:bg-red-900/20 border-2 border-fail-red'}`}>
        <div className={`text-5xl font-bold ${result.passed ? 'text-pass-green' : 'text-fail-red'}`}>
          {result.score}/{result.total}
        </div>
        <div className={`text-lg font-bold mt-2 ${result.passed ? 'text-pass-green' : 'text-fail-red'}`}>
          {result.passed ? t('quiz.passed') : t('quiz.failed')}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('dashboard.pass_threshold')}: {scaledPass}/{result.total}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('quiz.time_used')}: {mins}:{secs.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onRetry} className="flex-1 py-3 bg-eu-blue text-white rounded-xl font-medium hover:bg-eu-blue-light transition-colors">
          {t('quiz.retry')}
        </button>
        <button onClick={onBack} className="flex-1 py-3 bg-gray-200 dark:bg-dark-surface text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-dark-border transition-colors">
          {t('quiz.back_to_quiz')}
        </button>
      </div>

      {/* Question review */}
      <div>
        <h3 className="text-lg font-bold mb-3">{t('quiz.review')}</h3>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const a = result.answers[i];
            const qText = quizLang === 'en' ? q.question_en : q.question_it;
            const isExpanded = expanded[i] || false;

            return (
              <div key={i} className={`rounded-xl border-2 ${a.correct ? 'border-pass-green/30 bg-green-50/50 dark:bg-green-900/10' : 'border-fail-red/30 bg-red-50/50 dark:bg-red-900/10'}`}>
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [i]: !prev[i] }))}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${a.correct ? 'bg-pass-green text-white' : 'bg-fail-red text-white'}`}>
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium flex-1">{qText}</p>
                    <span className="text-gray-400 shrink-0 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                  {a.selected >= 0 && !a.correct && (
                    <p className="text-sm text-fail-red ml-8 mb-1">
                      {t('quiz.incorrect')}: {optionLabels[a.selected]}. {quizLang === 'en' ? q.options[a.selected]?.text_en : q.options[a.selected]?.text_it}
                    </p>
                  )}
                  {a.selected === -1 && (
                    <p className="text-sm text-gray-500 ml-8 mb-1">{t('quiz.unanswered')}</p>
                  )}
                  <p className="text-sm text-pass-green ml-8">
                    {t('quiz.correct')}: {optionLabels[q.correct]}. {quizLang === 'en' ? q.options[q.correct]?.text_en : q.options[q.correct]?.text_it}
                  </p>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <EnhancedExplanation
                      question={q}
                      selectedOption={a.selected}
                      showDeepDive={true}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
