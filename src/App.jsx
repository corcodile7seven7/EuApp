import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProfileProvider } from './context/ProfileContext';
import { storage } from './utils/storage';
import ProfileSelector from './components/profile/ProfileSelector';
import AppShell from './components/layout/AppShell';
import Dashboard from './components/dashboard/Dashboard';
import QuizSetup from './components/quiz/QuizSetup';
import QuizEngine from './components/quiz/QuizEngine';
import StudyHome from './components/study/StudyHome';
import Statistics from './components/stats/Statistics';
import Settings from './components/settings/Settings';
import QuestionGenerator from './components/settings/QuestionGenerator';
import InfoPage from './components/info/InfoPage';
import VisualPage from './components/visual/VisualPage';

export default function App() {
  const [activeProfile, setActiveProfile] = useState(null);

  const handleSelect = (profile) => {
    storage.setProfile(profile.id);
    setActiveProfile(profile);
  };

  const handleSwitch = () => {
    storage.setProfile(null);
    setActiveProfile(null);
  };

  if (!activeProfile) {
    return <ProfileSelector onSelect={handleSelect} />;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ProfileProvider value={{ activeProfile, switchProfile: handleSwitch }}>
          <HashRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/quiz" element={<QuizSetup />} />
                <Route path="/quiz/:section" element={<QuizEngine />} />
                <Route path="/study" element={<StudyHome />} />
                <Route path="/stats" element={<Statistics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/question-generator" element={<QuestionGenerator />} />
                <Route path="/info" element={<InfoPage />} />
                <Route path="/visual" element={<VisualPage />} />
              </Route>
            </Routes>
          </HashRouter>
        </ProfileProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
