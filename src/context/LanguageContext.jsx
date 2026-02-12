/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import it from '../i18n/it.json';
import en from '../i18n/en.json';

const translations = { it, en };
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('epso-lang') || 'it');
  const [quizLang, setQuizLang] = useState(() => localStorage.getItem('epso-quiz-lang') || 'it');

  useEffect(() => { localStorage.setItem('epso-lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('epso-quiz-lang', quizLang); }, [quizLang]);

  const t = (key) => {
    const keys = key.split('.');
    let val = translations[lang];
    for (const k of keys) {
      val = val?.[k];
    }
    return val || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, quizLang, setQuizLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
