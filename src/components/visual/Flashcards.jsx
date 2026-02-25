import { useState } from 'react';
import { VISUAL_REGISTRY, FLASHCARD_LIST } from '../../data/visual-registry';

export default function Flashcards() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const cards = FLASHCARD_LIST.filter((id) => VISUAL_REGISTRY[id]);
  const total = cards.length;
  const currentId = cards[currentIdx];
  const card = VISUAL_REGISTRY[currentId];

  const goNext = () => {
    setFlipped(false);
    setCurrentIdx((i) => (i + 1) % total);
  };

  const goPrev = () => {
    setFlipped(false);
    setCurrentIdx((i) => (i - 1 + total) % total);
  };

  const handleFlip = () => setFlipped((f) => !f);

  if (!card) return null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Flashcard Visive</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {currentIdx + 1} / {total} — Tocca la carta per girarla
      </p>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200 dark:bg-dark-border rounded-full mb-6">
        <div
          className="h-full rounded-full bg-eu-blue dark:bg-eu-yellow transition-all"
          style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card */}
      <div
        className="relative w-full cursor-pointer select-none"
        style={{ perspective: '1000px', height: '280px' }}
        onClick={handleFlip}
      >
        <div
          className="absolute inset-0 transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border-2 border-eu-blue/30 dark:border-eu-yellow/30 bg-white dark:bg-dark-surface flex flex-col items-center justify-center p-6 shadow-lg"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {card.imageUrl && (
              <img
                src={card.imageUrl}
                alt={card.title}
                className="w-full max-h-28 object-cover rounded-xl mb-3"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            {!card.imageUrl && (
              <span className="text-6xl mb-4">{card.fallbackEmoji}</span>
            )}
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white">{card.title}</h3>
            <p className="text-2xl font-bold text-eu-blue dark:text-eu-yellow mt-2">{card.year}</p>
            <p className="text-xs text-gray-400 mt-4">Tocca per girare →</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border-2 border-eu-blue/30 dark:border-eu-yellow/30 bg-gradient-to-br from-eu-blue/5 to-purple-50 dark:from-dark-surface dark:to-dark-border flex flex-col justify-center p-5 shadow-lg overflow-auto"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <h3 className="text-base font-bold text-eu-blue dark:text-eu-yellow mb-3">{card.title}</h3>
            <ul className="space-y-2 mb-3">
              {card.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-eu-blue dark:bg-eu-yellow flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="p-2.5 rounded-lg bg-eu-blue/10 dark:bg-eu-yellow/10 text-xs italic text-gray-600 dark:text-gray-400">
              <span className="font-semibold not-italic text-eu-blue dark:text-eu-yellow">Mnemonica: </span>
              {card.mnemo}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={goPrev}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-surface transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Precedente
        </button>

        <button
          onClick={handleFlip}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-eu-blue dark:bg-eu-yellow text-white dark:text-dark-bg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {flipped ? 'Mostra fronte' : 'Mostra retro'}
        </button>

        <button
          onClick={goNext}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-surface transition-colors text-sm font-medium"
        >
          Successiva
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-3">
        Carta {currentIdx + 1} di {total}
      </p>
    </div>
  );
}
