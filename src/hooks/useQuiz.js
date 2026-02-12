import { useState, useCallback, useRef, useEffect } from 'react';
import { storage } from '../utils/storage';

export function useQuiz(questions, { sectionId, passScore }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [finished, setFinished] = useState(false);
  const startTimeRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const answer = useCallback((questionIdx, optionIdx) => {
    setAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
  }, []);

  const toggleFlag = useCallback((idx) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const goTo = useCallback((idx) => {
    if (idx >= 0 && idx < questions.length) setCurrent(idx);
  }, [questions.length]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  const finish = useCallback(() => {
    const elapsed = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000);
    const results = questions.map((q, i) => {
      const selected = answers[i] ?? -1;
      return {
        questionId: q.id,
        selected,
        correct: selected === q.correct,
        category: q.category,
      };
    });
    const score = results.filter(r => r.correct).length;
    const result = {
      section: sectionId,
      score,
      total: questions.length,
      passed: score >= passScore,
      elapsed,
      answers: results,
    };
    storage.addResult(result);
    setFinished(true);
    return result;
  }, [questions, answers, sectionId, passScore]);

  return {
    current,
    answers,
    flagged,
    finished,
    answer,
    toggleFlag,
    goTo,
    next,
    prev,
    finish,
    total: questions.length,
  };
}
