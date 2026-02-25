// Visual Registry — maps visualId → visual context data
// Used by VisualContextModal in quiz and by VisualPage tabs
export const VISUAL_REGISTRY = {
  // ── TREATIES ──────────────────────────────────────────────────────────────
  'treaty-paris': {
    title: 'Trattato di Parigi 1951',
    year: 1951,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Treaty_of_Paris_1951.jpg/400px-Treaty_of_Paris_1951.jpg',
    fallbackEmoji: '📜',
    bullets: [
      '6 paesi fondatori: Francia, Germania Ovest, Italia, Belgio, Olanda, Lussemburgo',
      'Istituisce la CECA (Comunità Europea del Carbone e dell\'Acciaio)',
      'Proposto da Robert Schuman il 9 maggio 1950 (Giornata d\'Europa)',
    ],
    mnemo: 'PA-RI-GI → PAce RIconciliaGI → Francia+Germania uniscono Carbone e Acciaio',
  },
  'treaty-rome': {
    title: 'Trattati di Roma 1957',
    year: 1957,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Signing_of_the_Treaty_of_Rome.jpg/400px-Signing_of_the_Treaty_of_Rome.jpg',
    fallbackEmoji: '🏛️',
    bullets: [
      'Firmati il 25 marzo 1957, in vigore 1° gennaio 1958',
      'Creano la CEE (Comunità Economica Europea) e l\'Euratom',
      'Obiettivo: mercato comune, libera circolazione persone, merci, servizi, capitali',
    ],
    mnemo: 'ROMA 57 → CEE + Euratom → 4 libertà fondamentali',
  },
  'treaty-merger': {
    title: 'Trattato di Fusione 1965',
    year: 1967,
    imageUrl: '',
    fallbackEmoji: '🔀',
    bullets: [
      'Firmato 8 aprile 1965, in vigore 1° luglio 1967',
      'Unifica le istituzioni di CECA, CEE ed Euratom in un\'unica struttura',
      'Crea un Consiglio unico e una Commissione unica per tutte e tre le Comunità',
    ],
    mnemo: 'FUSIONE 67 → 3 comunità, 1 sola istituzione → efficienza',
  },
  'treaty-singleact': {
    title: 'Atto Unico Europeo 1986',
    year: 1987,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Single_European_Act.jpg/400px-Single_European_Act.jpg',
    fallbackEmoji: '📋',
    bullets: [
      'Firmato febbraio 1986, in vigore 1° luglio 1987',
      'Prima grande revisione dei Trattati di Roma',
      'Introduce il Mercato Unico (completato entro 31 dicembre 1992)',
    ],
    mnemo: 'AUE 87 → "Atto UNICO" = Mercato UNICO → 1992 deadline',
  },
  'treaty-maastricht': {
    title: 'Trattato di Maastricht 1992',
    year: 1993,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Maastricht_Treaty.jpg/400px-Maastricht_Treaty.jpg',
    fallbackEmoji: '🇪🇺',
    bullets: [
      'Firmato 7 febbraio 1992, in vigore 1° novembre 1993',
      'Nasce l\'Unione Europea con i 3 pilastri (CE, PESC, GAI)',
      'Introduce la cittadinanza europea e il percorso verso l\'Euro',
    ],
    mnemo: 'MAASTRICHT = M(ercato) A(ccordi) A(ccesso) S(chengen) T(re pilastri) R(ealtà UE) I(dentità) C(ittadinanza) H(t)',
  },
  'treaty-amsterdam': {
    title: 'Trattato di Amsterdam 1997',
    year: 1999,
    imageUrl: '',
    fallbackEmoji: '🏙️',
    bullets: [
      'Firmato 2 ottobre 1997, in vigore 1° maggio 1999',
      'Rinumera e semplifica gli articoli dei Trattati',
      'Rafforza la politica sociale, la PESC e la cooperazione giudiziaria',
    ],
    mnemo: 'AMSTERDAM → Rinumerazione + rafforzamento sociale',
  },
  'treaty-nice': {
    title: 'Trattato di Nizza 2001',
    year: 2003,
    imageUrl: '',
    fallbackEmoji: '🔧',
    bullets: [
      'Firmato 26 febbraio 2001, in vigore 1° febbraio 2003',
      'Prepara l\'allargamento a Est (10 nuovi paesi nel 2004)',
      'Riforma le istituzioni: pesi voto in Consiglio, composizione Commissione e PE',
    ],
    mnemo: 'NIZZA → "Nicchia" istituzionale per accogliere i 10 nuovi paesi',
  },
  'treaty-lisbon': {
    title: 'Trattato di Lisbona 2007',
    year: 2009,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Treaty_of_Lisbon_2007.jpg/400px-Treaty_of_Lisbon_2007.jpg',
    fallbackEmoji: '📖',
    bullets: [
      'Firmato 13 dicembre 2007, in vigore 1° dicembre 2009',
      'Crea il presidente stabile del Consiglio Europeo e l\'Alto Rappresentante PESC',
      'Abolisce la struttura a 3 pilastri, introduce la Carta dei Diritti Fondamentali come vincolante',
    ],
    mnemo: 'LISBONA = L(istituzioni) I(nnovate) S(enza pilastri) B(ase giuridica) O(nne) N(uova) A(rchitettura)',
  },

  // ── ISTITUZIONI ───────────────────────────────────────────────────────────
  'institution-ep': {
    title: 'Parlamento Europeo',
    year: 1952,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/European_Parliament_Strasbourg_Hemicycle_-_Diliff.jpg/400px-European_Parliament_Strasbourg_Hemicycle_-_Diliff.jpg',
    fallbackEmoji: '🏛️',
    bullets: [
      '720 deputati dopo le elezioni giugno 2024 (prima erano 705)',
      'Sede principale Strasburgo (plenarie), uffici a Bruxelles e Lussemburgo',
      'Presidente: Roberta Metsola (EPP, Malta) — rieletta luglio 2024',
    ],
    mnemo: 'PE = unica istituzione eletta direttamente dai cittadini',
  },
  'institution-council-eu': {
    title: 'Consiglio dell\'UE',
    year: 1952,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Council_of_the_EU_building_in_Brussels.jpg/400px-Council_of_the_EU_building_in_Brussels.jpg',
    fallbackEmoji: '🤝',
    bullets: [
      'Rappresenta i governi dei 27 Stati Membri',
      'Riunioni per configurazioni (ECOFIN, GAI, Agricoltura, ecc.)',
      'Sede: Bruxelles (edificio Europa)',
    ],
    mnemo: 'Consiglio UE = ministri nazionali → vota leggi con PE',
  },
  'institution-european-council': {
    title: 'Consiglio Europeo',
    year: 1974,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/European_Council_building_2017.jpg/400px-European_Council_building_2017.jpg',
    fallbackEmoji: '🎯',
    bullets: [
      'Capi di stato o di governo dei 27 Stati Membri',
      'Presidente: António Costa (dal 1° dicembre 2024, per 2.5 anni)',
      'Fissa le priorità politiche generali dell\'UE, non adotta leggi',
    ],
    mnemo: 'Consiglio EUROPEO = capi di governo → decide la DIREZIONE',
  },
  'institution-commission': {
    title: 'Commissione Europea',
    year: 1958,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Berlaymont_wide_from_Schuman_roundabout%2C_with_EU_flags.jpg/400px-Berlaymont_wide_from_Schuman_roundabout%2C_with_EU_flags.jpg',
    fallbackEmoji: '⚙️',
    bullets: [
      '27 Commissari (uno per Stato Membro) + Presidente',
      'Presidente: Ursula von der Leyen (2° mandato, dal 1° dicembre 2024)',
      'Sede: Palazzo Berlaymont, Bruxelles — "custode dei Trattati"',
    ],
    mnemo: 'Commissione = MOTORE legislativo UE, propone leggi',
  },
  'institution-cjeu': {
    title: 'Corte di Giustizia dell\'UE',
    year: 1952,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Court_of_Justice_EU_2.jpg/400px-Court_of_Justice_EU_2.jpg',
    fallbackEmoji: '⚖️',
    bullets: [
      'Sede: Lussemburgo (Palazzo della Corte di Giustizia)',
      '27 giudici + 11 avvocati generali, rinnovati ogni 6 anni',
      'Interpreta il diritto UE, risolve controversie tra stati e istituzioni',
    ],
    mnemo: 'CJEU → Lussemburgo → interpreta e applica il diritto UE',
  },
  'institution-ecb': {
    title: 'Banca Centrale Europea',
    year: 1998,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/European_Central_Bank_New_Headquarters.jpg/400px-European_Central_Bank_New_Headquarters.jpg',
    fallbackEmoji: '🏦',
    bullets: [
      'Sede: Francoforte sul Meno, Germania',
      'Gestisce la politica monetaria per i 20 paesi dell\'Eurozona',
      'Presidente: Christine Lagarde (dal 2019)',
    ],
    mnemo: 'BCE → Francoforte → Euro → stabilità dei prezzi',
  },
  'institution-eca': {
    title: 'Corte dei Conti Europea',
    year: 1977,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Cour_des_comptes_européenne_2.jpg/400px-Cour_des_comptes_européenne_2.jpg',
    fallbackEmoji: '🔍',
    bullets: [
      'Sede: Lussemburgo',
      '27 membri (uno per Stato Membro), mandato 6 anni',
      'Controlla che il bilancio UE sia speso correttamente — non è un organo giudiziario',
    ],
    mnemo: 'Corte dei Conti → Lussemburgo → REVISIONE bilancio (non giudica)',
  },

  // ── ATTUALITÀ ─────────────────────────────────────────────────────────────
  'current-ai-act': {
    title: 'AI Act 2024',
    year: 2024,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/European_Parliament_Strasbourg_Hemicycle_-_Diliff.jpg/400px-European_Parliament_Strasbourg_Hemicycle_-_Diliff.jpg',
    fallbackEmoji: '🤖',
    bullets: [
      'In vigore 2 agosto 2024 — primo regolamento mondiale sull\'IA',
      'Classifica l\'IA per livello di rischio: inaccettabile, alto, limitato, minimo',
      'Multa max: 35 M€ o 7% fatturato globale per violazioni più gravi',
    ],
    mnemo: 'AI Act 2024 → rischio-based → 7% multa → PRIMO al mondo',
  },
  'current-cbam': {
    title: 'CBAM — Carbon Border Adjustment Mechanism',
    year: 2023,
    imageUrl: '',
    fallbackEmoji: '🌍',
    bullets: [
      'Operativo dal 1° ottobre 2023 (fase transitoria — solo reportistica)',
      'Piena implementazione dal 1° gennaio 2026',
      'Settori: cemento, acciaio, alluminio, fertilizzanti, elettricità, idrogeno',
    ],
    mnemo: 'CBAM → "dazio CO₂" alle importazioni → 2023 report, 2026 pagamento',
  },
  'current-dsa': {
    title: 'Digital Services Act (DSA)',
    year: 2024,
    imageUrl: '',
    fallbackEmoji: '📱',
    bullets: [
      'Piena applicazione: 17 febbraio 2024 per tutte le piattaforme',
      'Soglia VLOP: 45 milioni utenti mensili attivi in EU',
      'Obblighi: trasparenza algoritmi, rimozione contenuti illegali, auditing annuale',
    ],
    mnemo: 'DSA → febbraio 2024 → 45M utenti → piattaforme responsabili',
  },
  'current-dma': {
    title: 'Digital Markets Act (DMA)',
    year: 2024,
    imageUrl: '',
    fallbackEmoji: '🔗',
    bullets: [
      'Piena applicazione: 1° novembre 2024',
      '7 gatekeeper designati: Alphabet, Amazon, Apple, ByteDance, Meta, Microsoft, Samsung',
      'Obiettivo: mercati digitali equi e contendibili',
    ],
    mnemo: 'DMA → novembre 2024 → 7 GATEKEEPER → mercati digitali equi',
  },
  'current-ep-elections': {
    title: 'Elezioni Europee giugno 2024',
    year: 2024,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/European_Parliament_Strasbourg_Hemicycle_-_Diliff.jpg/400px-European_Parliament_Strasbourg_Hemicycle_-_Diliff.jpg',
    fallbackEmoji: '🗳️',
    bullets: [
      '6-9 giugno 2024 — affluenza 51% (la più alta dal 1994)',
      '720 seggi totali (prima 705) — EPP primo partito con ~188 seggi',
      'Ursula von der Leyen proposta per secondo mandato come Presidente Commissione',
    ],
    mnemo: 'EP Giugno 2024 → 720 seggi → 51% affluenza → EPP vince',
  },
  'current-enlargement': {
    title: 'Allargamento UE 2022-2024',
    year: 2024,
    imageUrl: '',
    fallbackEmoji: '🌏',
    bullets: [
      'Ucraina e Moldova: candidature accettate giugno 2022, negoziati avviati giugno 2024',
      'Balcani Occidentali: Serbia, Montenegro, Albania, Macedonia del Nord, Bosnia, Kosovo in varie fasi',
      'Processo lungo: nessun nuovo stato previsto prima del 2030',
    ],
    mnemo: 'Allargamento → Ucraina/Moldova candidati 2022 → negoziati 2024',
  },
  'current-migration-pact': {
    title: 'Patto su Migrazione e Asilo',
    year: 2024,
    imageUrl: '',
    fallbackEmoji: '🤝',
    bullets: [
      'Adottato maggio 2024 dopo 4 anni di negoziati',
      'In vigore: giugno 2024 — agli Stati 2 anni per adeguarsi (giugno 2026)',
      'Introduce solidarietà obbligatoria: relocation o contributo finanziario',
    ],
    mnemo: 'Patto Migrazione → maggio 2024 → solidarietà obbligatoria → 2026 applicazione',
  },
  'current-mff': {
    title: 'Quadro Finanziario Pluriennale 2021-2027',
    year: 2021,
    imageUrl: '',
    fallbackEmoji: '💰',
    bullets: [
      '€1.074 miliardi + NextGenerationEU €750 miliardi = totale €1.824 miliardi',
      'RRF (Recovery and Resilience Facility): €723.8 miliardi (408 grants + 385.8 loans)',
      'Principali aree: politica di coesione, PAC, H2020, ricerca e innovazione',
    ],
    mnemo: 'MFF 2021-27 → 1.074Mld + NextGen 750Mld → RRF 723.8Mld per ripresa',
  },

  // ── PADRI FONDATORI ───────────────────────────────────────────────────────
  'person-schuman': {
    title: 'Robert Schuman',
    year: 1950,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Robert_Schuman.jpg/300px-Robert_Schuman.jpg',
    fallbackEmoji: '👨‍💼',
    bullets: [
      'Ministro degli Esteri francese, propone la CECA il 9 maggio 1950',
      'La "Dichiarazione Schuman" è considerata la nascita dell\'integrazione europea',
      '9 maggio = Giornata dell\'Europa in suo onore',
    ],
    mnemo: 'SCHUMAN → 9 MAGGIO 1950 → Dichiarazione → CECA → Giornata Europa',
  },
  'person-monnet': {
    title: 'Jean Monnet',
    year: 1950,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Jean_Monnet.jpg/300px-Jean_Monnet.jpg',
    fallbackEmoji: '🎩',
    bullets: [
      'Padre fondatore, ispiratore della Dichiarazione Schuman',
      'Primo presidente dell\'Alta Autorità della CECA (1952-1955)',
      '"Federalista pratico" — approccio graduale settore per settore',
    ],
    mnemo: 'MONNET → ideatore + Alta Autorità CECA → integrazione graduale',
  },
  'person-adenauer': {
    title: 'Konrad Adenauer',
    year: 1951,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Bundesarchiv_B_145_Bild-F004536-0003%2C_Konrad_Adenauer.jpg/300px-Bundesarchiv_B_145_Bild-F004536-0003%2C_Konrad_Adenauer.jpg',
    fallbackEmoji: '🎖️',
    bullets: [
      'Cancelliere tedesco (1949-1963), firma il Trattato di Parigi nel 1951',
      'Riconciliazione franco-tedesca: pilastro dell\'Europa unita',
      'Trattato dell\'Eliseo 1963 con de Gaulle: amicizia franco-tedesca',
    ],
    mnemo: 'ADENAUER → Germania firma CECA → riconciliazione con Francia',
  },
  'person-spinelli': {
    title: 'Altiero Spinelli',
    year: 1941,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Altiero_Spinelli.jpg/300px-Altiero_Spinelli.jpg',
    fallbackEmoji: '✍️',
    bullets: [
      'Manifesto di Ventotene (1941) — primo documento federalista europeo',
      'Redatto al confino durante il fascismo con Ernesto Rossi e Eugenio Colorni',
      'In seguito eurodeputato, autore del "Progetto Spinelli" (1984) per l\'unione federale',
    ],
    mnemo: 'SPINELLI → Ventotene 1941 → manifesto federalista → Padre dell\'Europa',
  },

  // ── ACCORDI SCHENGEN ──────────────────────────────────────────────────────
  'schengen': {
    title: 'Accordi di Schengen',
    year: 1995,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Schengen_visa_label.jpg/400px-Schengen_visa_label.jpg',
    fallbackEmoji: '🛂',
    bullets: [
      'Accordo firmato 1985 a Schengen (Lussemburgo), in vigore 1995',
      'Elimina i controlli alle frontiere interne tra i paesi aderenti',
      '27 paesi Schengen (non tutti UE: include Norvegia, Svizzera, Islanda, Liechtenstein)',
    ],
    mnemo: 'SCHENGEN → 1985 firmato, 1995 vigore → frontiere interne APERTE',
  },

  // ── ADESIONI KEY ──────────────────────────────────────────────────────────
  'accession-1973': {
    title: 'Primo Allargamento 1973',
    year: 1973,
    imageUrl: '',
    fallbackEmoji: '🇬🇧',
    bullets: [
      '1° gennaio 1973: UK, Irlanda, Danimarca entrano nella CEE',
      'Da 6 a 9 paesi membri',
      'Il generale de Gaulle aveva bloccato il UK nel 1963 e nel 1967',
    ],
    mnemo: 'UK+Irlanda+Danimarca → 1973 → da 6 a 9 → "1° allargamento"',
  },
  'accession-2004': {
    title: 'Big Bang Enlargement 2004',
    year: 2004,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/2004_EU_enlargement.svg/400px-2004_EU_enlargement.svg.png',
    fallbackEmoji: '🌍',
    bullets: [
      '1° maggio 2004: 10 paesi aderiscono (8 Est+Centro Europa + Cipro + Malta)',
      'Polonia, Ungheria, Rep. Ceca, Slovacchia, Slovenia, Estonia, Lettonia, Lituania',
      'Più grande allargamento nella storia UE — da 15 a 25 stati',
    ],
    mnemo: 'BIG BANG 2004 → 10 paesi → da 15 a 25 → Est Europa libero',
  },
  'accession-2007': {
    title: 'Bulgaria e Romania 2007',
    year: 2007,
    imageUrl: '',
    fallbackEmoji: '🇧🇬',
    bullets: [
      '1° gennaio 2007: Bulgaria e Romania entrano nell\'UE',
      'Da 25 a 27 stati membri',
      'Croazia si aggiunge il 1° luglio 2013 → 28 stati (poi Brexit → 27)',
    ],
    mnemo: 'BG+RO 2007 → 27 paesi → Croazia 2013 → 28 → Brexit → 27',
  },
};

