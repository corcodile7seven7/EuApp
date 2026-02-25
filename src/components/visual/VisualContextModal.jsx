import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VISUAL_REGISTRY } from '../../data/visual-registry';

export default function VisualContextModal({ visualId }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const entry = VISUAL_REGISTRY[visualId];
  if (!entry) return null;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-xl text-sm font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors flex items-center justify-center gap-2"
      >
        <span>🖼️</span>
        <span>Contesto visivo</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal panel */}
          <div className="relative w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden">
            {/* Image */}
            {entry.imageUrl && (
              <img
                src={entry.imageUrl}
                alt={entry.title}
                className="w-full max-h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }}
              />
            )}
            {/* Emoji fallback (hidden by default unless image errors) */}
            <div
              className="w-full h-32 bg-gradient-to-br from-eu-blue/10 to-purple-50 dark:from-dark-border dark:to-dark-bg items-center justify-center text-6xl"
              style={{ display: entry.imageUrl ? 'none' : 'flex' }}
            >
              {entry.fallbackEmoji}
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{entry.title}</h3>
                  <span className="text-2xl font-bold text-eu-blue dark:text-eu-yellow">{entry.year}</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                  aria-label="Chiudi"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Bullets */}
              <ul className="space-y-2 mb-3">
                {entry.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-eu-blue dark:bg-eu-yellow flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Mnemonic */}
              <div className="p-3 rounded-xl bg-eu-blue/5 dark:bg-eu-yellow/5 text-sm italic text-gray-600 dark:text-gray-400 mb-4">
                <span className="font-semibold not-italic text-eu-blue dark:text-eu-yellow text-xs uppercase tracking-wide">Mnemonica: </span>
                {entry.mnemo}
              </div>

              {/* CTA */}
              <button
                onClick={() => { setOpen(false); navigate('/visual'); }}
                className="w-full py-2.5 rounded-xl bg-eu-blue text-white font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Vedi nella pagina visiva
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
