/**
 * EPSO Abstract Reasoning Question Generator (v2)
 * Generates 120 questions with diverse, explicit EPSO-style patterns.
 *
 * Pattern types covered:
 *   1. Color progression (cycling through palette)
 *   2. Size progression (small → medium → large)
 *   3. Rotation progression (0° → 90° → 180° → 270°)
 *   4. Shape sequence (circle → square → triangle → ?)
 *   5. Alternation ABAB / ABCABC
 *   6. Matrix 3×3 (row rule + optional column rule)
 *   7. Multi-attribute combined rules
 *   8. Reverse progressions (large → medium → small)
 *
 * Usage: node scripts/generate-abstract-questions.mjs
 * Output: replaces src/data/abstract-reasoning.json entirely
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

// ── Constants ─────────────────────────────────────────────────────────────────
const COLORS = ['#003399', '#FFCC00', '#DC2626', '#059669', '#7C3AED', '#0891B2'];
const COLOR_IT = ['blu', 'giallo', 'rosso', 'verde', 'viola', 'ciano'];
const COLOR_EN = ['blue', 'yellow', 'red', 'green', 'purple', 'cyan'];

const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star', 'cross', 'arrow'];
const SHAPE_IT = ['cerchio', 'quadrato', 'triangolo', 'rombo', 'esagono', 'stella', 'croce', 'freccia'];
const SHAPE_EN = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star', 'cross', 'arrow'];

const SIZES = ['small', 'medium', 'large'];
const SIZE_IT = ['piccola', 'media', 'grande'];
const SIZE_EN = ['small', 'medium', 'large'];

const ROTATIONS = [0, 45, 90, 135, 180, 225, 270, 315];

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
function mulberry32(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(99_721); // different seed from existing script
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function pickIdx(len) { return Math.floor(rand() * len); }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function shape(type, fill, size, rotation = 0) {
  return { type, fill, size, rotation };
}
function ci(hex) { return COLORS.indexOf(hex); }
function si(type) { return SHAPES.indexOf(type); }
function zi(s) { return SIZES.indexOf(s); }

function colorIt(hex) { const i = ci(hex); return i >= 0 ? COLOR_IT[i] : hex; }
function colorEn(hex) { const i = ci(hex); return i >= 0 ? COLOR_EN[i] : hex; }
function shapeIt(t) { const i = si(t); return i >= 0 ? SHAPE_IT[i] : t; }
function shapeEn(t) { const i = si(t); return i >= 0 ? SHAPE_EN[i] : t; }
function sizeIt(s) { const i = zi(s); return i >= 0 ? SIZE_IT[i] : s; }
function sizeEn(s) { const i = zi(s); return i >= 0 ? SIZE_EN[i] : s; }

function wrongExplanation(opt, correct) {
  const diffs_it = [], diffs_en = [];
  if (opt.type !== correct.type) { diffs_it.push('forma sbagliata'); diffs_en.push('wrong shape'); }
  if (opt.fill !== correct.fill) { diffs_it.push('colore sbagliato'); diffs_en.push('wrong color'); }
  if (opt.size !== correct.size) { diffs_it.push('dimensione sbagliata'); diffs_en.push('wrong size'); }
  if (opt.rotation !== correct.rotation) { diffs_it.push('rotazione sbagliata'); diffs_en.push('wrong rotation'); }
  return {
    it: diffs_it.join(', ') || 'Non segue il pattern',
    en: diffs_en.join(', ') || 'Does not follow the pattern',
  };
}

function buildOptions(correct, distractors) {
  const correctIdx = pickIdx(4);
  const opts = [];
  let d = 0;
  for (let i = 0; i < 4; i++) {
    opts.push(i === correctIdx ? correct : distractors[d++]);
  }
  const weIt = opts.map((o, i) => i === correctIdx ? '' : wrongExplanation(o, correct).it);
  const weEn = opts.map((o, i) => i === correctIdx ? '' : wrongExplanation(o, correct).en);
  return { options_shapes: opts, correct: correctIdx, wrong_explanations_it: weIt, wrong_explanations_en: weEn };
}

function pickDistinctColor(exclude) {
  const pool = COLORS.filter(c => c !== exclude);
  return pick(pool);
}
function pickDistinctShape(exclude) {
  const pool = SHAPES.filter(s => s !== exclude);
  return pick(pool);
}
function pickDistinctSize(exclude) {
  return SIZES.find(s => s !== exclude) || 'medium';
}
function pickDistinctRotation(exclude) {
  const pool = ROTATIONS.filter(r => r !== exclude);
  return pick(pool);
}

const OPTIONS_LABELS = [
  { text_it: 'Figura A', text_en: 'Figure A' },
  { text_it: 'Figura B', text_en: 'Figure B' },
  { text_it: 'Figura C', text_en: 'Figure C' },
  { text_it: 'Figura D', text_en: 'Figure D' },
];

// ── Pattern 1: Color Cycle ────────────────────────────────────────────────────
function genColorCycle(id, seqLen) {
  const baseShape = pick(SHAPES);
  const baseSize = pick(SIZES);
  const startIdx = pickIdx(COLORS.length);
  const step = pick([1, 2]);

  const allColors = Array.from({ length: seqLen + 1 }, (_, i) => COLORS[(startIdx + i * step) % COLORS.length]);
  const sequence = allColors.slice(0, seqLen).map(c => shape(baseShape, c, baseSize));
  const correctShape = shape(baseShape, allColors[seqLen], baseSize);

  const distractors = [
    shape(baseShape, pickDistinctColor(correctShape.fill), baseSize),
    shape(pickDistinctShape(baseShape), correctShape.fill, baseSize),
    shape(baseShape, correctShape.fill, pickDistinctSize(baseSize)),
  ];

  const { options_shapes, correct, wrong_explanations_it, wrong_explanations_en } = buildOptions(correctShape, distractors);

  const colList_it = allColors.slice(0, seqLen).map(colorIt).join(' → ');
  const colList_en = allColors.slice(0, seqLen).map(colorEn).join(' → ');

  return {
    id,
    question_it: `Le ${seqLen} figure mostrano una progressione di colore. Quale figura viene dopo?`,
    question_en: `The ${seqLen} figures show a color progression. Which figure comes next?`,
    sequence,
    options_shapes,
    options: OPTIONS_LABELS,
    correct,
    explanation_it: `Il colore segue un ciclo: ${colList_it} → **${colorIt(correctShape.fill)}**. La forma e la dimensione restano costanti.`,
    explanation_en: `The color follows a cycle: ${colList_en} → **${colorEn(correctShape.fill)}**. Shape and size remain constant.`,
    motivation_it: `Individua il passo del ciclo cromatico confrontando figure consecutive. Il colore avanza di ${step} posizione/i nella palette ogni passo.`,
    motivation_en: `Identify the color cycle step by comparing consecutive figures. The color advances by ${step} position(s) in the palette each step.`,
    wrong_explanations_it,
    wrong_explanations_en,
    category: 'Color Progression',
    difficulty: seqLen <= 3 ? 'easy' : 'medium',
  };
}

// ── Pattern 2: Size Progression ───────────────────────────────────────────────
function genSizeProgression(id, forward = true) {
  const baseShape = pick(SHAPES);
  const baseColor = pick(COLORS);
  const sizes = forward ? ['small', 'medium', 'large'] : ['large', 'medium', 'small'];
  const sequence = sizes.slice(0, 3).map(s => shape(baseShape, baseColor, s));
  const correctShape = shape(baseShape, baseColor, sizes[3] || (forward ? 'small' : 'large')); // wrap

  // Use 4-element cycle if wrapping
  const fullSizes = forward
    ? ['small', 'medium', 'large', 'small']
    : ['large', 'medium', 'small', 'large'];
  const correct4 = shape(baseShape, baseColor, fullSizes[3]);

  const distractors = [
    shape(baseShape, pickDistinctColor(baseColor), fullSizes[3]),
    shape(pickDistinctShape(baseShape), baseColor, fullSizes[3]),
    shape(baseShape, baseColor, fullSizes[3] === 'small' ? 'medium' : 'small'),
  ];

  const { options_shapes, correct, wrong_explanations_it, wrong_explanations_en } = buildOptions(correct4, distractors);
  const dir_it = forward ? 'aumenta (piccola → media → grande)' : 'diminuisce (grande → media → piccola)';
  const dir_en = forward ? 'increases (small → medium → large)' : 'decreases (large → medium → small)';

  return {
    id,
    question_it: `La dimensione delle figure ${dir_it}. Quale figura completa la serie con la quarta dimensione del ciclo?`,
    question_en: `The size of the figures ${dir_en}. Which figure completes the series with the fourth size in the cycle?`,
    sequence,
    options_shapes,
    options: OPTIONS_LABELS,
    correct,
    explanation_it: `La dimensione segue il ciclo: ${fullSizes.slice(0,3).map(sizeIt).join(' → ')} → **${sizeIt(fullSizes[3])}**. La forma e il colore rimangono costanti.`,
    explanation_en: `The size follows the cycle: ${fullSizes.slice(0,3).map(sizeEn).join(' → ')} → **${sizeEn(fullSizes[3])}**. Shape and color remain constant.`,
    motivation_it: 'La progressione di dimensione è uno dei pattern più comuni nel ragionamento astratto EPSO. Il ciclo riparte dopo la terza dimensione.',
    motivation_en: 'Size progression is one of the most common patterns in EPSO abstract reasoning. The cycle restarts after the third size.',
    wrong_explanations_it,
    wrong_explanations_en,
    category: 'Size Progression',
    difficulty: 'easy',
  };
}

// ── Pattern 3: Rotation Progression ──────────────────────────────────────────
function genRotationProgression(id) {
  const baseShape = pick(['arrow', 'triangle', 'diamond', 'cross']);
  const baseColor = pick(COLORS);
  const baseSize = pick(SIZES);
  const start = pick([0, 45, 90]);
  const delta = pick([45, 90, 135]);

  const allRots = Array.from({ length: 4 }, (_, i) => ((start + i * delta) % 360 + 360) % 360);
  const sequence = allRots.slice(0, 3).map(r => shape(baseShape, baseColor, baseSize, r));
  const correctShape = shape(baseShape, baseColor, baseSize, allRots[3]);

  const distractors = [
    shape(baseShape, baseColor, baseSize, pickDistinctRotation(allRots[3])),
    shape(baseShape, pickDistinctColor(baseColor), baseSize, allRots[3]),
    shape(pickDistinctShape(baseShape), baseColor, baseSize, allRots[3]),
  ];

  const { options_shapes, correct, wrong_explanations_it, wrong_explanations_en } = buildOptions(correctShape, distractors);
  const rotList = allRots.slice(0, 3).map(r => `${r}°`).join(' → ');

  return {
    id,
    question_it: `La figura ruota di ${delta}° ad ogni passo (${rotList} → ?). Quale figura viene dopo?`,
    question_en: `The figure rotates by ${delta}° each step (${rotList} → ?). Which figure comes next?`,
    sequence,
    options_shapes,
    options: OPTIONS_LABELS,
    correct,
    explanation_it: `La rotazione aumenta di **${delta}°** ad ogni passo: ${rotList} → **${allRots[3]}°**. Il colore e la dimensione restano costanti.`,
    explanation_en: `The rotation increases by **${delta}°** each step: ${rotList} → **${allRots[3]}°**. Color and size remain constant.`,
    motivation_it: `Calcola: ${start}° + ${delta}° × 3 = ${allRots[3]}°. Osserva l'orientamento della forma per verificare la rotazione.`,
    motivation_en: `Calculate: ${start}° + ${delta}° × 3 = ${allRots[3]}°. Observe the orientation of the shape to verify the rotation.`,
    wrong_explanations_it,
    wrong_explanations_en,
    category: 'Rotation Progression',
    difficulty: delta === 90 ? 'easy' : 'medium',
  };
}

// ── Pattern 4: Shape Sequence ─────────────────────────────────────────────────
function genShapeSequence(id) {
  const baseColor = pick(COLORS);
  const baseSize = pick(SIZES);
  const startIdx = pickIdx(SHAPES.length);
  const step = pick([1, 2, 3]);

  const allShapes = Array.from({ length: 4 }, (_, i) => SHAPES[(startIdx + i * step) % SHAPES.length]);
  const sequence = allShapes.slice(0, 3).map(t => shape(t, baseColor, baseSize));
  const correctShape = shape(allShapes[3], baseColor, baseSize);

  const distractors = [
    shape(pickDistinctShape(allShapes[3]), baseColor, baseSize),
    shape(allShapes[3], pickDistinctColor(baseColor), baseSize),
    shape(allShapes[3], baseColor, pickDistinctSize(baseSize)),
  ];

  const { options_shapes, correct, wrong_explanations_it, wrong_explanations_en } = buildOptions(correctShape, distractors);
  const shapeList_it = allShapes.slice(0, 3).map(shapeIt).join(' → ');
  const shapeList_en = allShapes.slice(0, 3).map(shapeEn).join(' → ');

  return {
    id,
    question_it: `Le forme cambiano secondo una sequenza (${shapeList_it} → ?). Quale figura viene dopo?`,
    question_en: `The shapes change according to a sequence (${shapeList_en} → ?). Which figure comes next?`,
    sequence,
    options_shapes,
    options: OPTIONS_LABELS,
    correct,
    explanation_it: `La sequenza di forme è: ${shapeList_it} → **${shapeIt(allShapes[3])}**. Il colore e la dimensione rimangono costanti.`,
    explanation_en: `The shape sequence is: ${shapeList_en} → **${shapeEn(allShapes[3])}**. Color and size remain constant.`,
    motivation_it: `Ogni forma avanza di ${step} posizione/i nella lista: cerchio, quadrato, triangolo, rombo, esagono, stella, croce, freccia.`,
    motivation_en: `Each shape advances by ${step} position(s) in the list: circle, square, triangle, diamond, hexagon, star, cross, arrow.`,
    wrong_explanations_it,
    wrong_explanations_en,
    category: 'Shape Sequence',
    difficulty: step === 1 ? 'easy' : 'medium',
  };
}

// ── Pattern 5: Alternation AB ─────────────────────────────────────────────────
function genAlternationAB(id) {
  const attr = pick(['color', 'shape', 'size']);
  const baseShape = pick(SHAPES);
  const baseColor = pick(COLORS);
  const baseSize = pick(SIZES);

  let a, b;
  let seqValues;
  let rule_it, rule_en, attr_it, attr_en;

  if (attr === 'color') {
    a = baseColor;
    b = pickDistinctColor(baseColor);
    seqValues = [a, b, a, b]; // ABAB, correct is B (index 3)
    attr_it = 'colore'; attr_en = 'color';
    rule_it = `il colore alterna tra **${colorIt(a)}** e **${colorIt(b)}**`;
    rule_en = `the color alternates between **${colorEn(a)}** and **${colorEn(b)}**`;
    const sequence = seqValues.slice(0, 3).map(c => shape(baseShape, c, baseSize));
    const correctShape = shape(baseShape, seqValues[3], baseSize);
    const distractors = [
      shape(baseShape, a, baseSize), // wrong: same as step 1 instead of step 4
      shape(baseShape, b, pickDistinctSize(baseSize)),
      shape(pickDistinctShape(baseShape), b, baseSize),
    ];
    const { options_shapes, correct, wrong_explanations_it, wrong_explanations_en } = buildOptions(correctShape, distractors);
    return {
      id,
      question_it: `La sequenza segue un'alternanza ABAB di ${attr_it}. Quale figura viene al posto del "?"?`,
      question_en: `The sequence follows an ABAB alternation of ${attr_en}. Which figure goes in place of "?"?`,
      sequence,
      options_shapes,
      options: OPTIONS_LABELS,
      correct,
      explanation_it: `Il pattern è ABAB: ${rule_it}. Il quarto elemento è B = **${colorIt(seqValues[3])}**.`,
      explanation_en: `The pattern is ABAB: ${rule_en}. The fourth element is B = **${colorEn(seqValues[3])}**.`,
      motivation_it: 'Nell\'alternanza ABAB il pattern si ripete ogni 2 passi. Il 4° elemento è uguale al 2°.',
      motivation_en: 'In ABAB alternation the pattern repeats every 2 steps. The 4th element equals the 2nd.',
      wrong_explanations_it,
      wrong_explanations_en,
      category: 'Alternation',
      difficulty: 'easy',
    };
  }

  if (attr === 'shape') {
    a = baseShape;
    b = pickDistinctShape(baseShape);
    seqValues = [a, b, a, b];
    const sequence = seqValues.slice(0, 3).map(t => shape(t, baseColor, baseSize));
    const correctShape = shape(seqValues[3], baseColor, baseSize);
    const distractors = [
      shape(a, baseColor, baseSize),
      shape(b, pickDistinctColor(baseColor), baseSize),
      shape(b, baseColor, pickDistinctSize(baseSize)),
    ];
    const { options_shapes, correct, wrong_explanations_it, wrong_explanations_en } = buildOptions(correctShape, distractors);
    return {
      id,
      question_it: `La forma alterna tra ${shapeIt(a)} (A) e ${shapeIt(b)} (B) secondo il pattern ABAB. Quale figura viene dopo?`,
      question_en: `The shape alternates between ${shapeEn(a)} (A) and ${shapeEn(b)} (B) following the ABAB pattern. Which figure comes next?`,
      sequence,
      options_shapes,
      options: OPTIONS_LABELS,
      correct,
      explanation_it: `Il pattern ABAB: ${shapeIt(a)} → ${shapeIt(b)} → ${shapeIt(a)} → **${shapeIt(b)}**. Il colore e la dimensione sono costanti.`,
      explanation_en: `The ABAB pattern: ${shapeEn(a)} → ${shapeEn(b)} → ${shapeEn(a)} → **${shapeEn(b)}**. Color and size are constant.`,
      motivation_it: 'Alternanza semplice: il 4° elemento è identico al 2° (entrambi sono B nel pattern ABAB).',
      motivation_en: 'Simple alternation: the 4th element is identical to the 2nd (both are B in the ABAB pattern).',
      wrong_explanations_it,
      wrong_explanations_en,
      category: 'Alternation',
      difficulty: 'easy',
    };
  }

  // size alternation
  a = baseSize;
  b = pickDistinctSize(baseSize);
  seqValues = [a, b, a, b];
  const sequence = seqValues.slice(0, 3).map(s => shape(baseShape, baseColor, s));
  const correctShape = shape(baseShape, baseColor, seqValues[3]);
  const distractors = [
    shape(baseShape, baseColor, a),
    shape(baseShape, pickDistinctColor(baseColor), b),
    shape(pickDistinctShape(baseShape), baseColor, b),
  ];
  const { options_shapes, correct, wrong_explanations_it, wrong_explanations_en } = buildOptions(correctShape, distractors);
  return {
    id,
    question_it: `La dimensione alterna tra ${sizeIt(a)} (A) e ${sizeIt(b)} (B) nel pattern ABAB. Quale figura completa la serie?`,
    question_en: `The size alternates between ${sizeEn(a)} (A) and ${sizeEn(b)} (B) in the ABAB pattern. Which figure completes the series?`,
    sequence,
    options_shapes,
    options: OPTIONS_LABELS,
    correct,
    explanation_it: `Pattern ABAB: ${sizeIt(a)} → ${sizeIt(b)} → ${sizeIt(a)} → **${sizeIt(b)}**. Forma e colore restano costanti.`,
    explanation_en: `ABAB pattern: ${sizeEn(a)} → ${sizeEn(b)} → ${sizeEn(a)} → **${sizeEn(b)}**. Shape and color remain constant.`,
    motivation_it: 'Nel pattern ABAB la sequenza si ripete ogni 2 elementi. Posizioni pari = B, posizioni dispari = A (contando da 1).',
    motivation_en: 'In the ABAB pattern the sequence repeats every 2 elements. Even positions = B, odd positions = A (counting from 1).',
    wrong_explanations_it,
    wrong_explanations_en,
    category: 'Alternation',
    difficulty: 'easy',
  };
}

// ── Pattern 6: ABC Cycle ──────────────────────────────────────────────────────
function genABCCycle(id) {
  const attr = pick(['color', 'shape']);
  const baseShape = pick(SHAPES);
  const baseColor = pick(COLORS);
  const baseSize = pick(SIZES);

  if (attr === 'color') {
    const startIdx = pickIdx(COLORS.length);
    const [c0, c1, c2, c3] = [0, 1, 2, 0].map(i => COLORS[(startIdx + i) % COLORS.length]);
    const sequence = [c0, c1, c2].map(c => shape(baseShape, c, baseSize));
    const correctShape = shape(baseShape, c3, baseSize);
    const distractors = [
      shape(baseShape, COLORS[(startIdx + 1) % COLORS.length], baseSize), // B instead of A
      shape(baseShape, COLORS[(startIdx + 3) % COLORS.length], baseSize), // D
      shape(pickDistinctShape(baseShape), c3, baseSize),
    ];
    const { options_shapes, correct, wrong_explanations_it, wrong_explanations_en } = buildOptions(correctShape, distractors);
    return {
      id,
      question_it: `Il colore segue il ciclo ABC (${colorIt(c0)} → ${colorIt(c1)} → ${colorIt(c2)} → ?). Quale figura viene dopo?`,
      question_en: `The color follows the ABC cycle (${colorEn(c0)} → ${colorEn(c1)} → ${colorEn(c2)} → ?). Which figure comes next?`,
      sequence,
      options_shapes,
      options: OPTIONS_LABELS,
      correct,
      explanation_it: `Il ciclo ABCA: dopo 3 colori distinti il ciclo riparte da A (**${colorIt(c3)}**). Forma e dimensione costanti.`,
      explanation_en: `The ABCA cycle: after 3 distinct colors the cycle restarts from A (**${colorEn(c3)}**). Shape and size constant.`,
      motivation_it: 'Nel ciclo ABC il 4° elemento è uguale al 1°: il pattern si ripete ogni 3 passi.',
      motivation_en: 'In the ABC cycle the 4th element equals the 1st: the pattern repeats every 3 steps.',
      wrong_explanations_it,
      wrong_explanations_en,
      category: 'Alternation',
      difficulty: 'medium',
    };
  }

  // shape ABC cycle
  const startIdx = pickIdx(SHAPES.length);
  const [s0, s1, s2, s3] = [0, 1, 2, 0].map(i => SHAPES[(startIdx + i) % SHAPES.length]);
  const sequence = [s0, s1, s2].map(t => shape(t, baseColor, baseSize));
  const correctShape = shape(s3, baseColor, baseSize);
  const distractors = [
    shape(SHAPES[(startIdx + 1) % SHAPES.length], baseColor, baseSize),
    shape(SHAPES[(startIdx + 3) % SHAPES.length], baseColor, baseSize),
    shape(s3, pickDistinctColor(baseColor), baseSize),
  ];
  const { options_shapes, correct, wrong_explanations_it, wrong_explanations_en } = buildOptions(correctShape, distractors);
  return {
    id,
    question_it: `Le forme seguono il ciclo ABC (${shapeIt(s0)} → ${shapeIt(s1)} → ${shapeIt(s2)} → ?). Quale viene dopo?`,
    question_en: `The shapes follow the ABC cycle (${shapeEn(s0)} → ${shapeEn(s1)} → ${shapeEn(s2)} → ?). Which comes next?`,
    sequence,
    options_shapes,
    options: OPTIONS_LABELS,
    correct,
    explanation_it: `Ciclo ABCA: ${shapeIt(s0)} → ${shapeIt(s1)} → ${shapeIt(s2)} → **${shapeIt(s3)}**. Il 4° è uguale al 1°.`,
    explanation_en: `ABCA cycle: ${shapeEn(s0)} → ${shapeEn(s1)} → ${shapeEn(s2)} → **${shapeEn(s3)}**. The 4th equals the 1st.`,
    motivation_it: 'Riconoscere il ciclo a 3 elementi è fondamentale: ogni 3 passi il pattern ricomincia dal primo elemento.',
    motivation_en: 'Recognizing the 3-element cycle is key: every 3 steps the pattern restarts from the first element.',
    wrong_explanations_it,
    wrong_explanations_en,
    category: 'Alternation',
    difficulty: 'medium',
  };
}

// ── Pattern 7: Multi-attribute (2 attributes vary) ────────────────────────────
function genMultiAttribute(id) {
  const attrs = shuffle(['color', 'shape', 'size', 'rotation']).slice(0, 2);
  const baseShape = pick(SHAPES);
  const baseColor = pick(COLORS);
  const baseSize = pick(SIZES);
  const baseRot = 0;

  // color step
  const colorStartIdx = pickIdx(COLORS.length);
  const colorStep = 1;
  // shape step
  const shapeStartIdx = pickIdx(SHAPES.length);
  const shapeStep = 1;
  // size step
  const sizeStartIdx = pickIdx(SIZES.length);
  // rotation step
  const rotStart = pick([0, 45, 90]);
  const rotDelta = pick([45, 90]);

  function getAttrValue(attr, i) {
    switch (attr) {
      case 'color': return COLORS[(colorStartIdx + i * colorStep) % COLORS.length];
      case 'shape': return SHAPES[(shapeStartIdx + i * shapeStep) % SHAPES.length];
      case 'size': return SIZES[(sizeStartIdx + i) % SIZES.length];
      case 'rotation': return ((rotStart + i * rotDelta) % 360 + 360) % 360;
    }
  }

  const seqLen = 3;
  const allShapes = Array.from({ length: seqLen + 1 }, (_, i) => {
    let t = baseShape, c = baseColor, s = baseSize, r = baseRot;
    for (const attr of attrs) {
      const v = getAttrValue(attr, i);
      if (attr === 'color') c = v;
      else if (attr === 'shape') t = v;
      else if (attr === 'size') s = v;
      else if (attr === 'rotation') r = v;
    }
    return shape(t, c, s, r);
  });

  const sequence = allShapes.slice(0, seqLen);
  const correctShape = allShapes[seqLen];

  const distractors = [];
  for (let d = 0; d < 3; d++) {
    const dist = { ...correctShape };
    const violateAttr = attrs[d % attrs.length];
    switch (violateAttr) {
      case 'color': dist.fill = pickDistinctColor(correctShape.fill); break;
      case 'shape': dist.type = pickDistinctShape(correctShape.type); break;
      case 'size': dist.size = pickDistinctSize(correctShape.size); break;
      case 'rotation': dist.rotation = pickDistinctRotation(correctShape.rotation); break;
    }
    distractors.push(dist);
  }

  const { options_shapes, correct, wrong_explanations_it, wrong_explanations_en } = buildOptions(correctShape, distractors);

  const attrNames_it = attrs.map(a => ({ color: 'colore', shape: 'forma', size: 'dimensione', rotation: 'rotazione' }[a]));
  const attrNames_en = attrs;

  return {
    id,
    question_it: `Due attributi cambiano simultaneamente (${attrNames_it.join(' e ')}). Quale figura viene dopo?`,
    question_en: `Two attributes change simultaneously (${attrNames_en.join(' and ')}). Which figure comes next?`,
    sequence,
    options_shapes,
    options: OPTIONS_LABELS,
    correct,
    explanation_it: `Cambiano **${attrNames_it.join('** e **')}** seguendo regole indipendenti. Tutti gli altri attributi restano costanti.`,
    explanation_en: `**${attrNames_en.join('** and **')}** change following independent rules. All other attributes remain constant.`,
    motivation_it: 'Con più attributi variabili, analizza ogni attributo separatamente prima di combinare le regole.',
    motivation_en: 'With multiple varying attributes, analyze each attribute separately before combining the rules.',
    wrong_explanations_it,
    wrong_explanations_en,
    category: 'Multi-Attribute',
    difficulty: 'hard',
  };
}

// ── Pattern 8: Matrix 3×3 ─────────────────────────────────────────────────────
function genMatrix(id, difficulty) {
  const allAttrs = shuffle(['color', 'shape', 'size', 'rotation']);
  const rowAttr = allAttrs[0];
  const colAttr = difficulty === 'easy' ? null : allAttrs[1];

  const baseShape = pick(SHAPES);
  const baseColor = pick(COLORS);
  const baseSize = pick(SIZES);
  const baseRot = pick([0, 45, 90]);

  const rowStartIdx = pickIdx(COLORS.length < SHAPES.length ? COLORS.length : SHAPES.length);
  const rowStep = 1;
  const colStartIdx = pickIdx(COLORS.length < SHAPES.length ? COLORS.length : SHAPES.length);
  const colStep = 1;

  function getRowVal(attr, col) {
    switch (attr) {
      case 'color': return COLORS[(rowStartIdx + col * rowStep) % COLORS.length];
      case 'shape': return SHAPES[(rowStartIdx + col * rowStep) % SHAPES.length];
      case 'size': return SIZES[(rowStartIdx + col) % SIZES.length];
      case 'rotation': return ((rowStartIdx * 45 + col * 90) % 360);
    }
  }
  function getColVal(attr, row) {
    switch (attr) {
      case 'color': return COLORS[(colStartIdx + row * colStep) % COLORS.length];
      case 'shape': return SHAPES[(colStartIdx + row * colStep) % SHAPES.length];
      case 'size': return SIZES[(colStartIdx + row) % SIZES.length];
      case 'rotation': return ((colStartIdx * 45 + row * 90) % 360);
    }
  }

  const matrix = [];
  for (let row = 0; row < 3; row++) {
    const matRow = [];
    for (let col = 0; col < 3; col++) {
      if (row === 2 && col === 2) { matRow.push(null); continue; }
      let t = baseShape, c = baseColor, s = baseSize, r = baseRot;
      const rv = getRowVal(rowAttr, col);
      if (rowAttr === 'color') c = rv;
      else if (rowAttr === 'shape') t = rv;
      else if (rowAttr === 'size') s = rv;
      else if (rowAttr === 'rotation') r = rv;
      if (colAttr) {
        const cv = getColVal(colAttr, row);
        if (colAttr === 'color') c = cv;
        else if (colAttr === 'shape') t = cv;
        else if (colAttr === 'size') s = cv;
        else if (colAttr === 'rotation') r = cv;
      }
      matRow.push(shape(t, c, s, r));
    }
    matrix.push(matRow);
  }

  // Compute correct answer
  let ct = baseShape, cc = baseColor, cs = baseSize, cr = baseRot;
  const rv2 = getRowVal(rowAttr, 2);
  if (rowAttr === 'color') cc = rv2;
  else if (rowAttr === 'shape') ct = rv2;
  else if (rowAttr === 'size') cs = rv2;
  else if (rowAttr === 'rotation') cr = rv2;
  if (colAttr) {
    const cv2 = getColVal(colAttr, 2);
    if (colAttr === 'color') cc = cv2;
    else if (colAttr === 'shape') ct = cv2;
    else if (colAttr === 'size') cs = cv2;
    else if (colAttr === 'rotation') cr = cv2;
  }
  const correctShape = shape(ct, cc, cs, cr);

  const violPool = shuffle([rowAttr, colAttr || pick(['color', 'shape', 'size']), 'rotation', 'color']
    .filter((v, i, a) => a.indexOf(v) === i));

  const distractors = [];
  for (let d = 0; d < 3; d++) {
    const dist = { ...correctShape };
    switch (violPool[d % violPool.length]) {
      case 'color': dist.fill = pickDistinctColor(correctShape.fill); break;
      case 'shape': dist.type = pickDistinctShape(correctShape.type); break;
      case 'size': dist.size = pickDistinctSize(correctShape.size); break;
      case 'rotation': dist.rotation = pickDistinctRotation(correctShape.rotation); break;
    }
    distractors.push(dist);
  }

  const { options_shapes, correct, wrong_explanations_it, wrong_explanations_en } = buildOptions(correctShape, distractors);

  const AN_IT = { color: 'colore', shape: 'forma', size: 'dimensione', rotation: 'rotazione' };
  const rules_it = [`ogni riga segue un pattern di ${AN_IT[rowAttr]}`];
  const rules_en = [`each row follows a ${rowAttr} pattern`];
  if (colAttr) {
    rules_it.push(`ogni colonna segue un pattern di ${AN_IT[colAttr]}`);
    rules_en.push(`each column follows a ${colAttr} pattern`);
  }

  return {
    id,
    question_it: `Nella matrice 3×3, ${rules_it.join(' e ')}. Quale figura completa la cella mancante?`,
    question_en: `In the 3×3 matrix, ${rules_en.join(' and ')}. Which figure completes the missing cell?`,
    matrix,
    options_shapes,
    options: OPTIONS_LABELS,
    correct,
    explanation_it: `La regola: ${rules_it.join('; ')}. La cella (3,3) deve soddisfare entrambe le regole.`,
    explanation_en: `The rule: ${rules_en.join('; ')}. Cell (3,3) must satisfy both rules.`,
    motivation_it: 'Analizza prima le righe, poi le colonne. La cella mancante deve essere compatibile con entrambe le regole identificate.',
    motivation_en: 'Analyze rows first, then columns. The missing cell must be compatible with both identified rules.',
    wrong_explanations_it,
    wrong_explanations_en,
    category: 'Matrix Completion',
    difficulty,
  };
}

// ── Generate 120 Questions ────────────────────────────────────────────────────
function generateAll() {
  const questions = [];
  let n = 1;
  function nextId() { return `ar-${String(n++).padStart(3, '0')}`; }

  // Color Cycle: 15 questions (3 easy with seqLen=3, 12 with seqLen=4)
  for (let i = 0; i < 8; i++) questions.push(genColorCycle(nextId(), 3));
  for (let i = 0; i < 7; i++) questions.push(genColorCycle(nextId(), 4));

  // Size Progression: 10 questions
  for (let i = 0; i < 5; i++) questions.push(genSizeProgression(nextId(), true));
  for (let i = 0; i < 5; i++) questions.push(genSizeProgression(nextId(), false));

  // Rotation Progression: 15 questions
  for (let i = 0; i < 15; i++) questions.push(genRotationProgression(nextId()));

  // Shape Sequence: 15 questions
  for (let i = 0; i < 15; i++) questions.push(genShapeSequence(nextId()));

  // Alternation AB: 15 questions
  for (let i = 0; i < 15; i++) questions.push(genAlternationAB(nextId()));

  // ABC Cycle: 10 questions
  for (let i = 0; i < 10; i++) questions.push(genABCCycle(nextId()));

  // Multi-Attribute: 20 questions
  for (let i = 0; i < 20; i++) questions.push(genMultiAttribute(nextId()));

  // Matrix 3×3: 20 questions
  for (let i = 0; i < 7; i++) questions.push(genMatrix(nextId(), 'easy'));
  for (let i = 0; i < 8; i++) questions.push(genMatrix(nextId(), 'medium'));
  for (let i = 0; i < 5; i++) questions.push(genMatrix(nextId(), 'hard'));

  return questions;
}

// ── Validation ────────────────────────────────────────────────────────────────
function validate(questions) {
  let errors = 0;
  const ids = new Set();

  for (const q of questions) {
    if (!q.id) { console.error('Missing ID'); errors++; continue; }
    if (ids.has(q.id)) { console.error(`Duplicate ID: ${q.id}`); errors++; }
    ids.add(q.id);

    if (!q.question_it || !q.question_en) { console.error(`Missing question text: ${q.id}`); errors++; }
    if (!q.sequence && !q.matrix) { console.error(`No sequence or matrix: ${q.id}`); errors++; }
    if (!q.options_shapes || q.options_shapes.length !== 4) { console.error(`Bad options_shapes: ${q.id}`); errors++; }
    if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) { console.error(`Bad correct: ${q.id}`); errors++; }
    if (q.wrong_explanations_it?.[q.correct] !== '') { console.error(`Correct explanation not empty: ${q.id}`); errors++; }
    if (q.matrix) {
      if (q.matrix.length !== 3) { console.error(`Matrix not 3 rows: ${q.id}`); errors++; }
      if (q.matrix[2][2] !== null) { console.error(`Matrix [2][2] not null: ${q.id}`); errors++; }
    }
    for (const opt of q.options_shapes) {
      if (!opt || !opt.type || !opt.fill || !opt.size || opt.rotation === undefined) {
        console.error(`Invalid option shape: ${q.id}`); errors++;
      }
    }
  }
  return errors;
}

// ── Run ───────────────────────────────────────────────────────────────────────
const questions = generateAll();
const errors = validate(questions);

if (errors > 0) {
  console.error(`\n❌ ${errors} validation errors. Aborting.`);
  process.exit(1);
}

const outPath = join(DATA_DIR, 'abstract-reasoning.json');
writeFileSync(outPath, JSON.stringify(questions, null, 2) + '\n', 'utf-8');

const cats = questions.reduce((a, q) => { a[q.category] = (a[q.category] || 0) + 1; return a; }, {});
const diffs = questions.reduce((a, q) => { a[q.difficulty] = (a[q.difficulty] || 0) + 1; return a; }, {});

console.log(`✅ Generated ${questions.length} abstract reasoning questions`);
console.log('📊 Categories:', JSON.stringify(cats, null, 2));
console.log('📊 Difficulties:', JSON.stringify(diffs, null, 2));
