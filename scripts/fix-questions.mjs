import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const files = [
  'acronyms', 'situational', 'it-advanced', 'temporal', 'eu-institutions',
  'digital-skills', 'eu-knowledge', 'verbal-reasoning', 'numerical-reasoning'
];

let totalFixed = 0;

for (const f of files) {
  const filePath = path.resolve(ROOT, 'src/data/' + f + '.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let fixed = 0;

  for (const q of data) {
    // Fix wrong_explanations arrays with wrong length
    if (!Array.isArray(q.wrong_explanations_it) || q.wrong_explanations_it.length !== 4) {
      q.wrong_explanations_it = [0, 1, 2, 3].map(i => i === q.correct ? '' : 'Risposta non corretta.');
      q.wrong_explanations_en = [0, 1, 2, 3].map(i => i === q.correct ? '' : 'Incorrect answer.');
      fixed++;
    }
    if (!Array.isArray(q.wrong_explanations_en) || q.wrong_explanations_en.length !== 4) {
      q.wrong_explanations_en = [0, 1, 2, 3].map(i => i === q.correct ? '' : 'Incorrect answer.');
      fixed++;
    }
    // Fix correct index having non-empty string
    if (q.wrong_explanations_it[q.correct] !== '') {
      q.wrong_explanations_it[q.correct] = '';
      fixed++;
    }
    if (q.wrong_explanations_en[q.correct] !== '') {
      q.wrong_explanations_en[q.correct] = '';
      fixed++;
    }
    // Fix missing question text
    if (!q.question_it && q.question_en) { q.question_it = q.question_en; fixed++; }
    if (!q.question_en && q.question_it) { q.question_en = q.question_it; fixed++; }
    // Fix missing motivation
    if (!q.motivation_it) { q.motivation_it = q.explanation_it || ''; fixed++; }
    if (!q.motivation_en) { q.motivation_en = q.explanation_en || ''; fixed++; }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  if (fixed > 0) console.log(`${f}: fixed ${fixed} issues`);
  totalFixed += fixed;
}

console.log(`\nTotal fixed: ${totalFixed}`);
