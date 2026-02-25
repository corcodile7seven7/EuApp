import { useState } from 'react';
import { PROFILES } from '../../context/ProfileContext';

function getProfileStats(profileId) {
  try {
    const key = `epso-${profileId}-history`;
    const raw = localStorage.getItem(key);
    const history = raw ? JSON.parse(raw) : [];
    return { quizCount: history.length };
  } catch {
    return { quizCount: 0 };
  }
}

export default function ProfileSelector({ onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="min-h-screen bg-eu-blue flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-eu-yellow rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-eu-blue font-bold text-xl">EU</span>
        </div>
        <h1 className="text-white text-3xl font-bold tracking-tight">EPSO Prep</h1>
        <p className="text-white/70 mt-2 text-sm">Seleziona il tuo profilo per continuare</p>
      </div>

      {/* Profile cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
        {PROFILES.map(profile => {
          const stats = getProfileStats(profile.id);
          const isHovered = hovered === profile.id;

          return (
            <button
              key={profile.id}
              onClick={() => onSelect(profile)}
              onMouseEnter={() => setHovered(profile.id)}
              onMouseLeave={() => setHovered(null)}
              className="flex-1 bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg cursor-pointer border-2 transition-all duration-200"
              style={{
                borderColor: isHovered ? profile.color : 'transparent',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isHovered
                  ? `0 12px 32px rgba(0,0,0,0.25), 0 0 0 2px ${profile.color}`
                  : '0 4px 16px rgba(0,0,0,0.2)',
              }}
            >
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
                style={{ backgroundColor: profile.color }}
              >
                {profile.initial}
              </div>

              {/* Name */}
              <span className="text-gray-800 text-lg font-semibold">{profile.name}</span>

              {/* Mini stats */}
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: profile.color }}>
                  {stats.quizCount}
                </div>
                <div className="text-gray-400 text-xs">
                  {stats.quizCount === 1 ? 'quiz completato' : 'quiz completati'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-white/40 text-xs mt-10">I dati di ogni profilo sono separati</p>
    </div>
  );
}
