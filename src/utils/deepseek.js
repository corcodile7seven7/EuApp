const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-chat';
const HARDCODED_KEY = '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';
const CACHE_PREFIX = 'epso-deepseek-';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const RATE_KEY = 'epso-deepseek-rate';

function getApiKey() {
  try {
    const stored = localStorage.getItem('epso-deepseek-api-key');
    if (stored) return stored;
  } catch { /* ignore */ }
  return HARDCODED_KEY;
}

export function hasApiKey() {
  return !!getApiKey();
}

export function setApiKey(key) {
  if (key) {
    localStorage.setItem('epso-deepseek-api-key', key);
  } else {
    localStorage.removeItem('epso-deepseek-api-key');
  }
}

export function getStoredApiKey() {
  try {
    return localStorage.getItem('epso-deepseek-api-key') || '';
  } catch {
    return '';
  }
}

// --- Rate limiting ---
function getRateState() {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    if (!raw) return { minute: [], daily: 0, dailyDate: '' };
    return JSON.parse(raw);
  } catch {
    return { minute: [], daily: 0, dailyDate: '' };
  }
}

function checkRateLimit() {
  const state = getRateState();
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  // Clean old minute entries
  state.minute = (state.minute || []).filter(ts => now - ts < 60000);

  // Reset daily counter if new day
  if (state.dailyDate !== today) {
    state.daily = 0;
    state.dailyDate = today;
  }

  if (state.minute.length >= 20) {
    return { allowed: false, reason: 'rate_minute' };
  }
  if (state.daily >= 200) {
    return { allowed: false, reason: 'rate_daily' };
  }

  return { allowed: true };
}

