import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import FishingExplorer from './FishingExplorer';
import FishingBoating from './FishingBoating';

const EXPERIENCE_CATEGORIES = [
  {
    id: 'fishing',
    label: 'Fishing Charters',
    emoji: '🎣',
    desc: 'Inshore, offshore & family trips with local captains',
    gradient: 'from-blue-600/20 to-cyan-500/10',
  },
  {
    id: 'boat_tours',
    label: 'Boat Tours',
    emoji: '⛵',
    desc: 'Sunset cruises, sailing & scenic tours',
    gradient: 'from-orange-500/20 to-amber-500/10',
    charterTypes: ['sunset_cruise', 'sailboat_charter'],
  },
  {
    id: 'kayaks',
    label: 'Kayak & Paddleboard',
    emoji: '🛶',
    desc: 'Paddle the island waterways',
    gradient: 'from-teal-500/20 to-green-500/10',
    charterTypes: ['private_boat_rental'],
  },
  {
    id: 'bike_rentals',
    label: 'Bike Rentals',
    emoji: '🚲',
    desc: 'Explore the island on two wheels',
    gradient: 'from-green-500/20 to-lime-500/10',
  },
  {
    id: 'golf_cart',
    label: 'Golf Cart Rentals',
    emoji: '🛺',
    desc: 'Cruise the island in comfort',
    gradient: 'from-amber-500/20 to-yellow-500/10',
  },
  {
    id: 'nature',
    label: 'Nature Tours',
    emoji: '🌿',
    desc: 'Eco tours, birding & island wildlife',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    charterTypes: ['eco_tour'],
  },
  {
    id: 'surf',
    label: 'Surf Lessons',
    emoji: '🏄',
    desc: 'Surfing, paddleboarding & water sports',
    gradient: 'from-cyan-500/20 to-blue-500/10',
  },
  {
    id: 'family',
    label: 'Family Activities',
    emoji: '🎪',
    desc: 'Kid-friendly adventures & island fun',
    gradient: 'from-rose-500/20 to-pink-500/10',
  },
];

export default function ExperiencesHub() {
  const [selected, setSelected] = useState(null);

  if (selected === 'fishing') {
    return (
      <div className="flex flex-col h-full">
        <BackBar label="Fishing Charters" onBack={() => setSelected(null)} />
        <FishingExplorer />
      </div>
    );
  }

  const selectedCat = EXPERIENCE_CATEGORIES.find(c => c.id === selected);

  if (selectedCat?.charterTypes) {
    return (
      <div className="flex flex-col h-full">
        <BackBar label={selectedCat.label} onBack={() => setSelected(null)} />
        <FishingBoating
          presetCategories={selectedCat.charterTypes}
          title={selectedCat.label}
          subtitle={selectedCat.desc}
        />
      </div>
    );
  }

  if (selectedCat) {
    return (
      <div className="flex flex-col h-full">
        <BackBar label={selectedCat.label} onBack={() => setSelected(null)} />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <span className="text-5xl mb-4">{selectedCat.emoji}</span>
          <h3 className="font-heading text-lg text-foreground">{selectedCat.label}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
            {selectedCat.desc}. Listings coming soon — check back for island providers!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-4">
        <h1 className="font-heading text-2xl text-foreground">Book Experiences</h1>
        <p className="text-sm text-muted-foreground mt-1">Charters, tours, rentals & adventures</p>
      </div>

      {/* Category grid */}
      <div className="px-4 pb-8 grid grid-cols-2 gap-3">
        {EXPERIENCE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelected(cat.id)}
            className={`bg-gradient-to-br ${cat.gradient} rounded-2xl border border-border/50 p-4 text-left hover:shadow-[0_12px_32px_-16px_rgba(31,45,61,0.3)] hover:border-accent/20 transition-all duration-300 active:scale-[0.97]`}
          >
            <span className="text-3xl block mb-2">{cat.emoji}</span>
            <h3 className="text-sm font-heading font-medium text-foreground leading-tight">{cat.label}</h3>
            <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{cat.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function BackBar({ label, onBack }) {
  return (
    <div className="bg-card border-b border-border/50 px-4 py-2.5 flex items-center gap-2 sticky top-0 z-10">
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-medium text-accent">
        <ArrowLeft className="w-4 h-4" /> All Experiences
      </button>
      <span className="text-xs text-muted-foreground ml-1">/ {label}</span>
    </div>
  );
}