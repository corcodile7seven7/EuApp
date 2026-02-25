#!/usr/bin/env node
/* global process */

/**
 * Question generator / enricher for EPSO Prep AD5
 * Uses DeepSeek via OpenRouter API
 *
 * Usage:
 *   node scripts/generate-questions.js --section eu-knowledge --category "EU Institutions" --count 10 --output src/data/eu-knowledge-new.json
 *   node scripts/generate-questions.js --enrich --section eu-knowledge --output src/data/eu-knowledge.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-chat';
const API_KEY = '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';

const SECTION_FILES = {
  'eu-knowledge': 'src/data/eu-knowledge.json',
  'digital-skills': 'src/data/digital-skills.json',
  'temporal': 'src/data/temporal.json',
  'eu-institutions': 'src/data/eu-institutions.json',
  'acronyms': 'src/data/acronyms.json',
  'situational': 'src/data/situational.json',
  'it-advanced': 'src/data/it-advanced.json',
  'verbal-reasoning': 'src/data/verbal-reasoning.json',
  'numerical-reasoning': 'src/data/numerical-reasoning.json',
  'abstract-reasoning': 'src/data/abstract-reasoning.json',
};

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

const CATEGORIES = {
  'eu-knowledge': [
    'EU Institutions', 'EU Law & Treaties', 'EU History',
    'EU Policies', 'EU Budget & Finance', 'EU External Relations',
    'EU Agencies & Bodies', 'EU Values & Principles', 'EU Decision Making',
  ],
  'digital-skills': [
    'Information & Data Literacy', 'Communication & Collaboration',
    'Digital Content Creation', 'Safety & Security', 'Problem Solving',
  ],
  'temporal': ['EU Treaties', 'Timeline', 'Accession History', 'Key Dates'],
  'eu-institutions': ['Seats & Organization', 'Decision Making', 'Competences', 'Reform & History'],
  'acronyms': ['EU Bodies', 'Programs', 'Policies', 'Legal'],
  'situational': ["Citizens' Rights", 'Cross-Border Scenarios', 'Consumer Protection'],
  'it-advanced': ['Networking', 'Cloud', 'AI & Machine Learning', 'Software Dev', 'Digital Governance'],
  'verbal-reasoning': ['Reading Comprehension', 'Logical Deduction', 'Inference'],
  'numerical-reasoning': ['Percentages', 'Budget Analysis', 'Growth Rates', 'Statistics'],
  'abstract-reasoning': ['Visual Patterns', 'Sequences', 'Matrices'],
};

// --- CLI args ---
const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf('--' + name);
  if (idx === -1) return null;
  return args[idx + 1] || null;
}
const hasFlag = (name) => args.includes('--' + name);

const section = getArg('section');
const category = getArg('category');
const count = parseInt(getArg('count') || '10', 10);
const outputPath = getArg('output');
const enrichMode = hasFlag('enrich');
const dryRun = hasFlag('dry-run');
const listSections = hasFlag('list-sections');
const validateFile = getArg('validate');

// --list-sections: show available sections and exit
if (listSections) {
  console.log('Available sections:');
  for (const [id, file] of Object.entries(SECTION_FILES)) {
    const cats = CATEGORIES[id] || [];
    console.log(`  ${id}`);
    console.log(`    File: ${file}`);
    console.log(`    Categories: ${cats.join(', ')}`);
  }
  process.exit(0);
}

// --validate: validate an existing JSON file
if (validateFile) {
  const filePath = path.resolve(ROOT, validateFile);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Validating ${questions.length} questions from ${validateFile}...`);
  let errors = 0;
  for (let i = 0; i < questions.length; i++) {
    const errs = validateQuestion(questions[i]);
    if (errs.length > 0) {
      console.warn(`  [${i}] ${questions[i].id || '(no id)'}: ${errs.join(', ')}`);
      errors++;
    }
  }
  if (errors === 0) {
    console.log(`All ${questions.length} questions are valid.`);
  } else {
    console.log(`${errors}/${questions.length} questions have errors.`);
  }
  process.exit(errors > 0 ? 1 : 0);
}

if (!section || !SECTION_FILES[section]) {
  console.error('Usage: --section <section-id> [--category "..."] [--count N] [--output path] [--enrich] [--dry-run]');
  console.error('       --list-sections     List all available sections');
  console.error('       --validate <file>   Validate an existing JSON file');
  console.error('\nAvailable sections: ' + Object.keys(SECTION_FILES).join(', '));
  process.exit(1);
}

// --- API call ---
async function callDeepSeek(messages, temperature = 0.7) {
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
      temperature,
      max_tokens: 16384,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// --- Generate new questions ---
const BATCH_GEN_SIZE = 8; // Max questions per API call to avoid truncation

async function generateBatch(section, category, batchCount) {
  const systemPrompt = `You are an expert question writer for the EPSO AD5 competition exam (European Personnel Selection Office).
Generate multiple-choice questions in both Italian and English for the "${section}" section${category ? `, category "${category}"` : ''}.

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
  "explanation_it": "Brief explanation in Italian",
  "explanation_en": "Brief explanation in English",
  "motivation_it": "Detailed explanation of WHY the correct answer is right (Italian, 2-3 sentences)",
  "motivation_en": "Detailed explanation of WHY the correct answer is right (English, 2-3 sentences)",
  "wrong_explanations_it": ["Why option A is wrong (or empty if correct)", "Why option B is wrong", "Why option C is wrong", "Why option D is wrong"],
  "wrong_explanations_en": ["Why option A is wrong (or empty if correct)", "Why option B is wrong", "Why option C is wrong", "Why option D is wrong"],
  "category": "${category || 'General'}",
  "difficulty": "easy|medium|hard"
}

Rules:
- Exactly 4 options per question
- "correct" is a 0-based index (0-3)
- wrong_explanations arrays have exactly 4 elements; the element at index "correct" should be an empty string ""
- All text must be factually accurate and up-to-date
- Questions should test genuine knowledge, not be trivially guessable
- Mix difficulty levels: ~30% easy, 50% medium, 20% hard
- Return ONLY a JSON array, no markdown, no extra text`;

  const userPrompt = `Generate exactly ${batchCount} questions. Return a JSON array.`;

  const raw = await callDeepSeek([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  // Extract JSON array from response
  let questions;
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');
    questions = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('  Parse error:', e.message);
    return [];
  }

  // Validate
  const valid = [];
  for (const q of questions) {
    const errors = validateQuestion(q);
    if (errors.length > 0) {
      console.warn(`  Skipping invalid question: ${errors.join(', ')}`);
      continue;
    }
    valid.push(q);
  }
  return valid;
}

async function generateQuestions(section, category, count) {
  console.log(`Generating ${count} questions for ${section}${category ? ` / ${category}` : ''}...`);
  const allValid = [];
  let remaining = count;

  while (remaining > 0) {
    const batchSize = Math.min(remaining, BATCH_GEN_SIZE);
    console.log(`  Batch: requesting ${batchSize} (${allValid.length}/${count} done)...`);

    const batch = await generateBatch(section, category, batchSize);
    allValid.push(...batch);
    remaining -= batchSize;

    if (remaining > 0) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`  Total: ${allValid.length}/${count} valid questions generated`);
  return allValid;
}

// --- Enrich existing questions ---
async function enrichQuestions(questions) {
  const BATCH_SIZE = 5;
  const enriched = [];

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);
    const needsEnrich = batch.filter(q => !q.motivation_it || !q.wrong_explanations_it);

    if (needsEnrich.length === 0) {
      enriched.push(...batch);
      continue;
    }

    console.log(`Enriching batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(questions.length / BATCH_SIZE)} (${needsEnrich.length} questions)...`);

    const systemPrompt = `You are an expert at the EPSO AD5 competition exam. For each question provided, add detailed explanations.

For each question, return:
- "motivation_it": 2-3 sentences in Italian explaining WHY the correct answer is right, with legal/factual references
- "motivation_en": Same in English
- "wrong_explanations_it": Array of 4 strings. For each option: if it's the correct answer (index matches "correct"), use "". Otherwise explain why it's wrong in Italian (1-2 sentences).
- "wrong_explanations_en": Same in English

Return a JSON array with objects containing "id" and the four new fields. Nothing else.`;

    const simplifiedBatch = needsEnrich.map(q => ({
      id: q.id,
      question_en: q.question_en,
      options: q.options.map(o => o.text_en),
      correct: q.correct,
    }));

    try {
      const raw = await callDeepSeek([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(simplifiedBatch) },
      ], 0.5);

      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found');
      const results = JSON.parse(jsonMatch[0]);

      const resultMap = {};
      for (const r of results) {
        resultMap[r.id] = r;
      }

      for (const q of batch) {
        const r = resultMap[q.id];
        if (r) {
          q.motivation_it = r.motivation_it || q.motivation_it || '';
          q.motivation_en = r.motivation_en || q.motivation_en || '';
          q.wrong_explanations_it = r.wrong_explanations_it || q.wrong_explanations_it || [];
          q.wrong_explanations_en = r.wrong_explanations_en || q.wrong_explanations_en || [];
        }
        enriched.push(q);
      }
    } catch (e) {
      console.error(`  Batch error: ${e.message}. Keeping original questions.`);
      enriched.push(...batch);
    }

    // Rate limit: wait between batches
    if (i + BATCH_SIZE < questions.length) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  return enriched;
}

// --- Validation ---
function validateQuestion(q) {
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
  if (q.wrong_explanations_it && (!Array.isArray(q.wrong_explanations_it) || q.wrong_explanations_it.length !== 4)) {
    errors.push('wrong_explanations_it must have 4 elements');
  }
  if (q.wrong_explanations_en && (!Array.isArray(q.wrong_explanations_en) || q.wrong_explanations_en.length !== 4)) {
    errors.push('wrong_explanations_en must have 4 elements');
  }
  if (!q.category) errors.push('missing category');
  if (!q.difficulty) errors.push('missing difficulty');
  return errors;
}

// --- Main ---
async function main() {
  const dataFile = path.resolve(ROOT, SECTION_FILES[section]);

  if (enrichMode) {
    // Enrich existing questions
    const existing = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    console.log(`Loaded ${existing.length} existing questions from ${section}`);

    if (dryRun) {
      console.log('DRY RUN: Would enrich', existing.filter(q => !q.motivation_it).length, 'questions');
      return;
    }

    const enriched = await enrichQuestions(existing);
    const out = outputPath ? path.resolve(ROOT, outputPath) : dataFile;
    fs.writeFileSync(out, JSON.stringify(enriched, null, 2) + '\n', 'utf8');
    console.log(`Wrote ${enriched.length} enriched questions to ${out}`);
  } else {
    // Generate new questions
    const categories = category ? [category] : CATEGORIES[section];
    const perCategory = Math.ceil(count / categories.length);
    let allNew = [];

    for (const cat of categories) {
      const questions = await generateQuestions(section, cat, perCategory);
      allNew.push(...questions);

      // Rate limit between categories
      if (categories.length > 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    // Assign IDs
    const prefix = SECTION_PREFIXES[section] || section.slice(0, 3);
    let startId = 1;

    // If merging with existing file, start after max existing ID
    if (fs.existsSync(dataFile)) {
      const existing = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      const maxId = existing.reduce((max, q) => {
        if (!q.id) return max;
        const parts = q.id.split('-');
        const num = parseInt(parts[parts.length - 1], 10);
        return !isNaN(num) && num > max ? num : max;
      }, 0);
      startId = maxId + 1;
    }

    allNew.forEach((q, i) => {
      q.id = `${prefix}-${String(startId + i).padStart(3, '0')}`;
    });

    if (dryRun) {
      console.log(`DRY RUN: Would generate ${allNew.length} questions`);
      console.log('Sample:', JSON.stringify(allNew[0], null, 2));
      return;
    }

    const out = outputPath ? path.resolve(ROOT, outputPath) : dataFile;

    // If output is same as source, merge
    if (out === dataFile && fs.existsSync(dataFile)) {
      const existing = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      const merged = [...existing, ...allNew];
      fs.writeFileSync(out, JSON.stringify(merged, null, 2) + '\n', 'utf8');
      console.log(`Merged: ${existing.length} existing + ${allNew.length} new = ${merged.length} total`);
    } else {
      fs.writeFileSync(out, JSON.stringify(allNew, null, 2) + '\n', 'utf8');
      console.log(`Wrote ${allNew.length} new questions to ${out}`);
    }
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
