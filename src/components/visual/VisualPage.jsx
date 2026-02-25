import { useState } from 'react';
import TreatyTimeline from './TreatyTimeline';
import EUFamilyTree from './EUFamilyTree';
import AccessionMap from './AccessionMap';
import InstitutionsGrid from './InstitutionsGrid';
import CurrentEventsTab from './CurrentEventsTab';
import Flashcards from './Flashcards';

const TABS = [
  { id: 'timeline', label: 'Timeline', icon: '🗓️' },
  { id: 'tree', label: 'Albero', icon: '🌳' },
  { id: 'map', label: 'Mappa', icon: '🌍' },
  { id: 'institutions', label: 'Istituzioni', icon: '🏛️' },
  { id: 'current', label: 'Attualità', icon: '⚡' },
  { id: 'flashcards', label: 'Flashcard', icon: '🃏' },
];

export default function VisualPage() {
  const [activeTab, setActiveTab] = useState('timeline');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Apprendimento Visivo
          </h1>
          {/* Tab strip */}
          <div className="flex gap-1 overflow-x-auto pb-0 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-eu-blue text-eu-blue dark:border-eu-yellow dark:text-eu-yellow'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="pt-2">
        {activeTab === 'timeline' && <TreatyTimeline />}
        {activeTab === 'tree' && <EUFamilyTree />}
        {activeTab === 'map' && <AccessionMap />}
        {activeTab === 'institutions' && <InstitutionsGrid />}
        {activeTab === 'current' && <CurrentEventsTab />}
        {activeTab === 'flashcards' && <Flashcards />}
      </div>
    </div>
  );
}
