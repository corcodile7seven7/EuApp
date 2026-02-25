// EU Treaty Family Tree — SVG-based DAG
export default function EUFamilyTree() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Albero Genealogico dell'UE</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Evoluzione delle comunità europee dai trattati fondativi</p>

      {/* SVG Tree */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 overflow-x-auto">
        <svg viewBox="0 0 700 520" className="w-full min-w-[600px]" aria-label="Albero genealogico UE">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#6B7280" />
            </marker>
          </defs>

          {/* ─── Nodes ─── */}
          {/* CECA 1951 */}
          <g>
            <rect x="10" y="20" width="130" height="50" rx="8" fill="#003399" />
            <text x="75" y="40" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">CECA</text>
            <text x="75" y="56" textAnchor="middle" fill="#93C5FD" fontSize="10">Trattato di Parigi 1951</text>
          </g>

          {/* CEE + Euratom 1957 */}
          <g>
            <rect x="180" y="20" width="130" height="50" rx="8" fill="#0056D6" />
            <text x="245" y="38" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">CEE + Euratom</text>
            <text x="245" y="54" textAnchor="middle" fill="#93C5FD" fontSize="10">Trattati di Roma 1957</text>
          </g>

          {/* Fusione 1967 */}
          <g>
            <rect x="95" y="120" width="160" height="50" rx="8" fill="#7C3AED" />
            <text x="175" y="140" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Istituzioni unificate</text>
            <text x="175" y="156" textAnchor="middle" fill="#C4B5FD" fontSize="10">Trattato di Fusione 1967</text>
          </g>

          {/* AUE 1987 */}
          <g>
            <rect x="95" y="220" width="160" height="50" rx="8" fill="#059669" />
            <text x="175" y="240" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Comunità Europee</text>
            <text x="175" y="256" textAnchor="middle" fill="#6EE7B7" fontSize="10">AUE — Mercato Unico 1987</text>
          </g>

          {/* UE — 3 pilastri Maastricht */}
          <g>
            <rect x="30" y="320" width="290" height="60" rx="8" fill="#D97706" />
            <text x="175" y="342" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">UE — Trattato di Maastricht 1993</text>
            <text x="80" y="364" textAnchor="middle" fill="#FDE68A" fontSize="9">I Pilastro</text>
            <text x="175" y="364" textAnchor="middle" fill="#FDE68A" fontSize="9">II Pilastro</text>
            <text x="270" y="364" textAnchor="middle" fill="#FDE68A" fontSize="9">III Pilastro</text>
          </g>

          {/* 3 Pillars labels */}
          <g>
            <rect x="10" y="395" width="110" height="40" rx="6" fill="#F59E0B" opacity="0.8" />
            <text x="65" y="410" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">CE (ex CEE)</text>
            <text x="65" y="424" textAnchor="middle" fill="#FDE68A" fontSize="7">Diritto comunitario</text>

            <rect x="120" y="395" width="110" height="40" rx="6" fill="#F59E0B" opacity="0.8" />
            <text x="175" y="410" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">PESC</text>
            <text x="175" y="424" textAnchor="middle" fill="#FDE68A" fontSize="7">Politica estera</text>

            <rect x="230" y="395" width="110" height="40" rx="6" fill="#F59E0B" opacity="0.8" />
            <text x="285" y="410" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">GAI</text>
            <text x="285" y="424" textAnchor="middle" fill="#FDE68A" fontSize="7">Giustizia e Affari Interni</text>
          </g>

          {/* Amsterdam + Nizza */}
          <g>
            <rect x="10" y="450" width="130" height="50" rx="8" fill="#DC2626" />
            <text x="75" y="469" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Amsterdam</text>
            <text x="75" y="483" textAnchor="middle" fill="#FCA5A5" fontSize="9">1999</text>
          </g>
          <g>
            <rect x="150" y="450" width="130" height="50" rx="8" fill="#0891B2" />
            <text x="215" y="469" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Nizza</text>
            <text x="215" y="483" textAnchor="middle" fill="#BAE6FD" fontSize="9">2003</text>
          </g>

          {/* Lisbona — final */}
          <g>
            <rect x="380" y="320" width="290" height="130" rx="8" fill="#16A34A" />
            <text x="525" y="345" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">UE post-Lisbona</text>
            <text x="525" y="363" textAnchor="middle" fill="#86EFAC" fontSize="10">Trattato di Lisbona 2009</text>
            <line x1="390" y1="380" x2="660" y2="380" stroke="#86EFAC" strokeWidth="1" strokeDasharray="4,4" />
            <text x="420" y="398" fill="#D1FAE5" fontSize="9">✓ Abolisce i 3 pilastri</text>
            <text x="420" y="414" fill="#D1FAE5" fontSize="9">✓ Presidente stabile Consiglio Europeo</text>
            <text x="420" y="430" fill="#D1FAE5" fontSize="9">✓ Alto Rappresentante PESC</text>
            <text x="420" y="446" fill="#D1FAE5" fontSize="9">✓ Carta Diritti Fondamentali vincolante</text>
          </g>

          {/* ─── Arrows ─── */}
          {/* CECA → Fusione */}
          <line x1="75" y1="70" x2="145" y2="120" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow)" />
          {/* CEE → Fusione */}
          <line x1="245" y1="70" x2="205" y2="120" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow)" />
          {/* Fusione → AUE */}
          <line x1="175" y1="170" x2="175" y2="220" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow)" />
          {/* AUE → Maastricht */}
          <line x1="175" y1="270" x2="175" y2="320" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow)" />
          {/* Maastricht → Pilastri */}
          <line x1="80" y1="380" x2="65" y2="395" stroke="#6B7280" strokeWidth="1" markerEnd="url(#arrow)" />
          <line x1="175" y1="380" x2="175" y2="395" stroke="#6B7280" strokeWidth="1" markerEnd="url(#arrow)" />
          <line x1="270" y1="380" x2="285" y2="395" stroke="#6B7280" strokeWidth="1" markerEnd="url(#arrow)" />
          {/* Maastricht → Amsterdam */}
          <line x1="120" y1="380" x2="75" y2="450" stroke="#6B7280" strokeWidth="1" markerEnd="url(#arrow)" />
          {/* Amsterdam → Nizza */}
          <line x1="140" y1="470" x2="150" y2="470" stroke="#6B7280" strokeWidth="1" markerEnd="url(#arrow)" />
          {/* Nizza → Lisbona */}
          <line x1="280" y1="460" x2="380" y2="400" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow)" />
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {[
          { color: '#003399', label: 'CECA (carbone e acciaio)' },
          { color: '#0056D6', label: 'CEE + Euratom (Roma)' },
          { color: '#7C3AED', label: 'Fusione istituzionale' },
          { color: '#059669', label: 'Atto Unico Europeo' },
          { color: '#D97706', label: 'Nascita UE (Maastricht)' },
          { color: '#16A34A', label: 'UE moderna (Lisbona)' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
