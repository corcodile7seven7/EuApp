import { useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';
import { SECTIONS } from '../../utils/scoring';
import WeaknessAnalysis from './WeaknessAnalysis';

export default function Statistics() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('summary');

  const { history, sectionSummary, categoryAccuracy } = useMemo(() => {
    const history = storage.getHistory();
    const sectionSummary = {};
    const categoryAccuracy = {};

    history.forEach(h => {
      if (!sectionSummary[h.section]) {
        sectionSummary[h.section] = { attempts: 0, scores: [], totalTime: 0 };
      }
      const s = sectionSummary[h.section];
      s.attempts++;
      s.scores.push({ score: h.score, total: h.total });
      s.totalTime += h.elapsed || 0;

      // Category breakdown
      if (h.answers) {
        h.answers.forEach(a => {
          if (!a.category) return;
          const key = `${h.section}:${a.category}`;
          if (!categoryAccuracy[key]) {
            categoryAccuracy[key] = { section: h.section, category: a.category, correct: 0, total: 0 };
          }
          categoryAccuracy[key].total++;
          if (a.correct) categoryAccuracy[key].correct++;
        });
      }
    });

    return { history, sectionSummary, categoryAccuracy };
  }, []);

  const downloadExport = () => {
    const data = storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `epso-prep-stats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('stats.title')}</h2>
        <button
          onClick={downloadExport}
          className="text-sm px-3 py-1.5 rounded-lg bg-eu-blue text-white hover:bg-eu-blue-light transition-colors"
        >
          {t('stats.export')}
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-border rounded-xl p-1">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'summary' ? 'bg-white dark:bg-dark-surface text-eu-blue shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        >
          {t('stats.summary')}
        </button>
        <button
          onClick={() => setActiveTab('weakness')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'weakness' ? 'bg-white dark:bg-dark-surface text-eu-blue shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        >
          {t('weakness.title')}
        </button>
      </div>

      {activeTab === 'weakness' && <WeaknessAnalysis />}

      {activeTab === 'summary' && <>
      {/* Section summary */}
      {Object.keys(sectionSummary).length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">{t('stats.summary')}</h3>
          <div className="space-y-2">
            {Object.entries(sectionSummary).map(([section, data]) => {
              const best = Math.max(...data.scores.map(s => s.score));
              const bestTotal = data.scores.find(s => s.score === best)?.total || 0;
              const avgScore = Math.round(data.scores.reduce((a, s) => a + (s.score / s.total) * 100, 0) / data.scores.length);
              const avgTime = data.attempts > 0 ? Math.round(data.totalTime / data.attempts) : 0;
              const avgMins = Math.floor(avgTime / 60);
              const avgSecs = avgTime % 60;

              return (
                <div key={section} className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-200 dark:border-dark-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{t('sections.' + section)}</h4>
                    <span className="text-xs text-gray-500">{data.attempts} {t('stats.attempts')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{t('stats.best')}</p>
                      <p className="font-bold">{best}/{bestTotal}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{t('stats.average')}</p>
                      <p className="font-bold">{avgScore}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{t('stats.avg_time')}</p>
                      <p className="font-bold">{avgMins}:{avgSecs.toString().padStart(2, '0')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category accuracy */}
      {Object.keys(categoryAccuracy).length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">{t('stats.categories')}</h3>
          <div className="space-y-1.5">
            {Object.values(categoryAccuracy)
              .sort((a, b) => (a.correct / a.total) - (b.correct / b.total))
              .map(cat => {
                const pct = Math.round((cat.correct / cat.total) * 100);
                const cfg = SECTIONS[cat.section];
                const passPct = cfg ? Math.round((cfg.passScore / cfg.totalQuestions) * 100) : 50;
                const color = pct >= passPct ? 'bg-pass-green' : 'bg-fail-red';

                return (
                  <div key={`${cat.section}:${cat.category}`} className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-dark-surface rounded-lg border border-gray-100 dark:border-dark-border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{cat.category}</p>
                      <p className="text-xs text-gray-400">{t('sections.' + cat.section)}</p>
                    </div>
                    <div className="w-20 h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-sm font-bold min-w-[3rem] text-right ${pct < passPct ? 'text-fail-red' : 'text-pass-green'}`}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Quiz history */}
      <div>
        <h3 className="font-semibold mb-3">{t('stats.history')}</h3>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">{t('stats.no_history')}</p>
        ) : (
          <div className="space-y-2">
            {[...history].reverse().map((h, i) => {
              const d = new Date(h.date);
              const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t('sections.' + h.section)}</p>
                    <p className="text-xs text-gray-500">{dateStr}</p>
                  </div>
                  <span className="font-bold">{h.score}/{h.total}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${h.passed ? 'bg-green-100 dark:bg-green-900/30 text-pass-green' : 'bg-red-100 dark:bg-red-900/30 text-fail-red'}`}>
                    {h.passed ? t('stats.passed') : t('stats.failed')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>}
    </div>
  );
}
