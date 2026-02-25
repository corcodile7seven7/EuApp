import { useState, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getDeepDiveExplanation, hasApiKey } from '../../utils/deepseek';
import renderMarkdown from '../../utils/renderMarkdown';
import VisualContextModal from '../visual/VisualContextModal';

const optionLabels = ['A', 'B', 'C', 'D'];

export default function EnhancedExplanation({ question, selectedOption, showDeepDive = true }) {
  const { t, quizLang } = useLanguage();
  const [deepDive, setDeepDive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const explanation = quizLang === 'en' ? question.explanation_en : question.explanation_it;
  const motivation = quizLang === 'en' ? question.motivation_en : question.motivation_it;
  const wrongExplanations = quizLang === 'en' ? question.wrong_explanations_en : question.wrong_explanations_it;

  const handleDeepDive = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getDeepDiveExplanation(question, selectedOption, quizLang);
    if (result.success) {
      setDeepDive(result.data);
    } else {
      const errorMessages = {
        rate_minute: t('ai.rate_limit_minute'),
        rate_daily: t('ai.rate_limit_daily'),
        no_api_key: t('ai.no_api_key'),
      };
      setError(errorMessages[result.error] || result.error);
    }
    setLoading(false);
  }, [question, selectedOption, quizLang, t]);

  return (
    <div className="mt-4 space-y-3">
      {/* Base explanation */}
      {explanation && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-eu-blue/20">
          <p className="text-sm font-semibold text-eu-blue dark:text-eu-yellow mb-1">
            {t('quiz.explanation')}
          </p>
          <div className="text-sm text-gray-700 dark:text-gray-300">{renderMarkdown(explanation)}</div>
        </div>
      )}

      {/* Motivation - why correct is correct */}
      {motivation && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-pass-green/20">
          <p className="text-sm font-semibold text-pass-green mb-1">
            {t('ai.why_correct')}
          </p>
          <div className="text-sm text-gray-700 dark:text-gray-300">{renderMarkdown(motivation)}</div>
        </div>
      )}

      {/* Wrong explanations */}
      {wrongExplanations && wrongExplanations.length === 4 && (
        <div className="space-y-2">
          {wrongExplanations.map((explanation, i) => {
            if (i === question.correct || !explanation) return null;
            const optionText = quizLang === 'en' ? question.options[i]?.text_en : question.options[i]?.text_it;
            const isSelected = i === selectedOption;
            return (
              <div
                key={i}
                className={`p-3 rounded-xl border ${
                  isSelected
                    ? 'bg-red-50 dark:bg-red-900/20 border-fail-red/30'
                    : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-dark-border'
                }`}
              >
                <p className="text-xs font-semibold text-fail-red mb-0.5">
                  {optionLabels[i]}) {optionText}
                  {isSelected && <span className="ml-1">({t('ai.your_answer')})</span>}
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400">{renderMarkdown(explanation)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visual Context button */}
      {question.visualId && (
        <VisualContextModal visualId={question.visualId} />
      )}

      {/* Deep Dive AI button */}
      {showDeepDive && hasApiKey() && !deepDive && (
        <button
          onClick={handleDeepDive}
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50"
        >
          {loading ? t('common.loading') : t('ai.deep_dive')}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-fail-red/20">
          <p className="text-xs text-fail-red">{error}</p>
        </div>
      )}

      {/* Deep Dive result */}
      {deepDive && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              {t('ai.deep_dive_title')}
            </p>
            <span className="text-xs text-purple-400">DeepSeek AI</span>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {renderMarkdown(deepDive)}
          </div>
        </div>
      )}
    </div>
  );
}
