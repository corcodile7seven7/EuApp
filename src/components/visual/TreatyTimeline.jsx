import { useState } from 'react';
import { VISUAL_REGISTRY, TREATY_SEQUENCE } from '../../data/visual-registry';

const treatyColors = {
  'treaty-paris': '#003399',
  'treaty-rome': '#0056D6',
  'treaty-merger': '#7C3AED',
  'treaty-singleact': '#059669',
  'treaty-maastricht': '#D97706',
  'treaty-amsterdam': '#DC2626',
  'treaty-nice': '#0891B2',
  'treaty-lisbon': '#16A34A',
};

export default function TreatyTimeline() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Cronologia dei Trattati UE</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Clicca su ogni nodo per espandere i dettagli</p>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-dark-border" />

        <div className="space-y-4">
          {TREATY_SEQUENCE.map((id) => {
            const treaty = VISUAL_REGISTRY[id];
            const isOpen = expanded === id;
            const color = treatyColors[id] || '#003399';

            return (
              <div key={id} className="relative pl-16">
                {/* Circle node */}
                <button
                  onClick={() => setExpanded(isOpen ? null : id)}
                  className="absolute left-2 top-3 w-8 h-8 rounded-full border-4 border-white dark:border-dark-bg flex items-center justify-center text-white font-bold text-xs shadow-md transition-transform hover:scale-110 focus:outline-none"
                  style={{ backgroundColor: color }}
                  aria-label={`Toggle ${treaty.title}`}
                >
                  {treaty.year}
                </button>

                {/* Card */}
                <div
                  className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setExpanded(isOpen ? null : id)}
                >
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: color }}
                      >
                        {treaty.year}
                      </span>
                      <h3 className="font-semibold text-gray-900 dark:text-white mt-1">{treaty.title}</h3>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-dark-border pt-3">
                      {/* Wikimedia image */}
                      {treaty.imageUrl && (
                        <img
                          src={treaty.imageUrl}
                          alt={treaty.title}
                          className="w-full max-h-40 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      )}
                      <div
                        className="w-full h-24 rounded-lg items-center justify-center text-5xl hidden"
                        style={{ backgroundColor: color + '20' }}
                      >
                        {treaty.fallbackEmoji}
                      </div>

                      {/* Bullets */}
                      <ul className="space-y-1.5">
                        {treaty.bullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                            {b}
                          </li>
                        ))}
                      </ul>

                      {/* Mnemonic */}
                      <div className="p-3 rounded-lg text-sm italic text-gray-600 dark:text-gray-400" style={{ backgroundColor: color + '15' }}>
                        <span className="font-semibold not-italic text-xs uppercase tracking-wide" style={{ color }}>Mnemonica: </span>
                        {treaty.mnemo}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