// Treaty sequence for timeline display (ordered)
export const TREATY_SEQUENCE = [
  'treaty-paris',
  'treaty-rome',
  'treaty-merger',
  'treaty-singleact',
  'treaty-maastricht',
  'treaty-amsterdam',
  'treaty-nice',
  'treaty-lisbon',
];

// Institution list for grid display
export const INSTITUTION_LIST = [
  'institution-ep',
  'institution-european-council',
  'institution-council-eu',
  'institution-commission',
  'institution-cjeu',
  'institution-ecb',
  'institution-eca',
];

// Founders for flashcards
export const FOUNDERS_LIST = [
  'person-schuman',
  'person-monnet',
  'person-adenauer',
  'person-spinelli',
];

// Current events for tab display
export const CURRENT_EVENTS_LIST = [
  'current-ep-elections',
  'current-ai-act',
  'current-cbam',
  'current-dsa',
  'current-dma',
  'current-enlargement',
  'current-migration-pact',
  'current-mff',
];

// All flashcards (treaties + institutions + founders + current events)
export const FLASHCARD_LIST = [
  ...TREATY_SEQUENCE,
  ...INSTITUTION_LIST,
  ...FOUNDERS_LIST,
  'schengen',
  'accession-2004',
  'current-ai-act',
  'current-cbam',
  'current-ep-elections',
];
