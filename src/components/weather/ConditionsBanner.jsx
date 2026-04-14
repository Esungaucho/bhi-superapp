import React from 'react';
import { Link } from 'react-router-dom';
import { Wind, Waves, Users, Sun } from 'lucide-react';

const CONDITION_EMOJI = {
  sunny: '☀️', partly_cloudy: '⛅', cloudy: '☁️',
  rain: '🌧️', storm: '⛈️', foggy: '🌫️',
};

const FLAG_COLORS = {
  green: 'bg-emerald-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
};

const FLAG_LABELS = {
  green: 'Safe', yellow: 'Caution', red: 'Dangerous', purple: 'Marine Life',
};

const CROWD_LABELS = {
  quiet: 'Quiet', moderate: 'Moderate', busy: 'Busy', very_busy: 'Very Busy',
};

export default function ConditionsBanner({ conditions }) {
  if (!conditions) return null;

  const emoji = CONDITION_EMOJI[conditions.condition] || '🌤️';

  return (
    <Link to="/weather" className="block mx-4 my-3">
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{emoji}</span>
            <div>
              <p className="text-2xl font-bold leading-none">{conditions.temp_f}°F</p>
              <p className="text-xs text-white/70 capitalize mt-0.5">{conditions.condition?.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <span className={`w-3 h-3 rounded-full ${FLAG_COLORS[conditions.beach_flag] || 'bg-green-500'}`} />
              <span className="text-xs font-semibold">{FLAG_LABELS[conditions.beach_flag] || 'Safe'}</span>
            </div>
            <p className="text-xs text-white/70 mt-1">Beach Flag</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <StatPill icon={<Wind className="w-3 h-3" />} label="Wind" value={`${conditions.wind_mph}mph`} />
          <StatPill icon={<Sun className="w-3 h-3" />} label="UV" value={conditions.uv_index} />
          <StatPill icon={<Waves className="w-3 h-3" />} label="Waves" value={`${conditions.wave_height_ft}ft`} />
          <StatPill icon={<Users className="w-3 h-3" />} label="Crowd" value={CROWD_LABELS[conditions.crowd_level] || 'Moderate'} />
        </div>
      </div>
    </Link>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <div className="bg-white/15 rounded-xl p-2 text-center">
      <div className="flex justify-center mb-0.5">{icon}</div>
      <p className="text-[11px] font-bold leading-tight">{value}</p>
      <p className="text-[9px] text-white/60">{label}</p>
    </div>
  );
}