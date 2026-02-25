import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useQuiz } from '../../hooks/useQuiz';
import { useTimer } from '../../hooks/useTimer';
import { SECTIONS } from '../../utils/scoring';
import QuestionCard from './QuestionCard';
import AbstractQuestionCard from '../abstract/AbstractQuestionCard';
import QuizResults from './QuizResults';
import EnhancedExplanation from './EnhancedExplanation';
import Timer from './Timer';
import { storage } from '../../utils/storage';
import { getWeakQuestionsForSection } from '../../utils/weakness';
import { getGeneratedQuestions } from '../../utils/questionStorage';

import euKnowledge from '../../data/eu-knowledge.json';
import digitalSkills from '../../data/digital-skills.json';
import verbalReasoning from '../../data/verbal-reasoning.json';
import numericalReasoning from '../../data/numerical-reasoning.json';
import abstractReasoning from '../../data/abstract-reasoning.json';
import temporal from '../../data/temporal.json';
import euInstitutions from '../../data/eu-institutions.json';
import acronyms from '../../data/acronyms.json';
import situational from '../../data/situational.json';
import itAdvanced from '../../data/it-advanced.json';
import currentEvents from '../../data/current-events.json';

const DATA = {
  'eu-knowledge': euKnowledge,
  'digital-skills': digitalSkills,
  'verbal-reasoning': verbalReasoning,
  'numerical-reasoning': numericalReasoning,
  'abstract-reasoning': abstractReasoning,
  'temporal': temporal,
  'eu-institutions': euInstitutions,
  'acronyms': acronyms,
  'situational': situational,
  'it-advanced': itAdvanced,
  'current-events': currentEvents,
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getAllQuestions() {
  return Object.values(DATA).flat();
}

// ── Outer shell: draft detection ──────────────────────────────────────────────
export default function QuizEngine() {
  const { section } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const mode = searchParams.get('mode') || 'practice';
  const numQ = parseInt(searchParams.get('num') || '0', 10);
  const isWeak = searchParams.get('weak') === 'true';
  const isExam = mode === 'exam';

  const isAll = section === 'all';
  const isMixed = section === 'mixed';
  const isSpecial = isAll || isMixed;
  const isAbstract = section === 'abstract-reasoning';

  const cfg = isSpecial ? null : SECTIONS[section];
  const timePerQ = isSpecial ? 70 : (cfg?.timePerQuestion || 60);

  const allQuestions = useMemo(() => {
    if (isAll || isMixed) return getAllQuestions();
    const base = DATA[section] || [];
    const generated = getGeneratedQuestions(section);
    return generated.length > 0 ? [...base, ...generated] : base;
  }, [section, isAll, isMixed]);

  // Draft detection (read once at mount)
  const [storedDraft] = useState(() => storage.getDraft(section));
  const [draftDecision, setDraftDecision] = useState(null); // null=pending, 'resume', 'fresh'

  const isDraftValid = useMemo(() => {
    if (!storedDraft?.questionIds?.length) return false;
    const ids = new Set(allQuestions.map(q => q.id));
    return storedDraft.questionIds.every(id => ids.has(id));
  }, [storedDraft, allQuestions]);

  // Compute the effective question list
  const questions = useMemo(() => {
    if (draftDecision === 'resume' && isDraftValid) {
      const questionMap = new Map(allQuestions.map(q => [q.id, q]));
      const restored = storedDraft.questionIds.map(id => questionMap.get(id)).filter(Boolean);
      if (restored.length > 0) return restored;
    }
    if (isWeak && !isSpecial) {
      const questionStats = storage.getQuestionStats();
      const weakQs = getWeakQuestionsForSection(section, questionStats, allQuestions, numQ || 20);
      return weakQs.length > 0 ? weakQs : shuffleArray(allQuestions).slice(0, numQ || 20);
    }
    if (isMixed) {
      const shuffled = shuffleArray(allQuestions);
      return numQ > 0 ? shuffled.slice(0, numQ) : shuffled;
    }
    if (isAll) {
      return numQ > 0 ? allQuestions.slice(0, numQ) : allQuestions;
    }
    const shuffled = shuffleArray(allQuestions);
    return numQ > 0 ? shuffled.slice(0, numQ) : shuffled;
  }, [allQuestions, numQ, isWeak, section, isSpecial, isMixed, isAll, draftDecision, isDraftValid, storedDraft]);

  const passScore = isSpecial
    ? Math.round(questions.length * 0.65)
    : (cfg?.passScore || 10);

  if (!isSpecial && (!cfg || !allQuestions.length)) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">{t('common.error')}</p>
        <button onClick={() => navigate('/quiz')} className="mt-4 px-4 py-2 bg-eu-blue text-white rounded-lg">
          {t('quiz.back_to_quiz')}
        </button>
      </div>
    );
  }

  // Show draft dialog before rendering the quiz core
  if (isDraftValid && draftDecision === null) {
    const savedAt = storedDraft.savedAt ? new Date(storedDraft.savedAt) : null;
    const timeStr = savedAt ? savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const dateStr = savedAt ? savedAt.toLocaleDateString() : '';
    const resumeQuestion = (storedDraft.current ?? 0) + 1;
    const totalQ = storedDraft.questionIds.length;

    return (
      <div className="max-w-2xl mx-auto p-4 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-6 w-full max-w-sm border border-gray-200 dark:border-dark-border">
          <div className="text-3xl text-center mb-3">💾</div>
          <h2 className="text-lg font-bold text-center mb-1 text-gray-800 dark:text-gray-100">
            Quiz salvato trovato
          </h2>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
            Domanda {resumeQuestion} di {totalQ} · {dateStr} {timeStr}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setDraftDecision('resume')}
              className="w-full py-3 rounded-xl bg-eu-blue text-white font-medium hover:bg-eu-blue-light transition-colors"
            >
              Riprendi da domanda {resumeQuestion}
            </button>
            <button
              onClick={() => { storage.clearDraft(section); setDraftDecision('fresh'); }}
              className="w-full py-3 rounded-xl bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-dark-surface transition-colors"
            >
              Ricomincia da capo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const effectiveInitialDraft = draftDecision === 'resume' ? storedDraft : null;

  return (
    <QuizEngineCore
      key={draftDecision ?? 'nodraft'}
      questions={questions}
      initialDraft={effectiveInitialDraft}
      section={section}
      mode={mode}
      numQ={numQ}
      isExam={isExam}
      isAbstract={isAbstract}
      timePerQ={timePerQ}
      passScore={passScore}
      t={t}
      navigate={navigate}
    />
  );
}

