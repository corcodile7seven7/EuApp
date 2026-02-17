/**
 * Abstract Reasoning question card with SVG shape rendering.
 * Replaces QuestionCard for abstract-reasoning section.
 */
import { useLanguage } from '../../context/LanguageContext';
import ShapeRenderer, { ShapeSequence, ShapeMatrix } from './ShapeRenderer';

const optionLabels = ['A', 'B', 'C', 'D'];

export default function AbstractQuestionCard({ question, selected, onSelect, showFeedback, practice }) {
  const { quizLang } = useLanguage();
  const qText = quizLang === 'en' ? question.question_en : question.question_it;
  const showResult = practice && selected !== undefined && selected !== -1;

  return (
    <div className="space-y-4">
      {/* Question text */}
      <p className="text-base font-medium leading-relaxed">{qText}</p>

      {/* Shape sequence or matrix */}
      {question.matrix ? (
        <div className="flex justify-center p-4 bg-gray-100 dark:bg-dark-surface rounded-xl border-2 border-gray-200 dark:border-dark-border">
          <ShapeMatrix matrix={question.matrix} />
        </div>
      ) : question.sequence ? (
        <div className="p-4 bg-gray-100 dark:bg-dark-surface rounded-xl border-2 border-gray-200 dark:border-dark-border">
          <ShapeSequence shapes={question.sequence} />
        </div>
      ) : null}

      {/* Shape options */}
      <div className="grid grid-cols-2 gap-3">
        {question.options_shapes?.map((shape, i) => {
          const isSelected = selected === i;
          const isCorrect = i === question.correct;

          let className = 'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer min-h-[80px] ';

          if (showResult || showFeedback) {
            if (isCorrect) {
              className += 'border-pass-green bg-green-50 dark:bg-green-900/20 ';
              if (isSelected) className += 'animate-correct ';
            } else if (isSelected && !isCorrect) {
              className += 'border-fail-red bg-red-50 dark:bg-red-900/20 animate-incorrect ';
            } else {
              className += 'border-gray-200 dark:border-dark-border opacity-60 ';
            }
          } else if (isSelected) {
            className += 'border-eu-blue bg-blue-50 dark:bg-blue-900/20 ';
          } else {
            className += 'border-gray-200 dark:border-dark-border hover:border-eu-blue/50 hover:bg-gray-50 dark:hover:bg-dark-surface ';
          }

          return (
            <button
              key={i}
              onClick={() => !showFeedback && onSelect(i)}
              disabled={showFeedback}
              className={className}
            >
              <span className={`text-xs font-bold ${
                isSelected ? 'text-eu-blue dark:text-eu-yellow' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {optionLabels[i]}
              </span>
              <ShapeRenderer shape={shape} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
