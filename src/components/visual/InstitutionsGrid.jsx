import { useState } from 'react';
import { VISUAL_REGISTRY, INSTITUTION_LIST } from '../../data/visual-registry';

const institutionColors = {
  'institution-ep': '#003399',
  'institution-european-council': '#D97706',
  'institution-council-eu': '#0891B2',
  'institution-commission': '#7C3AED',
  'institution-cjeu': '#059669',
  'institution-ecb': '#DC2626',
  'institution-eca': '#6B7280',
};

export default function InstitutionsGrid() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Le Istituzioni dell'UE</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Clicca su una carta per i dettagli</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {INSTITUTION_LIST.map((id) => {
          const inst = VISUAL_REGISTRY[id];
          const color = institutionColors[id] || '#003399';
          const isSelected = selected === id;

          return (
            <button
              key={id}
              onClick={() => setSelected(isSelected ? null : id)}
              className={`rounded-xl border-2 p-4 text-center transition-all ${
                isSelected
                  ? 'shadow-lg'
                  : 'border-gray-200 dark:border-dark-border hover:shadow-md'
              }`}
              style={isSelected ? { borderColor: color } : {}}
            >
              <span className="text-3xl block mb-2">{inst.fallbackEmoji}</span>
              <p
                className="text-xs font-semibold leading-tight"
                style={{ color: isSelected ? color : undefined }}
              >
                {inst.title}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">est. {inst.year}</p>
            </button>
          );
        })}
      </div>

      {/* Expanded detail panel */}
      {selected && (() => {
        const inst = VISUAL_REGISTRY[selected];
        const color = institutionColors[selected] || '#003399';
        return (
          <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: color }}>
            <div className="p-3 flex items-center justify-between" style={{ backgroundColor: color }}>
              <h3 className="text-white font-bold text-sm">{inst.title}</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-white/80 hover:text-white"
                aria-label="Chiudi"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 bg-white dark:bg-dark-surface space-y-3">
              {/* Image */}
              {inst.imageUrl && (
                <img
                  src={inst.imageUrl}
                  alt={inst.title}
                  className="w-full max-h-40 object-cover rounded-lg"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}

              {/* Bullets */}
              <ul className="space-y-2">
                {inst.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Mnemonic */}
              <div className="p-3 rounded-lg text-sm italic text-gray-600 dark:text-gray-400" style={{ backgroundColor: color + '15' }}>
                <span className="font-semibold not-italic text-xs uppercase tracking-wide" style={{ color }}>Mnemonica: </span>
                {inst.mnemo}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Quick reference table */}
      <div className="mt-4 rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="bg-gray-50 dark:bg-dark-border px-4 py-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Riferimento rapido — Sedi</p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-dark-border">
          {[
            { name: 'Parlamento Europeo', seat: 'Strasburgo (plenarie)', icon: '🏛️' },
            { name: 'Consiglio Europeo', seat: 'Bruxelles', icon: '🎯' },
            { name: 'Consiglio UE', seat: 'Bruxelles', icon: '🤝' },
            { name: 'Commissione Europea', seat: 'Bruxelles (Berlaymont)', icon: '⚙️' },
            { name: 'Corte di Giustizia', seat: 'Lussemburgo', icon: '⚖️' },
            { name: 'BCE', seat: 'Francoforte', icon: '🏦' },
            { name: 'Corte dei Conti', seat: 'Lussemburgo', icon: '🔍' },
          ].map((row) => (
            <div key={row.name} className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{row.icon}</span>
                <span className="text-xs text-gray-700 dark:text-gray-300">{row.name}</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{row.seat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
