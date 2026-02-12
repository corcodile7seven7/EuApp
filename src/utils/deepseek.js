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
