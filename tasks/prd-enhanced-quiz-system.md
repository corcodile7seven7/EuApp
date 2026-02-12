# PRD: Enhanced Quiz System — 500+ Domande, Spiegazioni AI, Analisi Debolezze

## Introduction

L'app EPSO Prep AD5 attualmente ha 140 domande (80 EU Knowledge + 60 Digital Skills) con spiegazioni brevi. Questo aggiornamento porta il banco domande a 500+, aggiunge spiegazioni dettagliate con motivazioni per ogni opzione (corretta e sbagliata), integra DeepSeek AI per approfondimenti live, e introduce un sistema di analisi delle debolezze per guidare lo studio dell'utente.

## Goals

- Espandere il banco domande a 500+ (target: ~350 EU Knowledge + ~150 Digital Skills)
- Aggiungere spiegazioni ricche: motivazione della risposta corretta + perche ogni opzione sbagliata e sbagliata
- Integrare DeepSeek AI via OpenRouter per approfondimenti on-demand ("Approfondisci con AI")
- Creare una dashboard di analisi debolezze con vista per categoria e drill-down per domanda
- Permettere il quiz mirato sulle aree deboli ("Esercitati sulle debolezze")

## User Stories

### US-001: Script di generazione domande con DeepSeek

**Description:** Come sviluppatore, voglio uno script Node.js che genera domande nel formato JSON corretto usando l'API DeepSeek via OpenRouter, cosi da poter espandere il banco domande rapidamente.

**Acceptance Criteria:**

- [ ] Script in `scripts/generate-questions.js` che accetta `--section`, `--category`, `--count`, `--output`
- [ ] Chiama `https://openrouter.ai/api/v1/chat/completions` con modello `deepseek/deepseek-chat`
- [ ] Genera domande nel formato JSON esistente + nuovi campi (motivation, wrong_explanations)
- [ ] Validazione automatica dell'output (4 opzioni, correct 0-3, tutti i campi bilingue)
- [ ] Supporta `--enrich` per aggiungere nuovi campi a domande esistenti
- [ ] Gestione errori e retry su fallimento API
- [ ] Lint/typecheck passa

### US-002: Arricchire le 140 domande esistenti con spiegazioni dettagliate

**Description:** Come utente, voglio che le domande esistenti abbiano spiegazioni dettagliate che spieghino perche la risposta e corretta e perche le altre sono sbagliate.

**Acceptance Criteria:**

