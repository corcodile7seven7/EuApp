import { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { storage } from '../../utils/storage';
import { SECTIONS, computeWeightedScore } from '../../utils/scoring';
import Countdown from './Countdown';
import ProgressCard from './ProgressCard';
import SmartTrainingButton from './SmartTrainingButton';

export default function Dashboard() {
  const { t } = useLanguage();

  const { sectionScores, weakest, weightedScore } = useMemo(() => {
    const history = storage.getHistory();
    const scores = {};

    Object.keys(SECTIONS).forEach(id => {
      scores[id] = { correct: 0, total: 0 };
    });

    history.forEach(h => {
      if (scores[h.section]) {
        scores[h.section].correct += h.score;
        scores[h.section].total += h.total;
      }
    });

    // Find weakest available section
    let weakest = null;
    let lowestPct = Infinity;
    ['eu-knowledge', 'digital-skills', 'verbal-reasoning', 'numerical-reasoning', 'abstract-reasoning', 'temporal', 'eu-institutions', 'acronyms', 'situational', 'it-advanced'].forEach(id => {
      const s = scores[id];
      const pct = s.total > 0 ? s.correct / s.total : 0;
      if (pct < lowestPct) {
        lowestPct = pct;
        weakest = id;
      }
    });

    const weighted = computeWeightedScore(scores);

    return { sectionScores: scores, weakest, weightedScore: weighted };
  }, []);

  const sectionList = [
    { id: 'eu-knowledge', weight: 0.25 },
    { id: 'digital-skills', weight: 0.25 },
    { id: 'verbal-reasoning', weight: 0.35 },
    { id: 'numerical-reasoning', weight: 0 },
    { id: 'abstract-reasoning', weight: 0 },
    { id: 'eufte', weight: 0.15 },
    { id: 'temporal', weight: 0 },
    { id: 'eu-institutions', weight: 0 },
    { id: 'acronyms', weight: 0 },
    { id: 'situational', weight: 0 },
    { id: 'it-advanced', weight: 0 },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Countdown />
      <SmartTrainingButton weakestSection={weakest} />

      {/* Weighted score */}
      <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-200 dark:border-dark-border text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.weighted_score')}</p>
        <p className="text-3xl font-bold text-eu-blue dark:text-eu-yellow mt-1">{weightedScore}%</p>
      </div>

      {/* Progress per section */}
      <h2 className="text-lg font-bold">{t('dashboard.progress')}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {sectionList.map(({ id, weight }) => {
          const cfg = SECTIONS[id];
          const s = sectionScores[id];
          return (
            <ProgressCard
              key={id}
              sectionId={id}
              label={t('sections.' + id)}
              weight={weight}
              passScore={cfg.passScore}
              totalQuestions={cfg.totalQuestions}
              correct={s.correct}
              total={s.total}
            />
          );
        })}
      </div>
    </div>
  );
}
