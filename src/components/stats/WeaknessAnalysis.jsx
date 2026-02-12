import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';
import { getWeaknessAnalysis, getWeaknessColor, getWeaknessBgColor } from '../../utils/weakness';

export default function WeaknessAnalysis() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { categories, questions } = useMemo(() => getWeaknessAnalysis(), []);

  const questionStats = useMemo(() => storage.getQuestionStats(), []);

  // Drill-down: questions for selected category
  const categoryQuestions = useMemo(() => {
    if (!selectedCategory) return [];
    return questions.filter(q => {
      const qId = q.id;
      // Match by section:category from history
      return categories.some(c =>
        c.section === selectedCategory.section &&
        c.category === selectedCategory.category
      ) && qId.startsWith(selectedCategory.section === 'eu-knowledge' ? 'eu-' : 'dig-');
    }).filter(q => {
      // Check if this question belongs to the selected category
      const stat = questionStats[q.id];
      return stat && stat.attempts > 0;
    });
  }, [selectedCategory, questions, categories, questionStats]);

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('weakness.no_data')}</p>
      </div>
    );
  }

  const levelLabels = {
    critical: t('weakness.critical'),
    weak: t('weakness.weak'),
    moderate: t('weakness.moderate'),
    strong: t('weakness.strong'),
  };

  return (
    <div className="space-y-4">
      {/* Category weakness bars */}
      {!selectedCategory && (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('weakness.categories_desc')}</p>
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={`${cat.section}:${cat.category}`}
                onClick={() => setSelectedCategory(cat)}
                className="w-full text-left px-4 py-3 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border hover:border-eu-blue/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cat.category}</p>
                    <p className="text-xs text-gray-400">{t('sections.' + cat.section)} &middot; {cat.total} {t('weakness.answers')}</p>
                  </div>
                  <div className="text-right ml-3">
                    <span className={`text-sm font-bold ${getWeaknessColor(cat.level)}`}>
                      {cat.accuracy}%
                    </span>
                    <p className={`text-xs ${getWeaknessColor(cat.level)}`}>{levelLabels[cat.level]}</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getWeaknessBgColor(cat.level)} rounded-full transition-all`}
                    style={{ width: `${cat.accuracy}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Practice weaknesses button */}
          {categories.some(c => c.level === 'critical' || c.level === 'weak') && (
            <div className="space-y-2">
              {['eu-knowledge', 'digital-skills'].map(section => {
                const sectionCats = categories.filter(c => c.section === section && (c.level === 'critical' || c.level === 'weak'));
                if (sectionCats.length === 0) return null;
                return (
                  <button
                    key={section}
                    onClick={() => navigate(`/quiz/${section}?mode=practice&weak=true`)}
                    className="w-full py-3 rounded-xl text-sm font-medium bg-warn-orange/10 text-warn-orange border border-warn-orange/30 hover:bg-warn-orange/20 transition-colors"
                  >
                    {t('weakness.practice_weak')} — {t('sections.' + section)}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Drill-down: questions in selected category */}
      {selectedCategory && (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-eu-blue hover:underline"
            >
              ← {t('weakness.back')}
            </button>
            <h4 className="text-sm font-bold flex-1">{selectedCategory.category}</h4>
            <span className={`text-sm font-bold ${getWeaknessColor(selectedCategory.level)}`}>
              {selectedCategory.accuracy}%
            </span>
          </div>

          {categoryQuestions.length > 0 ? (
            <div className="space-y-2">
              {categoryQuestions.map((q) => (
                <div
                  key={q.id}
                  className={`px-4 py-3 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-mono">{q.id}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {q.correct}/{q.attempts}
                      </span>
                      <span className={`text-xs font-bold ${getWeaknessColor(q.level)}`}>
                        {q.accuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">{t('weakness.no_question_data')}</p>
          )}

          <button
            onClick={() => navigate(`/quiz/${selectedCategory.section}?mode=practice&weak=true`)}
            className="w-full py-3 rounded-xl text-sm font-medium bg-eu-blue text-white hover:bg-eu-blue-light transition-colors"
          >
            {t('weakness.practice_weak')}
          </button>
        </>
      )}
    </div>
  );
}
