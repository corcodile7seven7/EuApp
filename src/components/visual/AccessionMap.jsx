// Accession Map — card-based display of EU enlargement waves
const waves = [
  {
    year: '1951/1957',
    label: 'Fondatori',
    color: '#003399',
    bg: 'bg-[#003399]',
    countries: ['🇫🇷 Francia', '🇩🇪 Germania', '🇮🇹 Italia', '🇧🇪 Belgio', '🇳🇱 Olanda', '🇱🇺 Lussemburgo'],
    note: 'CECA (1951) + CEE (1957)',
  },
  {
    year: '1973',
    label: '1° Allargamento',
    color: '#0891B2',
    bg: 'bg-[#0891B2]',
    countries: ['🇬🇧 Regno Unito*', '🇮🇪 Irlanda', '🇩🇰 Danimarca'],
    note: '*UK uscita Brexit 31/01/2020',
  },
  {
    year: '1981-1986',
    label: 'Europa del Sud',
    color: '#059669',
    bg: 'bg-[#059669]',
    countries: ['🇬🇷 Grecia (1981)', '🇪🇸 Spagna (1986)', '🇵🇹 Portogallo (1986)'],
    note: 'Post-dittature militari',
  },
  {
    year: '1995',
    label: 'Paesi neutrali',
    color: '#7C3AED',
    bg: 'bg-[#7C3AED]',
    countries: ['🇦🇹 Austria', '🇫🇮 Finlandia', '🇸🇪 Svezia'],
    note: 'Ex-neutrali Guerra Fredda',
  },
  {
    year: '2004',
    label: 'Big Bang (10 paesi)',
    color: '#D97706',
    bg: 'bg-[#D97706]',
    countries: [
      '🇵🇱 Polonia', '🇭🇺 Ungheria', '🇨🇿 Repubblica Ceca',
      '🇸🇰 Slovacchia', '🇸🇮 Slovenia', '🇪🇪 Estonia',
      '🇱🇻 Lettonia', '🇱🇹 Lituania', '🇨🇾 Cipro', '🇲🇹 Malta',
    ],
    note: 'Più grande allargamento nella storia UE',
  },
  {
    year: '2007',
    label: 'Est europeo',
    color: '#DC2626',
    bg: 'bg-[#DC2626]',
    countries: ['🇧🇬 Bulgaria', '🇷🇴 Romania'],
    note: 'Portano l\'UE a 27 paesi',
  },
  {
    year: '2013',
    label: 'Ultimo ingresso',
    color: '#16A34A',
    bg: 'bg-[#16A34A]',
    countries: ['🇭🇷 Croazia'],
    note: 'Stato membro più recente (attuale: 27 stati)',
  },
  {
    year: '2022-2024',
    label: 'Candidati attivi',
    color: '#6B7280',
    bg: 'bg-[#6B7280]',
    countries: ['🇺🇦 Ucraina (cand. 2022, neg. 2024)', '🇲🇩 Moldova (cand. 2022, neg. 2024)', '🇦🇱 Albania', '🇷🇸 Serbia', '🇲🇪 Montenegro', '🇲🇰 Macedonia del Nord', '🇧🇦 Bosnia Erzegovina'],
    note: 'Nessun ingresso previsto prima del 2030',
  },
];

export default function AccessionMap() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Mappa delle Adesioni UE</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Dall'Europa dei 6 (1951) ai 27 stati attuali + candidati
      </p>

      {/* Summary bar */}
      <div className="flex rounded-full overflow-hidden h-4 mb-6">
        {waves.slice(0, -1).map((w) => (
          <div
            key={w.year}
            className="h-full"
            style={{
              backgroundColor: w.color,
              flex: w.countries.length,
            }}
            title={`${w.year}: ${w.countries.length} paesi`}
          />
        ))}
      </div>

      <div className="space-y-4">
        {waves.map((wave) => (
          <div key={wave.year} className="rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            <div className={`${wave.bg} px-4 py-2.5 flex items-center justify-between`}>
              <div>
                <span className="text-white font-bold text-sm">{wave.year}</span>
                <span className="text-white/80 text-xs ml-2">— {wave.label}</span>
              </div>
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                {wave.countries.length} {wave.countries.length === 1 ? 'paese' : 'paesi'}
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-dark-surface">
              <div className="flex flex-wrap gap-2 mb-2">
                {wave.countries.map((c) => (
                  <span
                    key={c}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
              {wave.note && (
                <p className="text-xs italic text-gray-500 dark:text-gray-400">{wave.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total count */}
      <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-eu-blue/20 text-center">
        <p className="text-2xl font-bold text-eu-blue dark:text-eu-yellow">27</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Stati Membri attuali (post-Brexit 2020)</p>
      </div>
    </div>
  );
}
