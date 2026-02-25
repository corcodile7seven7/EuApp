const STORAGE_KEY = 'epso-generated-questions';

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

/** Returns all generated questions for a section (array). */
export function getGeneratedQuestions(section) {
  const all = loadAll();
  return all[section] || [];
}

/** Merges new questions into the stored list for a section. */
export function saveGeneratedQuestions(section, questions) {
  const all = loadAll();
  const existing = all[section] || [];
  // Avoid duplicates by id
  const existingIds = new Set(existing.map(q => q.id));
  const toAdd = questions.filter(q => !existingIds.has(q.id));
  all[section] = [...existing, ...toAdd];
  saveAll(all);
  return all[section].length;
}

/** Removes a single generated question by id from a section. */
export function deleteGeneratedQuestion(section, id) {
  const all = loadAll();
  if (!all[section]) return;
  all[section] = all[section].filter(q => q.id !== id);
  saveAll(all);
}

/** Clears all generated questions for a section. */
export function clearGeneratedQuestions(section) {
  const all = loadAll();
  delete all[section];
  saveAll(all);
}

/** Returns all sections with their generated questions. */
export function getAllGeneratedQuestions() {
  return loadAll();
}

/** Returns count of generated questions for a section. */
export function getGeneratedCount(section) {
  return getGeneratedQuestions(section).length;
}

/** Returns total count across all sections. */
export function getTotalGeneratedCount() {
  const all = loadAll();
  return Object.values(all).reduce((sum, arr) => sum + arr.length, 0);
}
