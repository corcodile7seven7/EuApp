import { VISUAL_REGISTRY, CURRENT_EVENTS_LIST } from '../../data/visual-registry';

const categoryColors = {
  'current-ep-elections': { bg: '#003399', badge: 'Elezioni 2024' },
  'current-ai-act': { bg: '#7C3AED', badge: 'AI Act' },
  'current-cbam': { bg: '#059669', badge: 'CBAM' },
  'current-dsa': { bg: '#0891B2', badge: 'DSA' },
  'current-dma': { bg: '#0891B2', badge: 'DMA' },
  'current-enlargement': { bg: '#D97706', badge: 'Allargamento' },
  'current-migration-pact': { bg: '#DC2626', badge: 'Migrazione' },
  'current-mff': { bg: '#16A34A', badge: 'Bilancio MFF' },
};

export default function CurrentEventsTab() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Attualità UE 2024-25</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Le novità più importanti — tema caldo nei concorsi EPSO
      </p>

      <div className="space-y-4">
        {CURRENT_EVENTS_LIST.map((id) => {
          const item = VISUAL_REGISTRY[id];
          const meta = categoryColors[id] || { bg: '#6B7280', badge: 'Attualità' };

          return (
            <div key={id} className="rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: meta.bg }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.fallbackEmoji}</span>
                  <div>
                    <p className="text-white font-bold text-sm">{item.title}</p>
                    <p className="text-white/70 text-xs">{item.year}</p>
                  </div>
                </div>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  EPSO HOT
                </span>
              </div>

              {/* Content */}
              <div className="p-4 bg-white dark:bg-dark-surface">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full max-h-32 object-cover rounded-lg mb-3"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}

                <ul className="space-y-1.5 mb-3">
                  {item.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta.bg }} />
                      {b}
                    </li>
                  ))}
                </ul>

                <div
                  className="p-3 rounded-lg text-xs italic text-gray-600 dark:text-gray-400"
                  style={{ backgroundColor: meta.bg + '15' }}
                >
                  <span
                    className="font-semibold not-italic uppercase tracking-wide"
                    style={{ color: meta.bg }}
                  >
                    Mnemonica:{' '}
                  </span>
                  {item.mnemo}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA to quiz */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#003399] to-[#7C3AED] text-white text-center">
        <p className="font-bold text-sm mb-1">Pronto a testare le tue conoscenze?</p>
        <p className="text-xs text-white/70">
          Vai su <strong>Quiz → Attualità 2024-25</strong> per esercitarti con 31 domande EPSO-style
        </p>
      </div>
    </div>
  );
}
