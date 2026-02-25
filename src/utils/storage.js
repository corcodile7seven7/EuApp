let ACTIVE_PREFIX = 'epso-';
const DATA_VERSION = 1;

export const storage = {
  setProfile(profileId) {
    ACTIVE_PREFIX = profileId ? `epso-${profileId}-` : 'epso-';
  },

  get(key) {
    try {
      const raw = localStorage.getItem(ACTIVE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  set(key, value) {
    try {
      localStorage.setItem(ACTIVE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  },

  remove(key) {
    localStorage.removeItem(ACTIVE_PREFIX + key);
  },

  clear() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(ACTIVE_PREFIX)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  },

  // Quiz history
  getHistory() {
    return this.get('history') || [];
  },

  addResult(result) {
    const history = this.getHistory();
    history.push({
      ...result,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: new Date().toISOString(),
      version: DATA_VERSION,
    });
    this.set('history', history);
    this.updateQuestionStats(result);
  },

  // Per-question stats for adaptive learning
  getQuestionStats() {
    return this.get('question-stats') || {};
  },

  updateQuestionStats(result) {
    const stats = this.getQuestionStats();
    if (!result.answers) return;
    result.answers.forEach(a => {
      if (!a.questionId) return;
      if (!stats[a.questionId]) {
        stats[a.questionId] = { attempts: 0, correct: 0, lastSeen: null, streak: 0 };
      }
      const s = stats[a.questionId];
      s.attempts++;
      if (a.correct) {
        s.correct++;
        s.streak++;
      } else {
        s.streak = 0;
      }
      s.lastSeen = new Date().toISOString();
    });
    this.set('question-stats', stats);
  },

  // Quiz draft (auto-save progress)
  saveDraft(sectionId, data) {
    this.set(`quiz-draft-${sectionId}`, data);
  },

  getDraft(sectionId) {
    return this.get(`quiz-draft-${sectionId}`);
  },

  clearDraft(sectionId) {
    this.remove(`quiz-draft-${sectionId}`);
  },

  // Question ratings (persistent across sessions)
  getQuestionRatings() {
    return this.get('question-ratings') || {};
  },

  rateQuestion(questionId, type) {
    const ratings = this.getQuestionRatings();
    if (ratings[questionId] === type) {
      delete ratings[questionId];
    } else {
      ratings[questionId] = type;
    }
    this.set('question-ratings', ratings);
    return ratings;
  },

  // Export all data
  exportAll() {
    const data = { version: DATA_VERSION, exportDate: new Date().toISOString() };
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(ACTIVE_PREFIX)) {
        try { data[k.slice(ACTIVE_PREFIX.length)] = JSON.parse(localStorage.getItem(k)); }
        catch { data[k.slice(ACTIVE_PREFIX.length)] = localStorage.getItem(k); }
      }
    }
    return data;
  },

  // Import data with validation
  importAll(data) {
    if (!data || typeof data !== 'object' || !data.version) {
      throw new Error('Invalid data format');
    }
    // Clear existing data first
    this.clear();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'version' || key === 'exportDate') return;
      this.set(key, value);
    });
  },
};
