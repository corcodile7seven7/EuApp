import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { generateQuestionsWithAI } from '../../utils/deepseek';
import {
  getGeneratedCount,
  saveGeneratedQuestions,
  clearGeneratedQuestions,
} from '../../utils/questionStorage';

const SECTIONS = [
  { id: 'eu-knowledge', categories: ['EU Institutions', 'EU Law & Treaties', 'EU History', 'EU Policies', 'EU Budget & Finance', 'EU External Relations', 'EU Agencies & Bodies', 'EU Values & Principles', 'EU Decision Making'] },
  { id: 'digital-skills', categories: ['Information & Data Literacy', 'Communication & Collaboration', 'Digital Content Creation', 'Safety & Security', 'Problem Solving'] },
  { id: 'eu-institutions', categories: ['Seats & Organization', 'Decision Making', 'Competences', 'Reform & History'] },
  { id: 'temporal', categories: ['EU Treaties', 'Timeline', 'Accession History', 'Key Dates'] },
  { id: 'acronyms', categories: ['EU Bodies', 'Programs', 'Policies', 'Legal'] },
  { id: 'situational', categories: ["Citizens' Rights", 'Cross-Border Scenarios', 'Consumer Protection'] },
  { id: 'it-advanced', categories: ['Networking', 'Cloud', 'AI & Machine Learning', 'Software Dev', 'Digital Governance'] },
  { id: 'verbal-reasoning', categories: ['Reading Comprehension', 'Logical Deduction', 'Inference'] },
  { id: 'numerical-reasoning', categories: ['Percentages', 'Budget Analysis', 'Growth Rates', 'Statistics'] },
  { id: 'abstract-reasoning', categories: ['Visual Patterns', 'Sequences', 'Matrices'] },
];

const COUNTS = [5, 10, 20];
const DIFFICULTIES = ['easy', 'medium', 'hard', 'mixed'];

function getErrorMessage(error, t) {
  if (error === 'no_api_key') return t('generator.no_api_key');
  if (error === 'rate_minute') return t('generator.rate_minute');
  if (error === 'rate_daily') return t('generator.rate_daily');
  return `${t('generator.error')}: ${error}`;
}