// ── Inner core: quiz state + UI ────────────────────────────────────────────────
function QuizEngineCore({ questions, initialDraft, section, mode, numQ, isExam, isAbstract, timePerQ, passScore, t, navigate }) {
  const quiz = useQuiz(questions, { sectionId: section, passScore, initialDraft });

  const handleFinishRef = useRef(null);

  const timer = useTimer(isExam ? timePerQ : 0, {
    onExpire: () => {
      if (quiz.current < questions.length - 1) {
        quiz.next();
      } else {
        handleFinishRef.current?.();
      }
    },
    autoStart: isExam,
  });

  const [result, setResult] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleFinish = useCallback(() => {
    const r = quiz.finish();
    setResult(r);
  }, [quiz]);

  useEffect(() => {
    handleFinishRef.current = handleFinish;
  }, [handleFinish]);

  // Reset timer when moving to next question in exam mode
  const currentQ = quiz.current;
  useEffect(() => {
    if (isExam && timePerQ) {
      timer.reset(timePerQ);
      timer.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ]);

  const handleAnswer = useCallback((optionIdx) => {
    quiz.answer(quiz.current, optionIdx);
    if (!isExam) {
      setShowExplanation(true);
    }
  }, [quiz, isExam]);

  const handleNext = useCallback(() => {
    setShowExplanation(false);
    if (quiz.current < questions.length - 1) {
      quiz.next();
    } else {
      handleFinish();
    }
  }, [quiz, questions.length, handleFinish]);

  const handlePrev = useCallback(() => {
    setShowExplanation(false);
    quiz.prev();
  }, [quiz]);

  if (result) {
    return (
      <QuizResults
        result={result}
        questions={questions}
        onRetry={() => navigate(`/quiz/${section}?mode=${mode}&num=${numQ}`)}
        onBack={() => navigate('/quiz')}
      />
    );
  }

  const q = questions[quiz.current];
  const currentAnswer = quiz.answers[quiz.current];
  const isFlagged = quiz.flagged.has(quiz.current);
  const currentRating = quiz.ratings[q?.id];

  const isAbstractQuestion = isAbstract || (q && (q.sequence || q.matrix) && q.options_shapes);
  const CardComponent = isAbstractQuestion ? AbstractQuestionCard : QuestionCard;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header bar: arrows + question counter + timer */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrev}
          disabled={quiz.current === 0}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
          aria-label="Domanda precedente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
        </button>

        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t('quiz.question')} {quiz.current + 1} {t('quiz.of')} {questions.length}
        </span>

        <div className="flex items-center gap-2">
          {isExam && <Timer seconds={timer.seconds} pct={timer.pct} />}
          <button
            onClick={handleNext}
            disabled={quiz.current === questions.length - 1 && !showExplanation}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
            aria-label="Domanda successiva"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar with rating colors */}
      <div className="flex gap-0.5 mb-4">
        {questions.map((qItem, i) => {
          const rating = quiz.ratings[qItem.id];
          let color = 'bg-gray-200 dark:bg-dark-border';
          if (rating === 'bad') color = 'bg-fail-red';
          else if (rating === 'good') color = 'bg-pass-green';
          else if (i === quiz.current) color = 'bg-eu-blue';
          else if (quiz.answers[i] !== undefined) color = 'bg-eu-blue/40';
          if (quiz.flagged.has(i)) color += ' ring-2 ring-eu-yellow';
          return (
            <button
              key={i}
              onClick={() => { setShowExplanation(false); quiz.goTo(i); }}
              className={`h-1.5 flex-1 rounded-full ${color} transition-colors`}
              title={`${i + 1}`}
            />
          );
        })}
      </div>

      {/* Question */}
      <CardComponent
        question={q}
        selected={currentAnswer}
        onSelect={handleAnswer}
        showFeedback={showExplanation}
        practice={!isExam}
      />

      {/* Explanation in practice mode */}
      {showExplanation && (
        <EnhancedExplanation
          question={q}
          selectedOption={currentAnswer}
          showDeepDive={true}
        />
      )}

      {/* Bottom bar: flag + ratings + submit/next */}
      <div className="flex items-center justify-between mt-6 gap-2">
        {/* Flag button */}
        <button
          onClick={() => quiz.toggleFlag(quiz.current)}
          className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
            isFlagged ? 'bg-eu-yellow text-eu-blue-dark' : 'bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-border'
          }`}
          title={isFlagged ? t('quiz.flagged') : t('quiz.flag')}
        >
          🚩
        </button>

        {/* Rating buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={() => quiz.rateQuestion(q.id, 'bad')}
            className={`px-3 py-2.5 rounded-xl text-sm transition-colors min-h-[44px] ${
              currentRating === 'bad'
                ? 'bg-fail-red/20 ring-2 ring-fail-red text-fail-red'
                : 'bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
            title="Domanda difficile / da migliorare"
          >
            😢
          </button>
          <button
            onClick={() => quiz.rateQuestion(q.id, 'good')}
            className={`px-3 py-2.5 rounded-xl text-sm transition-colors min-h-[44px] ${
              currentRating === 'good'
                ? 'bg-pass-green/20 ring-2 ring-pass-green text-pass-green'
                : 'bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
            title="Domanda buona / interessante"
          >
            😊
          </button>
        </div>

        {/* Submit / Next */}
        {quiz.current < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-eu-blue text-white hover:bg-eu-blue-light transition-colors min-h-[44px]"
          >
            {t('quiz.next')}
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-pass-green text-white hover:opacity-90 transition-colors min-h-[44px]"
          >
            {t('quiz.submit')}
          </button>
        )}
      </div>
    </div>
  );
}
