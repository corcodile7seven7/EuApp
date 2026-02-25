import { useLanguage } from '../../context/LanguageContext';
import renderMarkdown from '../../utils/renderMarkdown';

const optionLabels = ['A', 'B', 'C', 'D'];

export default function QuestionCard({ question, selected, onSelect, showFeedback, practice }) {
  const { quizLang } = useLanguage();
  const qText = quizLang === 'en' ? question.question_en : question.question_it;
  const showResult = practice && selected !== undefined && selected !== -1;

  return (
    <div className="space-y-4">
      {question.passage_it && (
        <div className="p-4 bg-gray-100 dark:bg-dark-surface rounded-lg text-sm leading-relaxed border-l-4 border-eu-blue">
          {renderMarkdown(quizLang === 'en' ? question.passage_en : question.passage_it)}
        </div>
      )}
      <div className="text-base font-medium leading-relaxed">{renderMarkdown(qText)}</div>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const optText = quizLang === 'en' ? opt.text_en : opt.text_it;
          const isSelected = selected === i;
          const isCorrect = i === question.correct;

          let className = 'flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer min-h-[44px] ';

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
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                isSelected ? 'bg-eu-blue text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-300'
              }`}>
                {optionLabels[i]}
              </span>
              <span className="text-sm text-left">{renderMarkdown(optText)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