export default function QuestionGenerator() {
  const navigate = useNavigate();
  const { t, quizLang } = useLanguage();

  const [selectedSection, setSelectedSection] = useState(SECTIONS[0].id);
  const [selectedCategory, setSelectedCategory] = useState(SECTIONS[0].categories[0]);
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');

  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [savedCount, setSavedCount] = useState(() => getGeneratedCount(SECTIONS[0].id));
  const [clearConfirm, setClearConfirm] = useState(false);

  const currentSection = SECTIONS.find(s => s.id === selectedSection) || SECTIONS[0];

  const handleSectionChange = useCallback((sectionId) => {
    setSelectedSection(sectionId);
    const sec = SECTIONS.find(s => s.id === sectionId);
    setSelectedCategory(sec?.categories[0] || '');
    setSavedCount(getGeneratedCount(sectionId));
    setPreview([]);
    setError(null);
    setSaveSuccess(false);
    setClearConfirm(false);
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    setSaveSuccess(false);
    setPreview([]);

    const result = await generateQuestionsWithAI(selectedSection, selectedCategory, count, difficulty);

    setGenerating(false);

    if (!result.success) {
      setError(getErrorMessage(result.error, t));
    } else {
      setPreview(result.questions);
    }
  }, [selectedSection, selectedCategory, count, difficulty, t]);

  const handleDeleteFromPreview = useCallback((id) => {
    setPreview(prev => prev.filter(q => q.id !== id));
  }, []);

  const handleSaveAll = useCallback(() => {
    if (preview.length === 0) return;
    const total = saveGeneratedQuestions(selectedSection, preview);
    setSavedCount(total);
    setSaveSuccess(true);
    setPreview([]);
  }, [preview, selectedSection]);

  const handleClearAll = useCallback(() => {
    clearGeneratedQuestions(selectedSection);
    setSavedCount(0);
    setClearConfirm(false);
  }, [selectedSection]);

  const lang = quizLang || 'it';
  const qText = (q) => lang === 'en' ? q.question_en : q.question_it;
  const optText = (o) => lang === 'en' ? o.text_en : o.text_it;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/settings')}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
        >
          ← {t('generator.back')}
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold">{t('generator.title')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('generator.subtitle')}</p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-200 dark:border-dark-border space-y-4">
        {/* Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('generator.section')}
          </label>
          <select
            value={selectedSection}
            onChange={(e) => handleSectionChange(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-eu-blue/50"
          >
            {SECTIONS.map(s => (
              <option key={s.id} value={s.id}>{t(`sections.${s.id}`) || s.id}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('generator.category')}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-eu-blue/50"
          >
            {currentSection.categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('generator.count')}
          </label>
          <div className="flex gap-2">
            {COUNTS.map(n => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${count === n ? 'bg-eu-blue text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('generator.difficulty')}
          </label>
          <div className="flex gap-2 flex-wrap">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${difficulty === d ? 'bg-eu-blue text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                {t(`generator.difficulty_${d}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3 rounded-lg text-sm font-semibold bg-eu-blue text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('generator.generating')}
            </>
          ) : t('generator.generate')}
        </button>

        {/* Error */}
        {error && (
          <p className="text-sm text-fail-red bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Save success */}
        {saveSuccess && (
          <p className="text-sm text-pass-green bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
            {t('generator.saved')}
          </p>
        )}
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-200 dark:border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{t('generator.preview')} ({preview.length})</h3>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="text-xs text-eu-blue hover:underline disabled:opacity-50"
            >
              ↻ Rigenera
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {preview.map((q, qi) => (
              <div key={q.id} className="border border-gray-200 dark:border-dark-border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {qi + 1}. {qText(q)}
                  </p>
                  <button
                    onClick={() => handleDeleteFromPreview(q.id)}
                    className="text-xs text-fail-red hover:underline shrink-0"
                  >
                    {t('generator.delete')}
                  </button>
                </div>
                <div className="space-y-1">
                  {q.options.map((o, oi) => (
                    <div
                      key={oi}
                      className={`text-xs px-2 py-1 rounded ${oi === q.correct ? 'bg-green-100 dark:bg-green-900/30 text-pass-green font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      {String.fromCharCode(65 + oi)}) {optText(o)}
                      {oi === q.correct && ' ✓'}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 text-xs text-gray-400">
                  <span className="capitalize">{q.difficulty}</span>
                  <span>•</span>
                  <span>{q.category}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveAll}
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-pass-green text-white hover:bg-green-600 transition-colors"
          >
            {t('generator.save_all')} ({preview.length})
          </button>
        </div>
      )}

      {/* Summary per section */}
      <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-200 dark:border-dark-border space-y-3">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">{t('generator.saved_count')}</h3>

        {savedCount > 0 ? (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t(`sections.${selectedSection}`) || selectedSection}: <span className="font-bold text-eu-blue">{savedCount}</span>
            </p>

            {!clearConfirm ? (
              <button
                onClick={() => setClearConfirm(true)}
                className="w-full py-2 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/20 text-fail-red hover:bg-red-100 transition-colors"
              >
                {t('generator.clear_all')}
              </button>
            ) : (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-fail-red mb-2">{t('generator.clear_confirm')}</p>
                <div className="flex gap-2">
                  <button onClick={handleClearAll} className="flex-1 py-2 bg-fail-red text-white rounded-lg text-sm font-medium">
                    {t('common.confirm')}
                  </button>
                  <button onClick={() => setClearConfirm(false)} className="flex-1 py-2 bg-gray-200 dark:bg-dark-border rounded-lg text-sm font-medium">
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400">{t('generator.no_saved')}</p>
        )}
      </div>
    </div>
  );
}
