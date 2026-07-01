import React, { useState } from 'react';
import { Anchor, Fish, MapPin } from 'lucide-react';
import FishingBoating from './FishingBoating';
import SeasonalFishingGuide from './SeasonalFishingGuide';
import FishingMap from './FishingMap';

const SUB_TABS = [
  { id: 'charters', label: 'Charters', icon: Anchor },
  { id: 'guide', label: 'Guide', icon: Fish },
  { id: 'spots', label: 'Spots', icon: MapPin },
];

export default function FishingExplorer() {
  const [subTab, setSubTab] = useState('charters');

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tab navigation */}
      <div className="bg-navy px-4 py-2 flex gap-1.5">
        {SUB_TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                subTab === t.id ? 'bg-white text-primary' : 'bg-white/10 text-white/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Active sub-tab content */}
      <div className="flex-1 overflow-y-auto">
        {subTab === 'charters' && <FishingBoating />}
        {subTab === 'guide' && (
          <div className="overflow-y-auto">
            <SeasonalFishingGuide />
          </div>
        )}
        {subTab === 'spots' && <FishingMap />}
      </div>
    </div>
  );
}