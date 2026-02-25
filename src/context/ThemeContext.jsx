/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => storage.get('dark') === true);

  useEffect(() => {
    storage.set('dark', dark);
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggleDark = () => setDark(d => !d);

  return (
    <ThemeContext.Provider value={{ dark, setDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
