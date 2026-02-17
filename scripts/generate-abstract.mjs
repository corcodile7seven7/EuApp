/**
 * Deterministic generator for abstract reasoning questions.
 * Generates sequence questions + 3x3 matrix questions.
 *
 * Usage: node scripts/generate-abstract.mjs
 * Output: writes to src/data/abstract-reasoning-generated.json
 *         then merges with existing abstract-reasoning.json
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

// ── Palette & Constants ──────────────────────────────────────────────
const COLORS = ['#003399', '#FFCC00', '#DC2626', '#059669', '#7C3AED', '#0891B2'];
const COLOR_NAMES_IT = ['blu', 'giallo', 'rosso', 'verde', 'viola', 'ciano'];
const COLOR_NAMES_EN = ['blue', 'yellow', 'red', 'green', 'purple', 'cyan'];

const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star', 'cross', 'arrow'];
const SHAPE_NAMES_IT = ['cerchio', 'quadrato', 'triangolo', 'rombo', 'esagono', 'stella', 'croce', 'freccia'];
const SHAPE_NAMES_EN = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star', 'cross', 'arrow'];

const SIZES = ['small', 'medium', 'large'];
const SIZE_NAMES_IT = ['piccola', 'media', 'grande'];
const SIZE_NAMES_EN = ['small', 'medium', 'large'];

const ROTATIONS = [0, 45, 90, 135, 180, 225, 270, 315];

// Seeded PRNG for reproducibility
function mulberry32(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42_420);
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function pickIndex(len) { return Math.floor(rand() * len); }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Shape helpers ────────────────────────────────────────────────────
function makeShape(type, fill, size, rotation) {
  return { type, fill, size, rotation };
}

function colorName(hex, lang) {
  const idx = COLORS.indexOf(hex);
  return lang === 'it' ? COLOR_NAMES_IT[idx] : COLOR_NAMES_EN[idx];
}
function shapeName(type, lang) {
  const idx = SHAPES.indexOf(type);
  return lang === 'it' ? SHAPE_NAMES_IT[idx] : SHAPE_NAMES_EN[idx];
}
function sizeName(s, lang) {
  const idx = SIZES.indexOf(s);
  return lang === 'it' ? SIZE_NAMES_IT[idx] : SIZE_NAMES_EN[idx];
}

// ── Pattern generators ──────────────────────────────────────────────
function cycleColor(startIdx, step, count) {
  return Array.from({ length: count }, (_, i) => COLORS[(startIdx + i * step) % COLORS.length]);
}
function cycleShape(startIdx, step, count) {
  return Array.from({ length: count }, (_, i) => SHAPES[(startIdx + i * step) % SHAPES.length]);
}
function cycleSize(startIdx, count) {
  return Array.from({ length: count }, (_, i) => SIZES[(startIdx + i) % SIZES.length]);
}
function cycleRotation(start, delta, count) {
  return Array.from({ length: count }, (_, i) => ((start + i * delta) % 360 + 360) % 360);
}
function alternating(a, b, count) {
  return Array.from({ length: count }, (_, i) => (i % 2 === 0 ? a : b));
}

// ── Sequence question generator ─────────────────────────────────────
function generateSequenceQuestion(id, difficulty) {
  const seqLen = difficulty === 'easy' ? 3 : 4;
  const totalLen = seqLen + 1; // +1 for the answer

  // Pick which attributes vary
  const numVarying = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  const attrPool = shuffle(['color', 'shape', 'size', 'rotation']);
  const varyingAttrs = attrPool.slice(0, numVarying);
  const fixedAttrs = attrPool.slice(numVarying);

  // Fixed values
  const fixedColor = pick(COLORS);
  const fixedShape = pick(SHAPES);
  const fixedSize = pick(SIZES);
  const fixedRotation = pick([0, 0, 0, 45, 90]); // bias toward 0

  // Generate varying sequences
  const sequences = {};
  const explanationParts_it = [];
  const explanationParts_en = [];

  for (const attr of varyingAttrs) {
    switch (attr) {
      case 'color': {
        const startIdx = pickIndex(COLORS.length);
        const step = pick([1, 2]);
        sequences.color = cycleColor(startIdx, step, totalLen);
        explanationParts_it.push(`il colore cambia ciclicamente (${sequences.color.slice(0, seqLen).map(c => colorName(c, 'it')).join('→')}→${colorName(sequences.color[seqLen], 'it')})`);
        explanationParts_en.push(`color cycles (${sequences.color.slice(0, seqLen).map(c => colorName(c, 'en')).join('→')}→${colorName(sequences.color[seqLen], 'en')})`);
        break;
      }
      case 'shape': {
        const startIdx = pickIndex(SHAPES.length);
        const step = pick([1, 2]);
        sequences.shape = cycleShape(startIdx, step, totalLen);
        explanationParts_it.push(`la forma cambia ciclicamente (${sequences.shape.slice(0, seqLen).map(s => shapeName(s, 'it')).join('→')}→${shapeName(sequences.shape[seqLen], 'it')})`);
        explanationParts_en.push(`shape cycles (${sequences.shape.slice(0, seqLen).map(s => shapeName(s, 'en')).join('→')}→${shapeName(sequences.shape[seqLen], 'en')})`);
        break;
      }
      case 'size': {
        const startIdx = pickIndex(SIZES.length);
        sequences.size = cycleSize(startIdx, totalLen);
        explanationParts_it.push(`la dimensione progredisce (${sequences.size.slice(0, seqLen).map(s => sizeName(s, 'it')).join('→')}→${sizeName(sequences.size[seqLen], 'it')})`);
        explanationParts_en.push(`size progresses (${sequences.size.slice(0, seqLen).map(s => sizeName(s, 'en')).join('→')}→${sizeName(sequences.size[seqLen], 'en')})`);
        break;
      }
      case 'rotation': {
        const start = pick([0, 45, 90]);
        const delta = pick([45, 90, 135]);
        sequences.rotation = cycleRotation(start, delta, totalLen);
        explanationParts_it.push(`la rotazione aumenta di ${delta}° ad ogni passo`);
        explanationParts_en.push(`rotation increases by ${delta}° each step`);
        break;
      }
    }
  }

  // Build shapes
  const allShapes = Array.from({ length: totalLen }, (_, i) => makeShape(
    sequences.shape ? sequences.shape[i] : fixedShape,
    sequences.color ? sequences.color[i] : fixedColor,
    sequences.size ? sequences.size[i] : fixedSize,
    sequences.rotation ? sequences.rotation[i] : fixedRotation
  ));

  const sequence = allShapes.slice(0, seqLen);
  const correct = allShapes[seqLen];

  // Generate distractors (each violates exactly 1 rule)
  const distractors = [];
  const violationAttrs = shuffle([...varyingAttrs, ...fixedAttrs.slice(0, Math.max(1, 3 - varyingAttrs.length))]).slice(0, 3);

  for (let d = 0; d < 3; d++) {
    const distractor = { ...correct };
    const violateAttr = violationAttrs[d % violationAttrs.length];

    switch (violateAttr) {
      case 'color': {
        const wrongColors = COLORS.filter(c => c !== correct.fill);
        distractor.fill = pick(wrongColors);
        break;
      }
      case 'shape': {
        const wrongShapes = SHAPES.filter(s => s !== correct.type);
        distractor.type = pick(wrongShapes);
        break;
      }
      case 'size': {
        const wrongSizes = SIZES.filter(s => s !== correct.size);
        distractor.size = pick(wrongSizes);
        break;
      }
      case 'rotation': {
        const wrongRots = ROTATIONS.filter(r => r !== correct.rotation);
        distractor.rotation = pick(wrongRots);
        break;
      }
    }
    distractors.push(distractor);
  }

  // Shuffle options, track correct position
  const correctIdx = pickIndex(4);
  const options_shapes = [];
  let dIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i === correctIdx) {
      options_shapes.push(correct);
    } else {
      options_shapes.push(distractors[dIdx++]);
    }
  }

  // Wrong explanations
  const wrongExplanations_it = options_shapes.map((opt, i) => {
    if (i === correctIdx) return '';
    const diffs = [];
    if (opt.type !== correct.type) diffs.push('forma sbagliata');
    if (opt.fill !== correct.fill) diffs.push('colore sbagliato');
    if (opt.size !== correct.size) diffs.push('dimensione sbagliata');
    if (opt.rotation !== correct.rotation) diffs.push('rotazione sbagliata');
    return diffs.join(', ') || 'Non segue il pattern';
  });
  const wrongExplanations_en = options_shapes.map((opt, i) => {
    if (i === correctIdx) return '';
    const diffs = [];
    if (opt.type !== correct.type) diffs.push('wrong shape');
    if (opt.fill !== correct.fill) diffs.push('wrong color');
    if (opt.size !== correct.size) diffs.push('wrong size');
    if (opt.rotation !== correct.rotation) diffs.push('wrong rotation');
    return diffs.join(', ') || 'Does not follow the pattern';
  });

  const category = varyingAttrs.includes('shape') ? 'Transformation Rules' : 'Pattern Sequence';

  return {
    id,
    question_it: 'Quale figura completa la sequenza?',
    question_en: 'Which figure completes the sequence?',
    sequence,
    options_shapes,
    options: [
      { text_it: 'Figura A', text_en: 'Figure A' },
      { text_it: 'Figura B', text_en: 'Figure B' },
      { text_it: 'Figura C', text_en: 'Figure C' },
      { text_it: 'Figura D', text_en: 'Figure D' },
    ],
    correct: correctIdx,
    explanation_it: `La regola è: ${explanationParts_it.join('; ')}. Gli altri attributi rimangono costanti.`,
    explanation_en: `The rule is: ${explanationParts_en.join('; ')}. Other attributes remain constant.`,
    motivation_it: `La sequenza mostra un pattern basato su ${varyingAttrs.length} attributo/i che cambiano sistematicamente.`,
    motivation_en: `The sequence shows a pattern based on ${varyingAttrs.length} attribute(s) changing systematically.`,
    wrong_explanations_it: wrongExplanations_it,
    wrong_explanations_en: wrongExplanations_en,
    category,
    difficulty,
  };
}

// ── Matrix question generator ───────────────────────────────────────
function generateMatrixQuestion(id, difficulty) {
  // Row rule + column rule
  // Each row follows a pattern, each column follows a pattern
  // The missing cell (2,2) must satisfy both

  let rowAttr, colAttr;
  if (difficulty === 'easy') {
    // 1 rule: rows vary by one attribute, columns constant
    rowAttr = pick(['color', 'shape', 'size']);
    colAttr = null;
  } else if (difficulty === 'medium') {
    // 2 rules: rows vary by one, columns vary by another
    const attrs = shuffle(['color', 'shape', 'size', 'rotation']);
    rowAttr = attrs[0];
    colAttr = attrs[1];
  } else {
    // hard: 2 distinct rules
    const attrs = shuffle(['color', 'shape', 'size', 'rotation']);
    rowAttr = attrs[0];
    colAttr = attrs[1];
  }

  // Generate row sequences (3 values per attribute per row)
  const baseShape = pick(SHAPES);
  const baseColor = pick(COLORS);
  const baseSize = pick(SIZES);
  const baseRotation = pick([0, 45, 90]);

  // Row pattern: each row uses the same cycling pattern for rowAttr
  const rowStartIdx = pickIndex(6);
  const rowStep = pick([1, 2]);

  // Column pattern: each column uses the same cycling pattern for colAttr
  const colStartIdx = pickIndex(6);
  const colStep = pick([1, 2]);

  function getRowValue(attr, col) {
    switch (attr) {
      case 'color': return COLORS[(rowStartIdx + col * rowStep) % COLORS.length];
      case 'shape': return SHAPES[(rowStartIdx + col * rowStep) % SHAPES.length];
      case 'size': return SIZES[(rowStartIdx + col) % SIZES.length];
      case 'rotation': return ((rowStartIdx * 45 + col * 90) % 360);
      default: return null;
    }
  }

  function getColValue(attr, row) {
    switch (attr) {
      case 'color': return COLORS[(colStartIdx + row * colStep) % COLORS.length];
      case 'shape': return SHAPES[(colStartIdx + row * colStep) % SHAPES.length];
      case 'size': return SIZES[(colStartIdx + row) % SIZES.length];
      case 'rotation': return ((colStartIdx * 45 + row * 90) % 360);
      default: return null;
    }
  }

  // Build the 3x3 matrix
  const matrix = [];
  for (let row = 0; row < 3; row++) {
    const matrixRow = [];
    for (let col = 0; col < 3; col++) {
      let type = baseShape;
      let fill = baseColor;
      let size = baseSize;
      let rotation = baseRotation;

      // Apply row rule
      if (rowAttr === 'color') fill = getRowValue('color', col);
      else if (rowAttr === 'shape') type = getRowValue('shape', col);
      else if (rowAttr === 'size') size = getRowValue('size', col);
      else if (rowAttr === 'rotation') rotation = getRowValue('rotation', col);

      // Apply column rule
      if (colAttr === 'color') fill = getColValue('color', row);
      else if (colAttr === 'shape') type = getColValue('shape', row);
      else if (colAttr === 'size') size = getColValue('size', row);
      else if (colAttr === 'rotation') rotation = getColValue('rotation', row);

      // Last cell is null (the missing one)
      if (row === 2 && col === 2) {
        matrixRow.push(null);
      } else {
        matrixRow.push(makeShape(type, fill, size, rotation));
      }
    }
    matrix.push(matrixRow);
  }

  // Calculate the correct answer (cell [2][2])
  let correctType = baseShape;
  let correctFill = baseColor;
  let correctSize = baseSize;
  let correctRotation = baseRotation;

  if (rowAttr === 'color') correctFill = getRowValue('color', 2);
  else if (rowAttr === 'shape') correctType = getRowValue('shape', 2);
  else if (rowAttr === 'size') correctSize = getRowValue('size', 2);
  else if (rowAttr === 'rotation') correctRotation = getRowValue('rotation', 2);

  if (colAttr === 'color') correctFill = getColValue('color', 2);
  else if (colAttr === 'shape') correctType = getColValue('shape', 2);
  else if (colAttr === 'size') correctSize = getColValue('size', 2);
  else if (colAttr === 'rotation') correctRotation = getColValue('rotation', 2);

  const correct = makeShape(correctType, correctFill, correctSize, correctRotation);

  // Generate 3 distractors
  const distractors = [];
  const violationPool = shuffle([rowAttr, colAttr || 'color', 'shape', 'size', 'rotation']
    .filter((v, i, a) => a.indexOf(v) === i));

  for (let d = 0; d < 3; d++) {
    const distractor = { ...correct };
    const violateAttr = violationPool[d % violationPool.length];

    switch (violateAttr) {
      case 'color': {
        const wrongColors = COLORS.filter(c => c !== correct.fill);
        distractor.fill = pick(wrongColors);
        break;
      }
      case 'shape': {
        const wrongShapes = SHAPES.filter(s => s !== correct.type);
        distractor.type = pick(wrongShapes);
        break;
      }
      case 'size': {
        const wrongSizes = SIZES.filter(s => s !== correct.size);
        distractor.size = pick(wrongSizes);
        break;
      }
      case 'rotation': {
        const wrongRots = ROTATIONS.filter(r => r !== correct.rotation);
        distractor.rotation = pick(wrongRots);
        break;
      }
    }
    distractors.push(distractor);
  }

  // Shuffle options
  const correctIdx = pickIndex(4);
  const options_shapes = [];
  let dIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i === correctIdx) {
      options_shapes.push(correct);
    } else {
      options_shapes.push(distractors[dIdx++]);
    }
  }

  // Build explanations
  const ruleDescParts_it = [];
  const ruleDescParts_en = [];

  if (rowAttr) {
    const attrName_it = { color: 'colore', shape: 'forma', size: 'dimensione', rotation: 'rotazione' }[rowAttr];
    const attrName_en = rowAttr;
    ruleDescParts_it.push(`ogni riga segue un pattern di ${attrName_it}`);
    ruleDescParts_en.push(`each row follows a ${attrName_en} pattern`);
  }
  if (colAttr) {
    const attrName_it = { color: 'colore', shape: 'forma', size: 'dimensione', rotation: 'rotazione' }[colAttr];
    const attrName_en = colAttr;
    ruleDescParts_it.push(`ogni colonna segue un pattern di ${attrName_it}`);
    ruleDescParts_en.push(`each column follows a ${attrName_en} pattern`);
  }

  const wrongExplanations_it = options_shapes.map((opt, i) => {
    if (i === correctIdx) return '';
    const diffs = [];
    if (opt.type !== correct.type) diffs.push('forma sbagliata');
    if (opt.fill !== correct.fill) diffs.push('colore sbagliato');
    if (opt.size !== correct.size) diffs.push('dimensione sbagliata');
    if (opt.rotation !== correct.rotation) diffs.push('rotazione sbagliata');
    return diffs.join(', ') || 'Non soddisfa entrambe le regole';
  });
  const wrongExplanations_en = options_shapes.map((opt, i) => {
    if (i === correctIdx) return '';
    const diffs = [];
    if (opt.type !== correct.type) diffs.push('wrong shape');
    if (opt.fill !== correct.fill) diffs.push('wrong color');
    if (opt.size !== correct.size) diffs.push('wrong size');
    if (opt.rotation !== correct.rotation) diffs.push('wrong rotation');
    return diffs.join(', ') || 'Does not satisfy both rules';
  });

  return {
    id,
    question_it: 'Quale figura completa la matrice?',
    question_en: 'Which figure completes the matrix?',
    matrix,
    options_shapes,
    options: [
      { text_it: 'Figura A', text_en: 'Figure A' },
      { text_it: 'Figura B', text_en: 'Figure B' },
      { text_it: 'Figura C', text_en: 'Figure C' },
      { text_it: 'Figura D', text_en: 'Figure D' },
    ],
    correct: correctIdx,
    explanation_it: `La regola è: ${ruleDescParts_it.join('; ')}. La cella mancante deve soddisfare entrambe le regole.`,
    explanation_en: `The rule is: ${ruleDescParts_en.join('; ')}. The missing cell must satisfy both rules.`,
    motivation_it: 'Analizza le righe e le colonne della matrice per identificare i pattern ricorrenti.',
    motivation_en: 'Analyze the rows and columns of the matrix to identify recurring patterns.',
    wrong_explanations_it: wrongExplanations_it,
    wrong_explanations_en: wrongExplanations_en,
    category: 'Matrix Completion',
    difficulty,
  };
}

// ── Main generation ─────────────────────────────────────────────────
function generate() {
  const questions = [];
  let nextId = 61;

  // Sequence questions: 40 total
  // Distribution: 12 easy, 16 medium, 12 hard
  const seqDistribution = [
    ...Array(12).fill('easy'),
    ...Array(16).fill('medium'),
    ...Array(12).fill('hard'),
  ];

  for (const diff of seqDistribution) {
    const id = `ar-${String(nextId).padStart(3, '0')}`;
    questions.push(generateSequenceQuestion(id, diff));
    nextId++;
  }

  // Matrix questions: 20 total
  // Distribution: 6 easy, 8 medium, 6 hard
  const matDistribution = [
    ...Array(6).fill('easy'),
    ...Array(8).fill('medium'),
    ...Array(6).fill('hard'),
  ];

  for (const diff of matDistribution) {
    const id = `ar-${String(nextId).padStart(3, '0')}`;
    questions.push(generateMatrixQuestion(id, diff));
    nextId++;
  }

  return questions;
}

// ── Validation ──────────────────────────────────────────────────────
function validate(questions) {
  let errors = 0;
  for (const q of questions) {
    if (!q.id || !q.question_it || !q.question_en) {
      console.error(`Missing basic fields: ${q.id}`);
      errors++;
    }
    if (!q.sequence && !q.matrix) {
      console.error(`No sequence or matrix: ${q.id}`);
      errors++;
    }
    if (!q.options_shapes || q.options_shapes.length !== 4) {
      console.error(`Bad options_shapes: ${q.id}`);
      errors++;
    }
    if (q.correct < 0 || q.correct > 3) {
      console.error(`Bad correct index: ${q.id}`);
      errors++;
    }
    if (q.wrong_explanations_it[q.correct] !== '') {
      console.error(`Wrong explanation for correct answer not empty: ${q.id}`);
      errors++;
    }
    if (q.matrix) {
      if (q.matrix.length !== 3 || q.matrix[0].length !== 3) {
        console.error(`Bad matrix dimensions: ${q.id}`);
        errors++;
      }
      if (q.matrix[2][2] !== null) {
        console.error(`Matrix[2][2] should be null: ${q.id}`);
        errors++;
      }
    }
    // Verify each option shape has required fields
    for (const opt of q.options_shapes) {
      if (!opt.type || !opt.fill || !opt.size || opt.rotation === undefined) {
        console.error(`Option shape missing fields: ${q.id}`);
        errors++;
      }
    }
  }
  return errors;
}

// ── Run ─────────────────────────────────────────────────────────────
const newQuestions = generate();
const errors = validate(newQuestions);

if (errors > 0) {
  console.error(`\n❌ ${errors} validation errors found. Aborting.`);
  process.exit(1);
}

// Read existing questions
const existingPath = join(DATA_DIR, 'abstract-reasoning.json');
const existing = JSON.parse(readFileSync(existingPath, 'utf-8'));

// Merge
const merged = [...existing, ...newQuestions];

// Write merged file
writeFileSync(existingPath, JSON.stringify(merged, null, 2) + '\n', 'utf-8');

console.log(`✅ Generated ${newQuestions.length} new questions (${newQuestions.filter(q => q.sequence).length} sequences, ${newQuestions.filter(q => q.matrix).length} matrices)`);
console.log(`📊 Total: ${merged.length} questions`);
console.log(`   Categories: ${JSON.stringify(
  merged.reduce((acc, q) => { acc[q.category] = (acc[q.category] || 0) + 1; return acc; }, {})
)}`);
console.log(`   Difficulties: ${JSON.stringify(
  merged.reduce((acc, q) => { acc[q.difficulty] = (acc[q.difficulty] || 0) + 1; return acc; }, {})
)}`);
