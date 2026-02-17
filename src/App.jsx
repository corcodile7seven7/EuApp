import { HashRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import AppShell from './components/layout/AppShell';
import Dashboard from './components/dashboard/Dashboard';
import QuizSetup from './components/quiz/QuizSetup';
import QuizEngine from './components/quiz/QuizEngine';
import StudyHome from './components/study/StudyHome';
import Statistics from './components/stats/Statistics';
import Settings from './components/settings/Settings';
import InfoPage from './components/info/InfoPage';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/quiz" element={<QuizSetup />} />
              <Route path="/quiz/:section" element={<QuizEngine />} />
              <Route path="/study" element={<StudyHome />} />
              <Route path="/stats" element={<Statistics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/info" element={<InfoPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