function recordRequest() {
  const state = getRateState();
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  state.minute = (state.minute || []).filter(ts => now - ts < 60000);
  state.minute.push(now);

  if (state.dailyDate !== today) {
    state.daily = 0;
    state.dailyDate = today;
  }
  state.daily++;

  try {
    localStorage.setItem(RATE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

// --- Cache ---
function getCached(questionId, lang) {
  try {
    const key = `${CACHE_PREFIX}${questionId}-${lang}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(questionId, lang, data) {
  try {
    const key = `${CACHE_PREFIX}${questionId}-${lang}`;
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* ignore */ }
}

// --- Main API ---
export async function getDeepDiveExplanation(question, selectedOption, quizLang) {
  const lang = quizLang || 'en';
  const cached = getCached(question.id, lang);
  if (cached) return { success: true, data: cached, cached: true };

  const rateCheck = checkRateLimit();
  if (!rateCheck.allowed) {
    return { success: false, error: rateCheck.reason };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, error: 'no_api_key' };
  }

  const questionText = lang === 'en' ? question.question_en : question.question_it;
  const options = question.options.map((o, i) => {
    const text = lang === 'en' ? o.text_en : o.text_it;
    return `${String.fromCharCode(65 + i)}) ${text}`;
  }).join('\n');
  const correctText = lang === 'en' ? question.options[question.correct].text_en : question.options[question.correct].text_it;
  const selectedText = selectedOption >= 0
    ? (lang === 'en' ? question.options[selectedOption].text_en : question.options[selectedOption].text_it)
    : 'No answer selected';

  const systemPrompt = lang === 'it'
    ? `Sei un esperto preparatore per il concorso EPSO AD5 (European Personnel Selection Office). Fornisci spiegazioni dettagliate, accurate e pedagogiche. Cita articoli dei Trattati, regolamenti e fonti ufficiali UE quando possibile. Rispondi in italiano.`
    : `You are an expert EPSO AD5 competition tutor (European Personnel Selection Office). Provide detailed, accurate, and pedagogical explanations. Cite Treaty articles, regulations, and official EU sources when possible. Answer in English.`;

  const userPrompt = lang === 'it'
    ? `Domanda: ${questionText}\n\nOpzioni:\n${options}\n\nRisposta corretta: ${String.fromCharCode(65 + question.correct)}) ${correctText}\nRisposta selezionata: ${selectedOption >= 0 ? String.fromCharCode(65 + selectedOption) + ') ' + selectedText : 'Nessuna'}\n\nFornisci:\n1. Una spiegazione approfondita del perché la risposta corretta è giusta (con riferimenti normativi)\n2. Perché ciascuna opzione sbagliata è errata\n3. Un consiglio pratico per ricordare questa informazione`
    : `Question: ${questionText}\n\nOptions:\n${options}\n\nCorrect answer: ${String.fromCharCode(65 + question.correct)}) ${correctText}\nSelected answer: ${selectedOption >= 0 ? String.fromCharCode(65 + selectedOption) + ') ' + selectedText : 'None'}\n\nProvide:\n1. An in-depth explanation of why the correct answer is right (with legal/regulatory references)\n2. Why each wrong option is incorrect\n3. A practical tip to remember this information`;

  try {
    recordRequest();

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://epso-prep.local',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text}`);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response');

    setCache(question.id, lang, content);
    return { success: true, data: content, cached: false };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// --- Section prefix map ---
const SECTION_PREFIXES = {
  'eu-knowledge': 'eu',
  'digital-skills': 'ds',
  'temporal': 'temp',
  'eu-institutions': 'eui',
  'acronyms': 'acr',
  'situational': 'sit',
  'it-advanced': 'ita',
  'verbal-reasoning': 'vr',
  'numerical-reasoning': 'nr',
  'abstract-reasoning': 'ar',
};

/**
 * Generate new quiz questions using DeepSeek AI.
 * @param {string} section - section id (e.g. 'eu-institutions')
 * @param {string} category - category name (e.g. 'Seats & Organization')
 * @param {number} count - number of questions to generate (5|10|20)
 * @param {string} difficulty - 'easy'|'medium'|'hard'|'mixed'
 * @param {string} lang - 'it'|'en' (for prompts)
 * @returns {Promise<{success: boolean, questions?: Array, error?: string}>}
 */
export async function generateQuestionsWithAI(section, category, count, difficulty) {
  const rateCheck = checkRateLimit();
  if (!rateCheck.allowed) {
    return { success: false, error: rateCheck.reason };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, error: 'no_api_key' };
  }

  const difficultyInstruction = difficulty === 'mixed'
    ? 'Mix difficulty levels: ~30% easy, 50% medium, 20% hard.'
    : `All questions should be "${difficulty}" difficulty.`;

  const systemPrompt = `You are an expert question writer for the EPSO AD5 competition exam (European Personnel Selection Office).
Generate multiple-choice questions in BOTH Italian and English for the "${section}" section, category "${category}".

Each question MUST have exactly this JSON structure:
{
  "question_it": "...",
  "question_en": "...",
  "options": [
    {"text_it": "...", "text_en": "..."},
    {"text_it": "...", "text_en": "..."},
    {"text_it": "...", "text_en": "..."},
    {"text_it": "...", "text_en": "..."}
  ],
  "correct": 0,
  "explanation_it": "Brief explanation in Italian (1-2 sentences)",
  "explanation_en": "Brief explanation in English (1-2 sentences)",
  "motivation_it": "Detailed explanation of WHY the correct answer is right (Italian, 2-3 sentences with references)",
  "motivation_en": "Detailed explanation of WHY the correct answer is right (English, 2-3 sentences with references)",
  "wrong_explanations_it": ["Why A is wrong or empty if correct", "Why B is wrong or empty if correct", "Why C is wrong or empty if correct", "Why D is wrong or empty if correct"],
  "wrong_explanations_en": ["Why A is wrong or empty if correct", "Why B is wrong or empty if correct", "Why C is wrong or empty if correct", "Why D is wrong or empty if correct"],
  "category": "${category}",
  "difficulty": "easy|medium|hard"
}

Rules:
- Exactly 4 options per question
- "correct" is a 0-based index (0-3)
- wrong_explanations arrays have exactly 4 elements; the element at index "correct" MUST be an empty string ""
- All text must be factually accurate and up-to-date
- ${difficultyInstruction}
- Return ONLY a valid JSON array, no markdown fences, no extra text`;

  const userPrompt = `Generate exactly ${count} questions for category "${category}". Return a JSON array only.`;

  try {
    recordRequest();

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://epso-prep.local',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 16384,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text}`);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response');

    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array in response');
    const rawQuestions = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(rawQuestions)) throw new Error('Response is not an array');

    // Validate and assign IDs
    const prefix = SECTION_PREFIXES[section] || section.slice(0, 3);
    const timestamp = Date.now();
    const questions = [];

    rawQuestions.forEach((q, i) => {
      // Basic validation
      if (!q.question_it || !q.question_en) return;
      if (!Array.isArray(q.options) || q.options.length !== 4) return;
      if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) return;
      if (!q.explanation_it || !q.explanation_en) return;

      // Normalize wrong_explanations
      const weIt = Array.isArray(q.wrong_explanations_it) && q.wrong_explanations_it.length === 4
        ? q.wrong_explanations_it
        : Array.from({ length: 4 }, (_, idx) => idx === q.correct ? '' : '');
      const weEn = Array.isArray(q.wrong_explanations_en) && q.wrong_explanations_en.length === 4
        ? q.wrong_explanations_en
        : Array.from({ length: 4 }, (_, idx) => idx === q.correct ? '' : '');

      questions.push({
        id: `${prefix}-gen-${timestamp}-${i + 1}`,
        question_it: q.question_it,
        question_en: q.question_en,
        options: q.options.slice(0, 4).map(o => ({
          text_it: o.text_it || '',
          text_en: o.text_en || '',
        })),
        correct: q.correct,
        explanation_it: q.explanation_it,
        explanation_en: q.explanation_en,
        motivation_it: q.motivation_it || '',
        motivation_en: q.motivation_en || '',
        wrong_explanations_it: weIt,
        wrong_explanations_en: weEn,
        category: q.category || category,
        difficulty: q.difficulty || difficulty || 'medium',
        _generated: true,
        _generatedAt: new Date().toISOString(),
      });
    });

    if (questions.length === 0) throw new Error('No valid questions in response');

    return { success: true, questions };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function testConnection() {
  const apiKey = getApiKey();
  if (!apiKey) return { success: false, error: 'no_api_key' };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://epso-prep.local',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: 'Say "OK" in one word.' }],
        max_tokens: 10,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text}`);
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
