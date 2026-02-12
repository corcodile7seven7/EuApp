import { storage } from './storage';

/**
 * Analyze weaknesses from question stats and quiz history.
 * Returns category-level and question-level weakness data.
 */
export function analyzeWeaknesses(questionStats, history) {
  const categoryData = {};

  // Aggregate from history (category-level)
  history.forEach(h => {
    if (!h.answers) return;
    h.answers.forEach(a => {
      if (!a.category || !a.questionId) return;
      const key = `${h.section}:${a.category}`;
      if (!categoryData[key]) {
        categoryData[key] = {
          section: h.section,
          category: a.category,
          correct: 0,
          total: 0,
          questionIds: new Set(),
        };
      }
      categoryData[key].total++;
      if (a.correct) categoryData[key].correct++;
      categoryData[key].questionIds.add(a.questionId);
    });
  });

  // Compute category weakness scores
  const categories = Object.values(categoryData).map(cat => {
    const accuracy = cat.total > 0 ? cat.correct / cat.total : 0;
    const score = computeWeaknessScore(accuracy, cat.total);
    return {
      section: cat.section,
      category: cat.category,
      correct: cat.correct,
      total: cat.total,
      accuracy: Math.round(accuracy * 100),
      score,
      level: getWeaknessLevel(accuracy * 100),
      questionCount: cat.questionIds.size,
    };
  });

  // Sort worst-first
  categories.sort((a, b) => a.accuracy - b.accuracy);

  // Compute per-question weakness
  const questions = [];
  for (const [qId, stat] of Object.entries(questionStats)) {
    const accuracy = stat.attempts > 0 ? stat.correct / stat.attempts : 0;
    const score = computeWeaknessScore(accuracy, stat.attempts);
    questions.push({
      id: qId,
      attempts: stat.attempts,
      correct: stat.correct,
      streak: stat.streak,
      lastSeen: stat.lastSeen,
      accuracy: Math.round(accuracy * 100),
      score,
      level: getWeaknessLevel(accuracy * 100),
    });
  }

  questions.sort((a, b) => a.accuracy - b.accuracy);

  return { categories, questions };
}

/**
 * Weakness score: higher = weaker
 * (1 - accuracy) * 100 + min(attempts/10, 1) * 20
 */
function computeWeaknessScore(accuracy, attempts) {
  return (1 - accuracy) * 100 + Math.min(attempts / 10, 1) * 20;
}

/**
 * Get weakness level label based on accuracy percentage
 */
export function getWeaknessLevel(accuracyPct) {
  if (accuracyPct < 40) return 'critical';
  if (accuracyPct < 60) return 'weak';
  if (accuracyPct < 80) return 'moderate';
  return 'strong';
}

/**
 * Get level color class for UI
 */
export function getWeaknessColor(level) {
  switch (level) {
    case 'critical': return 'text-fail-red';
    case 'weak': return 'text-warn-orange';
    case 'moderate': return 'text-eu-blue';
    case 'strong': return 'text-pass-green';
    default: return 'text-gray-500';
  }
}

export function getWeaknessBgColor(level) {
  switch (level) {
    case 'critical': return 'bg-fail-red';
    case 'weak': return 'bg-warn-orange';
    case 'moderate': return 'bg-eu-blue';
    case 'strong': return 'bg-pass-green';
    default: return 'bg-gray-400';
  }
}

/**
 * Get weak questions for a specific section to create a targeted quiz.
 * Returns question objects sorted by weakness (worst first).
 */
export function getWeakQuestionsForSection(section, questionStats, allQuestions, count = 20) {
  // Score each question
  const scored = allQuestions
    .filter(q => q.id) // must have ID
    .map(q => {
      const stat = questionStats[q.id];
      if (!stat || stat.attempts === 0) {
        // Never attempted = moderately weak (encourage trying)
        return { question: q, score: 60, accuracy: -1 };
      }
      const accuracy = stat.correct / stat.attempts;
      const score = computeWeaknessScore(accuracy, stat.attempts);
      return { question: q, score, accuracy: Math.round(accuracy * 100) };
    });

  // Sort by weakness score descending (weakest first)
  scored.sort((a, b) => b.score - a.score);

  // Return top N
  return scored.slice(0, count).map(s => s.question);
}

/**
 * Convenience: load stats and compute weaknesses
 */
export function getWeaknessAnalysis() {
  const questionStats = storage.getQuestionStats();
  const history = storage.getHistory();
  return analyzeWeaknesses(questionStats, history);
}
