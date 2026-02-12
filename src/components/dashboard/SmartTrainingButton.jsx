import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function SmartTrainingButton({ weakestSection }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleClick = () => {
    if (weakestSection) {
      navigate(`/quiz/${weakestSection}?mode=practice&num=10`);
    } else {
      navigate('/quiz');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full py-4 bg-eu-yellow text-eu-blue-dark rounded-2xl font-bold text-lg hover:bg-eu-yellow-light transition-colors flex items-center justify-center gap-2"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      {t('dashboard.smart_training')}
    </button>
  );
}
