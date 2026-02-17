import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    return DATA[section] || [];
  }, [section, isAll, isMixed]);

  const questions = useMemo(() => {
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
  }, [allQuestions, numQ, isWeak, section, isSpecial, isMixed, isAll]);

  const passScore = isSpecial
    ? Math.round(questions.length * 0.65)
    : (cfg?.passScore || 10);

  const quiz = useQuiz(questions, {
    sectionId: section,
    passScore,
  });

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

  // Detect if current question is abstract (for mixed/all modes)
  const isAbstractQuestion = isAbstract || (q && (q.sequence || q.matrix) && q.options_shapes);
  const CardComponent = isAbstractQuestion ? AbstractQuestionCard : QuestionCard;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {t('quiz.question')} {quiz.current + 1} {t('quiz.of')} {questions.length}
        </span>
        {isExam && <Timer seconds={timer.seconds} pct={timer.pct} />}
      </div>

      {/* Progress bar */}
      <div className="flex gap-0.5 mb-4">
        {questions.map((_, i) => {
          let color = 'bg-gray-200 dark:bg-dark-border';
          if (i === quiz.current) color = 'bg-eu-blue';
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

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 gap-2">
        <button
          onClick={handlePrev}
          disabled={quiz.current === 0}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-200 dark:bg-dark-surface text-gray-700 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-300 dark:hover:bg-dark-border transition-colors min-h-[44px]"
        >
          {t('quiz.previous')}
        </button>

        <button
          onClick={() => quiz.toggleFlag(quiz.current)}
          className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
            isFlagged ? 'bg-eu-yellow text-eu-blue-dark' : 'bg-gray-200 dark:bg-dark-surface text-gray-500 dark:text-gray-400'
          }`}
        >
          {isFlagged ? t('quiz.flagged') : t('quiz.flag')}
        </button>

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
