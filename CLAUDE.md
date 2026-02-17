# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Directory

This CLAUDE.md sits inside `epso-prep/`. All `npm` commands must be run from this directory (`cd epso-prep/`).

## Build & Development Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173/EuApp/)
npm run build     # Production build to dist/
npm run lint      # ESLint (flat config, React 19 strict rules)
npm run preview   # Preview production build locally
```

No test framework is configured. The project uses `"type": "module"` in package.json — use `.mjs` or `.cjs` extension for standalone scripts.

## Architecture

EPSO AD5 exam preparation PWA. Fully client-side React 19 + Vite 7 + Tailwind CSS 4. Deploys to GitHub Pages at `/EuApp/` using HashRouter. Service worker registered in `main.jsx` for offline support.

### PWA & Deployment

- `public/sw.js` — Service worker (in `public/`, not `src/`)
- `public/manifest.json` — PWA manifest
- Base path `/EuApp/` is set in `vite.config.js` (`base: '/EuApp/'`) — update this when changing deployment targets

### Routing & Layout

`App.jsx` wraps everything in `ThemeProvider > LanguageProvider > HashRouter`. The `AppShell` layout renders a sticky header, a sidebar (desktop md+), bottom tab nav (mobile), and an `<Outlet>` for page content.

Routes: `/` (Dashboard), `/quiz` (QuizSetup), `/quiz/:section?mode=practice|exam&num=N&weak=true` (QuizEngine), `/study`, `/stats`, `/settings`, `/info` (InfoPage).

Special section values for QuizEngine: `all` (all categories in order), `mixed` (all categories shuffled).

### State Management

Two React contexts only:
- **LanguageContext** - `lang` (UI language: it/en) and `quizLang` (question language, independent). Provides `t('dot.path')` translation function that traverses JSON objects in `src/i18n/{it,en}.json`.
- **ThemeContext** - Dark mode toggle. Applies `dark` class to `<html>`.

Both persist to localStorage. No Redux/Zustand.

### Data Flow

Quiz questions are static JSON in `src/data/` imported directly into `QuizEngine.jsx`'s `DATA` map. Results flow: QuizEngine -> `useQuiz` hook -> `storage.addResult()` -> localStorage. Dashboard and Statistics read from `storage.getHistory()` with `useMemo`. `weakness.js` identifies weak questions for targeted practice (`weak=true` URL param).

### Quiz Engine

`useQuiz` hook manages question state (current index, answers map, flagged set). `useTimer` hook provides per-question countdown with `onExpire` callback (via ref to avoid stale closures). Two modes:
- **Practice**: No timer, shows explanation immediately after answering (with rich-text markdown via `renderMarkdown.jsx`)
- **Exam**: Per-question timer, auto-advances on timeout, results only at end

Questions are shuffled (Fisher-Yates) on each attempt. The `num` URL param controls how many questions to serve (0 = all). The `all` and `mixed` section modes concatenate all 7 question banks.

### Scoring (utils/scoring.js)

`SECTIONS` object defines per-section config: `timePerQuestion`, `passScore`, `totalQuestions`, `weight`, `color`. Weighted score = sum of (section accuracy * weight * 100). Official EPSO sections have weight > 0 (verbal 35%, EU knowledge 25%, digital skills 25%, EUFTE 15%). Practice categories (temporal, eu-institutions, acronyms, situational, it-advanced) have `weight: 0`.

### Storage (utils/storage.js)

All localStorage keys use `epso-` prefix. `addResult()` generates timestamped IDs and updates per-question stats (attempts, correct count, streak, lastSeen). `exportAll()`/`importAll()` enable JSON backup/restore with version field.

### Rich Text (utils/renderMarkdown.jsx)

Lightweight markdown renderer for explanations. Supports `**bold**`, `*italic*`, `- list items`, `\n\n` paragraphs. Returns React elements with Tailwind classes. Used in `EnhancedExplanation.jsx` for all explanation fields and AI deep-dive responses.

### AI Deep Dive (utils/deepseek.js)

Optional DeepSeek AI integration via OpenRouter API for in-depth question explanations. Includes rate limiting (20/min, 200/day), response caching (7 days in localStorage), and configurable API key (Settings page). Fallback to hardcoded key.

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
  "explanation_it": "Supports **bold** and *italic* markdown...",
  "explanation_en": "...",
  "category": "EU Institutions",
  "difficulty": "easy|medium|hard",
  "motivation_it": "...", "motivation_en": "...",
  "wrong_explanations_it": ["", "why opt1 wrong", "why opt2 wrong", "why opt3 wrong"],
  "wrong_explanations_en": ["", "why opt1 wrong", "why opt2 wrong", "why opt3 wrong"]
}
```

`wrong_explanations[correct]` must always be `""` (empty string). The non-empty entries explain why each wrong option is incorrect. Explanation fields support lightweight markdown (`**bold**`, `*italic*`, `- lists`, `\n\n` paragraphs).

#### Verbal & Numerical Reasoning Extra Fields

Both add `passage_it` and `passage_en` — a reading passage or data context the question refers to.

#### Abstract Reasoning Extra Fields

Instead of text-based questions, abstract reasoning uses visual pattern fields:
- `sequence` — Array of shape objects (each with `type`, `fill`, `size`, `rotation`) defining the pattern
- `options_shapes` — Array of shape objects for the answer choices (options `text_it`/`text_en` contain labels like "Figura A")

### Question Banks

| File | ID Prefix | Questions | Weight | Categories |
|------|-----------|-----------|--------|------------|
| `eu-knowledge.json` | `eu-` | 350 | 25% | EU History, Policies, Law, Budget, Institutions, etc. |
| `digital-skills.json` | `ds-` | 151 | 25% | DigComp 2.2: data literacy, collaboration, safety |
| `temporal.json` | `temp-` | 40 | 0 | EU Treaties, Timeline, Accession History, Key Dates |
| `eu-institutions.json` | `eui-` | 40 | 0 | Institutions, Decision Making, Competences, Seats |
| `acronyms.json` | `acr-` | 30 | 0 | EU Bodies, Programs, Policies, Legal (no acronym in question text) |
| `situational.json` | `sit-` | 30 | 0 | Citizens' Rights, Cross-Border Scenarios, Consumer Protection |
| `it-advanced.json` | `ita-` | 30 | 0 | Networking, Cloud, AI, Software Dev, Digital Governance |
| `verbal-reasoning.json` | `vr-` | 120 | 35% | Reading comprehension, logical deduction (has passage fields) |
| `numerical-reasoning.json` | `nr-` | 100 | 0* | Percentages, budgets, growth rates (has passage fields) |
| `abstract-reasoning.json` | `ar-` | 120 | 0* | Visual pattern sequences (has sequence/options_shapes fields) |

*Numerical and abstract reasoning are `combinedWith` each other in scoring — they share a combined pass score of 10 out of 20 total questions, but have individual `weight: 0`.

To add a new quiz section: add JSON to `src/data/`, import in `QuizEngine.jsx`'s `DATA` map, add section config to `SECTIONS` in `scoring.js`, add card entry in `QuizSetup.jsx`'s `categories` array, add translation keys (`sections.*`, `sections_desc.*`) to both i18n files, and add to `sectionList` in `Dashboard.jsx`.

## Tailwind CSS 4

Uses `@theme` directive in `index.css` for custom colors (not tailwind.config.js). Key tokens: `eu-blue`, `eu-yellow`, `dark-bg`, `dark-surface`, `dark-border`, `pass-green`, `warn-orange`, `fail-red`. Dark mode uses `dark:` variant tied to `.dark` class on `<html>`.
