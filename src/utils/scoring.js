export const SECTIONS = {
  'eu-knowledge': {
    id: 'eu-knowledge',
    timePerQuestion: 80,
    passScore: 15,
    totalQuestions: 30,
    weight: 0.25,
    color: '#003399',
  },
  'digital-skills': {
    id: 'digital-skills',
    timePerQuestion: 45,
    passScore: 20,
    totalQuestions: 40,
    weight: 0.25,
    color: '#0891B2',
  },
  'verbal-reasoning': {
    id: 'verbal-reasoning',
    timePerQuestion: 105,
    passScore: 10,
    totalQuestions: 20,
    weight: 0.35,
    color: '#7C3AED',
  },
  'numerical-reasoning': {
    id: 'numerical-reasoning',
    timePerQuestion: 120,
    passScore: 10,
    totalQuestions: 10,
    weight: 0,
    combinedWith: 'abstract-reasoning',
    combinedPassScore: 10,
    combinedTotal: 20,
    color: '#059669',
  },
  'abstract-reasoning': {
    id: 'abstract-reasoning',
    timePerQuestion: 60,
    passScore: 10,
    totalQuestions: 10,
    weight: 0,
    combinedWith: 'numerical-reasoning',
    combinedPassScore: 10,
    combinedTotal: 20,
    color: '#D97706',
  },
  'eufte': {
    id: 'eufte',
    timePerQuestion: 2400,
    passScore: 5,
    totalQuestions: 1,
    weight: 0.15,
    color: '#DC2626',
  },
};

export function getSectionLabel(sectionId, t) {
  return t('sections.' + sectionId) || sectionId;
}

export function computeWeightedScore(sectionScores) {
  let total = 0;
  Object.entries(SECTIONS).forEach(([id, cfg]) => {
    if (cfg.weight > 0 && sectionScores[id] !== undefined) {
      const pct = sectionScores[id].correct / sectionScores[id].total;
      total += pct * cfg.weight * 100;
    }
  });
  return Math.round(total);
}

export function isPassing(sectionId, score) {
  const cfg = SECTIONS[sectionId];
  if (!cfg) return false;
  return score >= cfg.passScore;
}

export function getScoreColor(sectionId, score, total) {
  const cfg = SECTIONS[sectionId];
  if (!cfg || total === 0) return 'gray';
  const passScore = cfg.passScore;
  const scaledPass = (passScore / cfg.totalQuestions) * total;
  if (score >= scaledPass) return 'green';
  if (score >= scaledPass - (total * 0.1)) return 'orange';
  return 'red';
}
