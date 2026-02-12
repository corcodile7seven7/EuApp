import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const EXAM_DATE = new Date('2026-03-10T09:00:00+01:00');

export default function Countdown() {
  const { t } = useLanguage();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const diff = EXAM_DATE.getTime() - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  return (
    <div className="bg-eu-blue text-white rounded-2xl p-5">
      <p className="text-sm opacity-80 mb-2">{t('dashboard.exam_countdown')}</p>
      <div className="flex gap-4 items-baseline">
        <div className="text-center">
          <span className="text-3xl font-bold">{days}</span>
          <p className="text-xs opacity-70">{t('dashboard.days')}</p>
        </div>
        <div className="text-center">
          <span className="text-3xl font-bold">{hours}</span>
          <p className="text-xs opacity-70">{t('dashboard.hours')}</p>
        </div>
        <div className="text-center">
          <span className="text-3xl font-bold">{minutes}</span>
          <p className="text-xs opacity-70">{t('dashboard.minutes')}</p>
        </div>
      </div>
      <p className="text-xs opacity-60 mt-2">EPSO/AD/427/26 — 10 marzo 2026</p>
    </div>
  );
}
