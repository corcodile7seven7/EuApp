# Visual Learning Feature — Design Document
**Date:** 2026-02-25
**Status:** Approved by user
**Scope:** Pagina /visual + overlay quiz + domande attualità 2023-2025

---

## Problem Statement

L'app EuApp è attualmente testo-centrica. L'utente ha memoria fotografica e apprende in maniera grafica. Mancano:
- Timeline visiva dei trattati EU
- Albero genealogico dell'evoluzione istituzionale EU
- Associazioni immagine-concetto nelle domande
- Domande di attualità 2023-2025 (elezioni, AI Act, CBAM, DSA/DMA, allargamento)

---

## Decisions

| Decisione | Scelta | Motivazione |
|-----------|--------|-------------|
| Posizione contenuto visivo | Nuova rotta `/visual` dedicata | Full-screen immersive, non interferisce con quiz |
| Immagini | Misto: SVG per diagrammi + URL Wikimedia hardcoded | Diagrammi offline, foto storiche reali per impatto mnemonico |
| Pulsante visivo quiz | Overlay modale dopo risposta | Non distrae durante quiz, disponibile come rinforzo |

---

## Deliverable 1 — Pagina `/visual` (6 tab)

### Routing
- Nuova rotta: `/visual`
- Voce nel BottomNav (icona 🗺️) e Sidebar
- Aggiunta in App.jsx

### Tab 1 — 🗓️ Timeline Trattati (SVG verticale su mobile, orizzontale su desktop)
Trattati inclusi con anno, firma, paesi, cosa ha cambiato + immagine Wikimedia:
- 1951: Trattato di Parigi (CECA) — 6 paesi fondatori
- 1957: Trattati di Roma (CEE + Euratom)
- 1965: Trattato di fusione (Merger Treaty)
- 1986: Atto Unico Europeo (AUE)
- 1992: Trattato di Maastricht (nascita UE)
- 1997: Trattato di Amsterdam
- 2001: Trattato di Nizza
- 2007: Trattato di Lisbona

Ogni nodo: clic → card espansa con foto + 3 bullet + mnemonica + pulsante quiz inline.

### Tab 2 — 🌳 Albero Genealogico EU (SVG custom)
DAG dell'evoluzione:
```
CECA (1951) → CEE+Euratom (1957) → Fusione (1967) → CE → AUE (1986) → UE (1993) → Lisbona (2007)
```
Con ramificazioni per i 3 pilastri di Maastricht.

### Tab 3 — 🌍 Mappa Adesioni (SVG statico)
SVG politico dell'Europa con paesi colorati per ondata:
- Fondatori 1951/1957 (blu scuro)
- 1973 UK/Ireland/Denmark (verde)
- 1981 Greece, 1986 SP/PT (giallo)
- 1995 AT/FI/SE (arancio)
- 2004 Big Bang (10 paesi, rosso)
- 2007 BG/RO, 2013 HR (viola)
- Candidati 2024: UA, MD, Western Balkans (grigio tratteggiato)

### Tab 4 — 🏛️ Istituzioni
Card grid per ogni istituzione principale:
- Parlamento Europeo, Consiglio Europeo, Consiglio UE, Commissione Europea, Corte di Giustizia, BCE, Corte dei Conti

### Tab 5 — ⚡ Attualità 2024-25
Card tematiche con icone, data, testo chiave + badge "EPSO HOT":
- Elezioni EP giugno 2024 (51% turnout, 720 seggi, EPP primo)
- AI Act (in vigore 2 agosto 2024)
- CBAM (operativo 1 ottobre 2023, pieno 1 gennaio 2026)
- DSA (piena applicazione 17 febbraio 2024)
- DMA (piena applicazione 1 novembre 2024, 7 gatekeeper)
- Allargamento: Ukraine/Moldova candidati 2022, negoziati avviati giugno 2024
- Patto Migrazione (adottato maggio 2024)
- MFF: €1.974 trilioni, RRF €723.8 miliardi

### Tab 6 — 🃏 Flashcard Visive
- Formato flip-card (CSS 3D transform)
- Fronte: immagine/emoji + titolo conciso
- Retro: data, contesto, mnemonica
- Navigazione: swipe o frecce
- ~40 flashcard: padri fondatori, trattati chiave, istituzioni, date cruciali

---

## Deliverable 2 — Overlay Visivo nel Quiz

### Component: VisualContextModal.jsx
- Aperto da EnhancedExplanation.jsx quando `question.visualId` esiste
- Pulsante: `[🖼️ Contesto visivo]` (piccolo, accanto al bottone AI)
- Modale con: foto Wikimedia + anno in grande + 3 bullet + link → /visual

### Data Registry: `src/data/visual-registry.js`
Map `visualId → { title, year, imageUrl, fallbackEmoji, bullets, mnemo }`

### Domande con visualId (~40)
Aggiunte a temporal.json, eu-institutions.json, eu-knowledge.json via campo `"visualId": "treaty-rome"`.

---

## Deliverable 3 — `current-events.json` (30 domande)

### Sezione in QuizSetup
- ID: `current-events`
- Nome: "Attualità 2024-25"
- Peso: 0 (pratica)
- Icona: ⚡

### Domande incluse
| Tema | N° domande |
|------|-----------|
| Elezioni EP 2024 | 4 |
| AI Act | 4 |
| CBAM | 3 |
| DSA + DMA | 4 |
| Allargamento | 4 |
| Nuova Commissione 2024 | 3 |
| Patto Migrazione | 3 |
| MFF + RRF | 3 |
| Green Deal + Net Zero | 3 |
| Totale | **31** |

---

## File Modificati / Creati

| File | Azione |
|------|--------|
| `src/data/visual-registry.js` | CREA |
| `src/data/current-events.json` | CREA |
| `src/components/visual/VisualPage.jsx` | CREA |
| `src/components/visual/TreatyTimeline.jsx` | CREA |
| `src/components/visual/EUFamilyTree.jsx` | CREA |
| `src/components/visual/AccessionMap.jsx` | CREA |
| `src/components/visual/InstitutionsGrid.jsx` | CREA |
| `src/components/visual/CurrentEventsTab.jsx` | CREA |
| `src/components/visual/Flashcards.jsx` | CREA |
| `src/components/visual/VisualContextModal.jsx` | CREA |
| `src/components/quiz/EnhancedExplanation.jsx` | MODIFICA (aggiungi pulsante) |
| `src/components/layout/BottomNav.jsx` | MODIFICA (aggiungi /visual) |
| `src/components/layout/Sidebar.jsx` | MODIFICA |
| `src/App.jsx` | MODIFICA (nuova rotta) |
| `src/components/quiz/QuizSetup.jsx` | MODIFICA (nuova sezione) |
| `src/utils/scoring.js` | MODIFICA (SECTIONS entry) |
| `src/i18n/it.json` + `en.json` | MODIFICA (nuove chiavi) |
| `src/data/temporal.json` | MODIFICA (~15 domande, aggiungi visualId) |
| `src/data/eu-institutions.json` | MODIFICA (~10 domande, aggiungi visualId) |
| `src/data/eu-knowledge.json` | MODIFICA (~15 domande, aggiungi visualId) |

---

## Technical Constraints

- React 19 + Vite 7 + Tailwind CSS 4
- No external libraries (D3, leaflet, etc.) — SVG puro
- Mobile-first (max-w-2xl mx-auto)
- Dark mode support su tutti i componenti
- Service worker esistente — no cache aggiuntiva necessaria per Wikimedia (online fallback graceful)
- Lint: hooks before early returns, no Date.now() in useState
