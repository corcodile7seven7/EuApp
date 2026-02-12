import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function ProgressCard({ sectionId, label, weight, passScore, totalQuestions, correct, total }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const scaledPass = Math.round((passScore / totalQuestions) * 100);
  const barColor = pct >= scaledPass ? 'bg-pass-green' : pct >= scaledPass - 10 ? 'bg-warn-orange' : 'bg-fail-red';
  const available = ['eu-knowledge', 'digital-skills'].includes(sectionId);

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-200 dark:border-dark-border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{label}</h3>
        {weight > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-gray-400">
            {Math.round(weight * 100)}%
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-2.5 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm font-bold min-w-[3rem] text-right">{total > 0 ? `${pct}%` : '—'}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {t('dashboard.pass_threshold')}: {passScore}/{totalQuestions}
        </span>
        {available && (
          <button
            onClick={() => navigate(`/quiz/${sectionId}?mode=practice&num=10`)}
            className="text-xs font-medium text-eu-blue dark:text-eu-yellow hover:underline"
          >
            {t('dashboard.start_quiz')} →
          </button>
        )}
      </div>
    </div>
  );
}
