#!/usr/bin/env node
/* global process */

/**
 * Question generator for EPSO Prep AD5 - All sections via DeepSeek API (OpenRouter)
 *
 * Usage:
 *   node scripts/generate-questions.mjs acronyms 35
 *   node scripts/generate-questions.mjs situational 35
 *   node scripts/generate-questions.mjs it-advanced 35
 *   node scripts/generate-questions.mjs temporal 40
 *   node scripts/generate-questions.mjs eu-institutions 40
 *   node scripts/generate-questions.mjs digital-skills 80
 *   node scripts/generate-questions.mjs eu-knowledge 150
 *   node scripts/generate-questions.mjs verbal 40
 *   node scripts/generate-questions.mjs numerical 40
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-chat';
const API_KEY = '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';

const SECTION_CONFIG = {
  acronyms: {
    file: 'src/data/acronyms.json',
    prefix: 'acr',
    batchSize: 5,
    categories: {
      'EU Bodies': 8,
      'EU Programs': 10,
      'EU Legal': 8,
      'EU Policies': 9,
    },
  },
  situational: {
    file: 'src/data/situational.json',
    prefix: 'sit',
    batchSize: 5,
    categories: {
      "Citizens' Rights": 8,
      'Cross-Border Scenarios': 8,
      'Consumer Protection': 5,
      'Administrative Procedures': 7,
      'EU Workplace': 7,
    },
  },
  'it-advanced': {
    file: 'src/data/it-advanced.json',
    prefix: 'ita',
    batchSize: 5,
    categories: {
      'Networking & Security': 7,
      'Software Development': 7,
      'Digital Governance': 7,
      'Data & AI': 7,
      'Cloud & Infrastructure': 7,
    },
  },
  temporal: {
    file: 'src/data/temporal.json',
    prefix: 'temp',
    batchSize: 5,
    categories: {
      'Key Dates': 10,
      'Historical Events': 10,
      'EU Treaties': 8,
      'Accession History': 7,
      'EU Timeline': 5,
    },
  },
  'eu-institutions': {
    file: 'src/data/eu-institutions.json',
    prefix: 'eui',
    batchSize: 5,
    categories: {
      'EU Institutions': 10,
      'Decision Making': 10,
      'Seats & Organization': 7,
      'Competences': 7,
      'EU Processes': 6,
    },
  },
  'digital-skills': {
    file: 'src/data/digital-skills.json',
    prefix: 'ds',
    batchSize: 5,
    categories: {
      'Safety & Security': 16,
      'Problem Solving': 16,
      'Information & Data Literacy': 16,
      'Communication & Collaboration': 16,
      'Digital Content Creation': 16,
    },
  },
  'eu-knowledge': {
    file: 'src/data/eu-knowledge.json',
    prefix: 'eu',
    batchSize: 5,
    categories: {
      'EU History': 17,
      'EU Institutions': 17,
      'EU Law': 17,
      'EU Budget': 17,
      'EU Policies': 17,
      'EU Treaties': 16,
      'EU Enlargement': 17,
      'EU Internal Market': 16,
      'EU External Relations': 16,
    },
  },
  verbal: {
    file: 'src/data/verbal-reasoning.json',
    prefix: 'vr',
    batchSize: 5,
    hasPassage: true,
    categories: {
      'Inference': 10,
      'Logical Deduction': 8,
      'Main Point': 8,
      'Assumption': 7,
      'Strengthening/Weakening': 7,
    },
  },
  numerical: {
    file: 'src/data/numerical-reasoning.json',
    prefix: 'nr',
    batchSize: 5,
    hasPassage: true,
    categories: {
      'Percentage Calculations': 10,
      'Ratio & Proportion': 8,
      'Rate of Change': 8,
      'Data Interpretation': 8,
      'Data Comparison': 6,
    },
  },
};

// --- CLI ---
const [, , sectionArg, countArg] = process.argv;
const section = sectionArg;
const targetCount = parseInt(countArg || '10', 10);

if (!section || !SECTION_CONFIG[section]) {
  console.error(`Usage: node scripts/generate-questions.mjs <section> <count>`);
  console.error(`Sections: ${Object.keys(SECTION_CONFIG).join(', ')}`);
  process.exit(1);
}

const cfg = SECTION_CONFIG[section];

// --- API call with retry ---
async function callAPI(messages, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': 'https://epso-prep.local',
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const data = await res.json();
      return data.choices[0].message.content;
    } catch (e) {
      console.error(`  Attempt ${attempt}/${retries} failed: ${e.message}`);
      if (attempt < retries) {
        const delay = 2000 * Math.pow(2, attempt - 1);
        console.log(`  Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw e;
      }
    }
  }
}

// --- Extract existing topics to avoid duplicates ---
function getExistingTopics(questions) {
  return questions.map(q => {
    const topic = (q.question_en || '').slice(0, 80);
    return topic;
  });
}

// --- Get sample questions for examples ---
function getSampleQuestions(questions, category, count = 2) {
  const matching = questions.filter(q => q.category === category);
  if (matching.length >= count) return matching.slice(0, count);
  return questions.slice(0, count);
}

// --- Prompt builders ---
function getStandardPrompt(sectionName, category, difficulty, batchCount, existingTopics, samples) {
  const sampleJson = JSON.stringify(samples.slice(0, 1), null, 2);
  const topicList = existingTopics.slice(0, 40).join('\n- ');

  const sectionDescriptions = {
    acronyms: `EU acronyms and abbreviations. Questions should test knowledge of EU bodies, programs, legal instruments, and policies by their acronyms. IMPORTANT: Do NOT put the acronym in the question text - the question should describe the entity and options should include the acronym.`,
    situational: `Practical EU citizen scenarios. Questions present a realistic situation involving EU law/rights and ask which regulation, directive, or principle applies. Use specific names (e.g., "Maria, a Polish citizen living in Spain...").`,
    'it-advanced': `Advanced IT and digital competences for EU officials. Questions cover networking, cybersecurity, software development, digital governance, data science, AI, cloud computing, and IT infrastructure.`,
    temporal: `EU history dates, timelines, and chronological knowledge. Questions test knowledge of when treaties were signed, countries joined, policies were enacted, etc.`,
    'eu-institutions': `EU institutional knowledge - how EU institutions work, their composition, decision-making procedures, competences, and organizational details.`,
    'digital-skills': `DigComp 2.2 digital competences framework. Questions test practical digital skills across 5 areas: information literacy, communication, content creation, safety, and problem solving.`,
    'eu-knowledge': `Comprehensive EU knowledge for EPSO AD5 exam. Topics include EU history, institutions, law, budget, policies, treaties, enlargement, internal market, and external relations.`,
  };

  return {
    system: `You are an expert question writer for the EPSO AD5 competition exam (European Personnel Selection Office).
Generate ${batchCount} questions for the "${sectionName}" section, category "${category}", difficulty "${difficulty}".

SECTION DESCRIPTION: ${sectionDescriptions[sectionName]}

Each question MUST follow this EXACT JSON structure:
{
  "question_it": "Question text in Italian",
  "question_en": "Question text in English",
  "options": [
    {"text_it": "Option A in Italian", "text_en": "Option A in English"},
    {"text_it": "Option B in Italian", "text_en": "Option B in English"},
    {"text_it": "Option C in Italian", "text_en": "Option C in English"},
    {"text_it": "Option D in Italian", "text_en": "Option D in English"}
  ],
  "correct": 0,
  "explanation_it": "Detailed explanation in Italian with **bold** for key terms (2-3 sentences)",
  "explanation_en": "Detailed explanation in English with **bold** for key terms (2-3 sentences)",
  "motivation_it": "Additional context/motivation in Italian (1-2 sentences)",
  "motivation_en": "Additional context/motivation in English (1-2 sentences)",
  "wrong_explanations_it": ["", "Why option B is wrong (Italian)", "Why option C is wrong (Italian)", "Why option D is wrong (Italian)"],
  "wrong_explanations_en": ["", "Why option B is wrong (English)", "Why option C is wrong (English)", "Why option D is wrong (English)"],
  "category": "${category}",
  "difficulty": "${difficulty}"
}

EXAMPLE from existing data:
${sampleJson}

CRITICAL RULES:
- "correct" is 0-based (0-3), randomly varied across questions
- wrong_explanations[correct] MUST be "" (empty string), other 3 MUST be non-empty
- All text must be factually accurate about real EU institutions, laws, treaties
- Italian and English must be proper translations of each other
- Vary difficulty: easy = straightforward recall, medium = requires understanding, hard = requires analysis/comparison
- Use **bold** and *italic* markdown in explanations
- Return ONLY a JSON array, no markdown fences, no extra text

DO NOT repeat these existing topics:
- ${topicList}`,
    user: `Generate exactly ${batchCount} questions for category "${category}", difficulty "${difficulty}". Return a JSON array only.`,
  };
}

function getVerbalPrompt(category, difficulty, batchCount, existingTopics) {
  const topicList = existingTopics.slice(0, 30).join('\n- ');

  return {
    system: `You are an expert question writer for the EPSO AD5 Verbal Reasoning section.
Generate ${batchCount} questions in category "${category}", difficulty "${difficulty}".

Each question MUST have a reading passage (3-5 sentences about EU policy, law, or institutions) followed by a comprehension/reasoning question.

Return a JSON array where each element has this EXACT structure:
{
  "question_it": "Italian question text",
  "question_en": "English question text",
  "passage_it": "Italian reading passage (3-5 sentences about EU topics)",
  "passage_en": "English reading passage (3-5 sentences about EU topics)",
  "options": [
    {"text_it": "...", "text_en": "..."},
    {"text_it": "...", "text_en": "..."},
    {"text_it": "...", "text_en": "..."},
    {"text_it": "...", "text_en": "..."}
  ],
  "correct": 0,
  "explanation_it": "Detailed explanation in Italian (2-3 sentences)",
  "explanation_en": "Detailed explanation in English (2-3 sentences)",
  "motivation_it": "Why the correct answer is right (Italian, 2-3 sentences)",
  "motivation_en": "Why the correct answer is right (English, 2-3 sentences)",
  "wrong_explanations_it": ["", "Why B wrong", "Why C wrong", "Why D wrong"],
  "wrong_explanations_en": ["", "Why B wrong", "Why C wrong", "Why D wrong"],
  "category": "${category}",
  "difficulty": "${difficulty}"
}

CRITICAL RULES:
- The passage must be substantive (3-5 sentences), about realistic EU topics
- "correct" is 0-based (0-3), vary it across questions. wrong_explanations[correct] MUST be ""
- Questions must require genuine reasoning, not just keyword matching
- All text must be factually accurate
- Return ONLY the JSON array, no markdown code fences, no extra text

DO NOT repeat these existing topics:
- ${topicList}`,
    user: `Generate exactly ${batchCount} Verbal Reasoning questions. Return a JSON array only.`,
  };
}

function getNumericalPrompt(category, difficulty, batchCount, existingTopics) {
  const topicList = existingTopics.slice(0, 30).join('\n- ');

  return {
    system: `You are an expert question writer for the EPSO AD5 Numerical Reasoning section.
Generate ${batchCount} questions in category "${category}", difficulty "${difficulty}".

Each question MUST present a scenario with numerical data (budget figures, statistics, percentages, growth rates related to EU topics) followed by a calculation/interpretation question.

Return a JSON array where each element has this EXACT structure:
{
  "question_it": "Italian question asking for calculation/interpretation",
  "question_en": "English question asking for calculation/interpretation",
  "passage_it": "Italian data scenario with numbers (e.g. 'Nel 2023, il bilancio UE era 168.6 miliardi EUR...')",
  "passage_en": "English data scenario with numbers (e.g. 'In 2023, the EU budget was 168.6 billion EUR...')",
  "options": [
    {"text_it": "...", "text_en": "..."},
    {"text_it": "...", "text_en": "..."},
    {"text_it": "...", "text_en": "..."},
    {"text_it": "...", "text_en": "..."}
  ],
  "correct": 0,
  "explanation_it": "Step-by-step calculation explanation in Italian",
  "explanation_en": "Step-by-step calculation explanation in English",
  "motivation_it": "Why the correct answer is right with calculation steps (Italian)",
  "motivation_en": "Why the correct answer is right with calculation steps (English)",
  "wrong_explanations_it": ["", "Common mistake leading to B", "Common mistake leading to C", "Common mistake leading to D"],
  "wrong_explanations_en": ["", "Common mistake leading to B", "Common mistake leading to C", "Common mistake leading to D"],
  "category": "${category}",
  "difficulty": "${difficulty}"
}

CRITICAL RULES:
- The data scenario must contain specific numbers that can be used for calculations
- Wrong options should represent common calculation mistakes (wrong formula, missed step, etc.)
- "correct" is 0-based (0-3), vary it. wrong_explanations[correct] MUST be ""
- Ensure the math is accurate and verifiable
- Return ONLY the JSON array, no markdown code fences, no extra text

DO NOT repeat these existing topics:
- ${topicList}`,
    user: `Generate exactly ${batchCount} Numerical Reasoning questions. Return a JSON array only.`,
  };
}

// --- Validation ---
function validateQuestion(q, sectionName) {
  const errors = [];
  if (!q.question_it || !q.question_en) errors.push('missing question text');
  if (!Array.isArray(q.options) || q.options.length !== 4) errors.push('must have exactly 4 options');
  if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) errors.push('correct must be 0-3');
  if (q.options?.length === 4) {
    for (let i = 0; i < 4; i++) {
      if (!q.options[i]?.text_it || !q.options[i]?.text_en) errors.push(`option ${i} missing text`);
    }
  }
  if (!q.explanation_it || !q.explanation_en) errors.push('missing explanation');
  if (!q.category) errors.push('missing category');
  if (!q.difficulty) errors.push('missing difficulty');

  // Passage-based sections
  if (cfg.hasPassage && (!q.passage_it || !q.passage_en)) {
    errors.push('missing passage');
  }

  // Fix wrong_explanations if missing or wrong length
  if (!Array.isArray(q.wrong_explanations_it) || q.wrong_explanations_it.length !== 4) {
    if (q.correct >= 0 && q.correct <= 3) {
      q.wrong_explanations_it = [0, 1, 2, 3].map(i => i === q.correct ? '' : 'Risposta non corretta.');
      q.wrong_explanations_en = [0, 1, 2, 3].map(i => i === q.correct ? '' : 'Incorrect answer.');
    }
  } else {
    q.wrong_explanations_it[q.correct] = '';
    if (Array.isArray(q.wrong_explanations_en)) q.wrong_explanations_en[q.correct] = '';
  }

  if (!q.motivation_it) q.motivation_it = q.explanation_it || '';
  if (!q.motivation_en) q.motivation_en = q.explanation_en || '';

  return errors;
}

// --- Generate a single batch ---
async function generateBatch(sectionName, category, difficulty, batchCount, existingTopics, samples) {
  let prompt;
  if (sectionName === 'verbal') {
    prompt = getVerbalPrompt(category, difficulty, batchCount, existingTopics);
  } else if (sectionName === 'numerical') {
    prompt = getNumericalPrompt(category, difficulty, batchCount, existingTopics);
  } else {
    prompt = getStandardPrompt(sectionName, category, difficulty, batchCount, existingTopics, samples);
  }

  console.log(`  Calling API for ${batchCount} ${difficulty} "${category}" questions...`);

  const raw = await callAPI([
    { role: 'system', content: prompt.system },
    { role: 'user', content: prompt.user },
  ]);

  let questions;
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');
    questions = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error(`  Parse error: ${e.message}`);
    console.error(`  Raw response (first 500 chars): ${raw?.slice(0, 500)}`);
    return [];
  }

  const valid = [];
  for (const q of questions) {
    const errors = validateQuestion(q, sectionName);
    if (errors.length > 0) {
      console.warn(`  Skipping invalid question: ${errors.join(', ')}`);
      continue;
    }
    valid.push(q);
  }
  console.log(`  Got ${valid.length}/${batchCount} valid questions`);
  return valid;
}

// --- Main ---
async function main() {
  const outFile = path.resolve(ROOT, cfg.file);
  console.log(`\n=== Generating ${targetCount} new questions for "${section}" ===\n`);

  // Load existing
  let existing = [];
  if (fs.existsSync(outFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      console.log(`Found ${existing.length} existing questions.`);
    } catch { /* empty or invalid */ }
  }

  const existingTopics = getExistingTopics(existing);
  const allNewQuestions = [];

  // Calculate how many per category, respecting the category distribution
  const totalCategoryWeight = Object.values(cfg.categories).reduce((a, b) => a + b, 0);
  const categoryTargets = {};
  for (const [cat, weight] of Object.entries(cfg.categories)) {
    categoryTargets[cat] = Math.round((weight / totalCategoryWeight) * targetCount);
  }

  // Adjust rounding to match target
  let sum = Object.values(categoryTargets).reduce((a, b) => a + b, 0);
  const cats = Object.keys(categoryTargets);
  while (sum < targetCount) {
    categoryTargets[cats[sum % cats.length]]++;
    sum++;
  }
  while (sum > targetCount) {
    for (const c of cats) {
      if (categoryTargets[c] > 1 && sum > targetCount) {
        categoryTargets[c]--;
        sum--;
      }
    }
  }

  console.log('Category targets:', categoryTargets, '\n');

  for (const [category, catTarget] of Object.entries(categoryTargets)) {
    console.log(`--- Category: "${category}" (target: ${catTarget}) ---`);
    const samples = getSampleQuestions(existing, category);
    let categoryQuestions = [];

    // Split by difficulty: 30% easy, 40% medium, 30% hard
    const diffCounts = {
      easy: Math.round(catTarget * 0.3),
      medium: Math.round(catTarget * 0.4),
      hard: catTarget - Math.round(catTarget * 0.3) - Math.round(catTarget * 0.4),
    };

    for (const [difficulty, count] of Object.entries(diffCounts)) {
      if (count <= 0) continue;
      let remaining = count;

      while (remaining > 0) {
        const batchSize = Math.min(remaining, cfg.batchSize);
        try {
          const batch = await generateBatch(
            section, category, difficulty, batchSize,
            [...existingTopics, ...categoryQuestions.map(q => (q.question_en || '').slice(0, 80))],
            samples
          );
          categoryQuestions.push(...batch);
          remaining -= batchSize;
        } catch (e) {
          console.error(`  Fatal batch error: ${e.message}`);
          remaining -= cfg.batchSize;
        }

        // Rate limit delay
        if (remaining > 0) {
          console.log(`  Waiting 2s...`);
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }

    console.log(`  Category "${category}": ${categoryQuestions.length} new questions\n`);
    allNewQuestions.push(...categoryQuestions);

    // Wait between categories
    console.log(`  Waiting 3s before next category...\n`);
    await new Promise(r => setTimeout(r, 3000));
  }

  // Merge: existing + new, assign IDs
  const merged = [...existing, ...allNewQuestions];
  merged.forEach((q, i) => {
    q.id = `${cfg.prefix}-${String(i + 1).padStart(3, '0')}`;
  });

  // Save
  fs.writeFileSync(outFile, JSON.stringify(merged, null, 2) + '\n', 'utf8');
  console.log(`\n=== Done! Wrote ${merged.length} total questions to ${cfg.file} ===`);
  console.log(`  (${existing.length} existing + ${allNewQuestions.length} new)\n`);

  // Stats
  const stats = {};
  merged.forEach(q => {
    const key = `${q.category} (${q.difficulty})`;
    stats[key] = (stats[key] || 0) + 1;
  });
  console.log('Breakdown:');
  Object.entries(stats).sort().forEach(([k, v]) => console.log(`  ${k}: ${v}`));
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
