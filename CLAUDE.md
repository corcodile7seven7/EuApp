# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173/EuApp/)
npm run build     # Production build to dist/
npm run lint      # ESLint (flat config, React 19 strict rules)
npm run preview   # Preview production build locally
```

No test framework is configured. The project uses `"type": "module"` in package.json — use `.cjs` extension for any CommonJS scripts.

## Architecture

EPSO AD5 exam preparation PWA. Fully client-side React 19 + Vite 7 + Tailwind CSS 4. Deploys to GitHub Pages at `/EuApp/` using HashRouter. Service worker registered in `main.jsx` for offline support.

### Routing & Layout

`App.jsx` wraps everything in `ThemeProvider > LanguageProvider > HashRouter`. The `AppShell` layout renders a sticky header, a sidebar (desktop md+), bottom tab nav (mobile), and an `<Outlet>` for page content.

Routes: `/` (Dashboard), `/quiz` (QuizSetup), `/quiz/:section?mode=practice|exam&num=N&weak=true` (QuizEngine), `/study`, `/stats`, `/settings`.

### State Management

Two React contexts only:
- **LanguageContext** - `lang` (UI language: it/en) and `quizLang` (question language, independent). Provides `t('dot.path')` translation function that traverses JSON objects in `src/i18n/{it,en}.json`.
- **ThemeContext** - Dark mode toggle. Applies `dark` class to `<html>`.

Both persist to localStorage. No Redux/Zustand.

### Data Flow

Quiz questions are static JSON in `src/data/` imported directly into `QuizEngine.jsx`. Results flow: QuizEngine -> `useQuiz` hook -> `storage.addResult()` -> localStorage. Dashboard and Statistics read from `storage.getHistory()` with `useMemo`. `weakness.js` identifies weak questions for targeted practice (`weak=true` URL param).

### Quiz Engine

`useQuiz` hook manages question state (current index, answers map, flagged set). `useTimer` hook provides per-question countdown with `onExpire` callback (via ref to avoid stale closures). Two modes:
- **Practice**: No timer, shows explanation immediately after answering
- **Exam**: Per-question timer, auto-advances on timeout, results only at end

Questions are shuffled (Fisher-Yates) on each attempt. The `num` URL param controls how many questions to serve (0 = all).

### Scoring (utils/scoring.js)

`SECTIONS` object defines per-section config: `timePerQuestion`, `passScore`, `totalQuestions`, `weight`. Weighted score = sum of (section accuracy * weight * 100). Only 4 sections have weight (verbal 35%, EU knowledge 25%, digital skills 25%, EUFTE 15%). Numerical + abstract reasoning are combined with shared pass score.

### Storage (utils/storage.js)

All localStorage keys use `epso-` prefix. `addResult()` generates timestamped IDs and updates per-question stats (attempts, correct count, streak, lastSeen). `exportAll()`/`importAll()` enable JSON backup/restore with version field.

## Lint Gotchas (React 19 Strict)

These rules are enforced and will cause CI-blocking errors:

- **No `Date.now()` in useState/useRef initializers** - Use `useState(() => Date.now())` or initialize ref to `null` and set in `useEffect`
- **No ref.current assignment during render** - Always wrap in `useEffect(() => { ref.current = value }, [value])`
- **No setState calls directly in effect body** - Use intervals/callbacks instead
- **Hooks before early returns** - All `useLanguage()`, `useTheme()`, etc. must be called before any `if (...) return` statements
- **Context files** exporting both Provider and useXxx hook need `/* eslint-disable react-refresh/only-export-components */`
- **Unused vars** starting with uppercase or `_` are allowed (varsIgnorePattern: `^[A-Z_]`)

## Question JSON Schema

All question banks follow this structure (4 options, 0-based correct index, bilingual):

```json
{
  "id": "eu-001",
  "question_it": "...", "question_en": "...",
  "options": [{ "text_it": "...", "text_en": "..." }],
  "correct": 0,
  "explanation_it": "...", "explanation_en": "...",
  "category": "EU Institutions",
  "difficulty": "easy|medium|hard",
  "motivation_it": "...", "motivation_en": "...",
  "wrong_explanations_it": ["", "why opt1 wrong", "why opt2 wrong", "why opt3 wrong"],
  "wrong_explanations_en": ["", "why opt1 wrong", "why opt2 wrong", "why opt3 wrong"]
}
```

`wrong_explanations[correct]` must always be `""` (empty string). The non-empty entries explain why each wrong option is incorrect.

### Question Banks

- **eu-knowledge.json** — 350 questions, 9 categories: EU History, EU Policies, EU Law & Treaties, EU Decision Making, EU Budget & Finance, EU External Relations, EU Values & Principles, EU Institutions, EU Agencies & Bodies
- **digital-skills.json** — 151 questions, 5 categories: Information & Data Literacy, Communication & Collaboration, Digital Content Creation, Safety & Security, Problem Solving

To add a new quiz section: add JSON to `src/data/`, import in `QuizEngine.jsx`'s `DATA` map, add section config to `SECTIONS` in `scoring.js`, add to `availableSections` in `QuizSetup.jsx`, and add translation keys to both i18n files.

## Tailwind CSS 4

Uses `@theme` directive in `index.css` for custom colors (not tailwind.config.js). Key tokens: `eu-blue`, `eu-yellow`, `dark-bg`, `dark-surface`, `dark-border`, `pass-green`, `warn-orange`, `fail-red`. Dark mode uses `dark:` variant tied to `.dark` class on `<html>`.