- [ ] Tutte le 140 domande esistenti hanno i nuovi campi: `motivation_it`, `motivation_en`, `wrong_explanations_it`, `wrong_explanations_en`
- [ ] `motivation_*` spiega in dettaglio PERCHE la risposta corretta e corretta (contesto, riferimenti legali, logica)
- [ ] `wrong_explanations_*` e un array di 4 stringhe, una per opzione (l'opzione corretta ha stringa vuota `""`)
- [ ] Le spiegazioni sono accurate e allineate al contesto EPSO/UE
- [ ] Revisione manuale completata

### US-003: Generare 360+ nuove domande

**Description:** Come utente, voglio almeno 500 domande totali (350 EU Knowledge + 150 Digital Skills) per avere una preparazione piu completa.

**Acceptance Criteria:**

- [ ] `eu-knowledge.json` contiene almeno 350 domande (attualmente 80 → +270)
- [ ] `digital-skills.json` contiene almeno 150 domande (attualmente 60 → +90)
- [ ] Distribuzione equilibrata tra tutte le categorie esistenti
- [ ] Difficolta variata: easy/medium/hard (non tutto "medium")
- [ ] ID univoci senza conflitti (continuazione numerica: eu-081, eu-082... dig-061, dig-062...)
- [ ] Tutte le domande includono tutti i nuovi campi di spiegazione
- [ ] Revisione manuale per accuratezza completata

### US-004: Visualizzare spiegazioni dettagliate dopo risposta (Practice mode)

**Description:** Come utente in modalita pratica, dopo aver risposto voglio vedere: la spiegazione generale, la motivazione dettagliata, e perche ogni opzione sbagliata e sbagliata.

**Acceptance Criteria:**

- [ ] Dopo risposta in practice mode, appare sezione spiegazione espansa
- [ ] Sezione "Perche e corretta" con sfondo verde chiaro mostra `motivation_*`
- [ ] Per ogni opzione sbagliata: riga con label (A/B/C/D) e spiegazione del perche e sbagliata
- [ ] Le opzioni sbagliate selezionate dall'utente sono evidenziate in rosso
- [ ] Retrocompatibile: domande senza nuovi campi mostrano solo `explanation_*` come prima
- [ ] Funziona in entrambe le lingue (IT/EN tramite quizLang)
- [ ] Lint/typecheck passa
- [ ] Verificare in browser

### US-005: Visualizzare spiegazioni dettagliate nella review finale (QuizResults)

**Description:** Come utente, nella pagina risultati voglio poter espandere ogni domanda per vedere le spiegazioni dettagliate.

**Acceptance Criteria:**

- [ ] Ogni domanda nella review ha un pulsante "Mostra dettagli" / "Nascondi dettagli"
- [ ] Al click, espande la sezione con motivazione + spiegazioni opzioni sbagliate
- [ ] Di default le domande sbagliate sono espanse, quelle corrette chiuse
- [ ] Lint/typecheck passa
- [ ] Verificare in browser

### US-006: Pulsante "Approfondisci con AI" (DeepSeek live)

**Description:** Come utente, dopo aver visto la spiegazione base, voglio poter cliccare "Approfondisci con AI" per ottenere un'analisi piu profonda in tempo reale.

**Acceptance Criteria:**

- [ ] Pulsante "Approfondisci con AI" visibile dopo la spiegazione base
- [ ] Al click, chiama DeepSeek via OpenRouter con contesto della domanda
- [ ] Mostra spinner durante il caricamento
- [ ] Risposta AI visualizzata in sezione dedicata con sfondo distinto
- [ ] Risposta cached in localStorage per 7 giorni (chiave: `epso-deepseek-{questionId}-{lang}`)
- [ ] Gestione errori: messaggio user-friendly se API fallisce + pulsante riprova
- [ ] Rate limiting: max 20 richieste/minuto, 200/giorno
- [ ] Funziona con quizLang (risposta in italiano o inglese)
- [ ] Pulsante nascosto se nessuna API key disponibile
- [ ] Lint/typecheck passa
- [ ] Verificare in browser

### US-007: Gestione API key nelle Impostazioni

**Description:** Come utente, voglio poter inserire la mia API key OpenRouter nelle impostazioni, con una key di default preconfigurata.

**Acceptance Criteria:**

- [ ] Nuova sezione "Funzioni AI" in Settings.jsx
- [ ] Campo input per API key (tipo password con toggle show/hide)
- [ ] Key salvata in localStorage (`epso-deepseek-api-key`)
- [ ] Fallback a key di default se campo vuoto
- [ ] Testo di aiuto che spiega a cosa serve
- [ ] Pulsante "Test connessione" che verifica la key funzioni
- [ ] Lint/typecheck passa
- [ ] Verificare in browser

### US-008: Analisi debolezze — Vista per categoria

**Description:** Come utente, voglio una pagina che mi mostra le categorie dove faccio piu fatica, ordinate dalla peggiore alla migliore.

**Acceptance Criteria:**

- [ ] Nuova tab "Analisi Debolezze" nella pagina Statistiche (tab switch con "Riepilogo")
- [ ] Lista categorie ordinate per accuratezza (peggiore prima)
- [ ] Ogni categoria mostra: nome, % accuratezza, barra colore (rosso <40%, arancione 40-60%, giallo 60-80%, verde >80%)
- [ ] Numero tentativi e numero corretti visibili
- [ ] Livello debolezza indicato: "Critico" (rosso), "Debole" (arancione), "Moderato" (giallo), "Forte" (verde)
- [ ] Messaggio se non ci sono dati sufficienti
- [ ] Click su categoria → drill-down nelle domande specifiche
- [ ] Lint/typecheck passa
- [ ] Verificare in browser

### US-009: Analisi debolezze — Drill-down per domanda

**Description:** Come utente, dopo aver cliccato su una categoria debole, voglio vedere le domande specifiche che sbaglio piu spesso.

**Acceptance Criteria:**

- [ ] Pannello espandibile sotto la categoria selezionata
- [ ] Lista domande filtrate per categoria, ordinate per accuratezza (peggiori prima)
- [ ] Solo domande tentate almeno 2 volte
- [ ] Per ogni domanda: testo abbreviato, % accuratezza, numero tentativi, streak attuale
- [ ] Badge colorato per livello debolezza
- [ ] Usa dati da `storage.getQuestionStats()`
- [ ] Lint/typecheck passa
- [ ] Verificare in browser

### US-010: Esercitati sulle aree deboli

**Description:** Come utente, voglio un pulsante che crea un quiz personalizzato con solo le domande dove faccio piu fatica.

**Acceptance Criteria:**

- [ ] Pulsante "Esercitati sulle debolezze" nella pagina analisi
- [ ] Genera un quiz con le 10-20 domande piu deboli (configurabile)
- [ ] QuizEngine.jsx supporta parametro URL `weak=true` per caricare domande deboli
- [ ] Se non ci sono abbastanza dati, mostra messaggio guida
- [ ] Funziona sia per EU Knowledge che Digital Skills
- [ ] Lint/typecheck passa
- [ ] Verificare in browser

## Functional Requirements

- FR-1: Estendere lo schema JSON delle domande con campi opzionali: `motivation_it`, `motivation_en`, `wrong_explanations_it` (array[4]), `wrong_explanations_en` (array[4])
- FR-2: Lo script `scripts/generate-questions.js` deve generare domande bilingue con tutte le spiegazioni via DeepSeek API
- FR-3: Lo script deve supportare modalita `--enrich` per aggiungere nuovi campi a domande esistenti
- FR-4: Il componente `EnhancedExplanation` deve mostrare spiegazioni dettagliate in practice mode e nella review
- FR-5: La chiamata live DeepSeek deve usare endpoint `https://openrouter.ai/api/v1/chat/completions` con modello `deepseek/deepseek-chat`
- FR-6: Le risposte DeepSeek live devono essere cachate in localStorage per 7 giorni
- FR-7: La utility `utils/weakness.js` deve calcolare score debolezza basato su: accuratezza (peso 80%) + volume tentativi (peso 20%)
- FR-8: La pagina Statistiche deve avere 2 tab: "Riepilogo" (esistente) e "Analisi Debolezze" (nuovo)
- FR-9: Il quiz "aree deboli" deve caricare le domande dal banco completo filtrate per weakness score
- FR-10: Tutte le nuove stringhe UI devono essere tradotte in IT e EN nei file i18n

## Non-Goals (Out of Scope)

- Nessun backend/server — tutto rimane client-side (API call diretta a OpenRouter)
- Nessuna autenticazione utente o account
- Non generare domande di tipo Verbal Reasoning, Numerical Reasoning, Abstract Reasoning (Phase 2)
- Non implementare flashcard o modulo studio
- Non implementare grafici/chart avanzati (solo barre di progresso CSS)
- Non proxy server per API key (la key e gestita lato client)
- Non implementare spaced repetition algorithm completo

## Design Considerations

- Riutilizzare la struttura dei componenti esistenti (card, button, color scheme)
- `EnhancedExplanation` e un nuovo componente condiviso tra `QuizEngine` e `QuizResults`
- Tab nella pagina Statistics: riutilizzare il pattern di styling esistente (bg-white/dark-surface, rounded-xl, border)
- Colori debolezza: riutilizzare `fail-red`, `warn-orange`, `eu-yellow`, `pass-green` gia definiti in Tailwind theme
- Le spiegazioni opzioni sbagliate usano un layout compatto con label A/B/C/D a sinistra

## Technical Considerations

### Schema esteso (retrocompatibile)
```json
{
  "id": "eu-001",
  "question_it": "...", "question_en": "...",
  "options": [{"text_it": "...", "text_en": "..."}],
  "correct": 1,
  "explanation_it": "...", "explanation_en": "...",
  "motivation_it": "Dettaglio perche e corretta...",
  "motivation_en": "Detail why it is correct...",
  "wrong_explanations_it": ["Perche A e sbagliata", "", "Perche C e sbagliata", "Perche D e sbagliata"],
  "wrong_explanations_en": ["Why A is wrong", "", "Why C is wrong", "Why D is wrong"],
  "category": "EU Institutions",
  "difficulty": "medium"
}
```
Nota: `wrong_explanations` ha 4 elementi; l'elemento all'indice `correct` e una stringa vuota `""`.

### File da creare
- `scripts/generate-questions.js` — Script generazione/arricchimento domande
- `src/utils/deepseek.js` — Client API DeepSeek con cache e rate limiting
- `src/utils/weakness.js` — Logica calcolo debolezze
- `src/components/quiz/EnhancedExplanation.jsx` — Componente spiegazione dettagliata con pulsante AI
- `src/components/stats/WeaknessAnalysis.jsx` — Dashboard analisi debolezze (categoria + drill-down)

### File da modificare
- `src/data/eu-knowledge.json` — Arricchire 80 domande + aggiungere 270 nuove
- `src/data/digital-skills.json` — Arricchire 60 domande + aggiungere 90 nuove
- `src/components/quiz/QuizEngine.jsx` — Sostituire blocco spiegazione con `EnhancedExplanation`, supportare `weak=true`
- `src/components/quiz/QuizResults.jsx` — Aggiungere espansione dettagli con `EnhancedExplanation`
- `src/components/stats/Statistics.jsx` — Aggiungere tab navigation + tab WeaknessAnalysis
- `src/components/settings/Settings.jsx` — Aggiungere sezione API key
- `src/i18n/it.json` + `src/i18n/en.json` — Nuove chiavi traduzione

### API Key
- Key OpenRouter fornita: `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`
- Salvata come fallback in `src/utils/deepseek.js`
- L'utente puo sovrascrivere con la propria key in Impostazioni

### Dipendenze
- Nessuna nuova dipendenza runtime per l'app React
- Script: solo `node` built-in (fs, path, fetch nativo di Node 18+)

## Success Metrics

- 500+ domande nel banco (350 EU + 150 Digital)
- 100% delle domande hanno spiegazioni dettagliate (motivation + wrong_explanations)
- "Approfondisci con AI" funziona con latenza < 3 secondi
- Cache hit rate > 70% per le chiamate DeepSeek ripetute
- L'analisi debolezze identifica correttamente le aree piu deboli dell'utente
- Nessuna regressione sulle funzionalita esistenti

## Open Questions

- Quanto budget mensile per le chiamate API DeepSeek? (attualmente stimato < $5/mese)
- Le domande generate devono essere revisionate manualmente una ad una o va bene una revisione a campione?
- Il campo difficulty deve variare (easy/medium/hard) o rimanere tutto "medium"?
