import React, { useState } from 'react';
import { ArrowLeft, Fish, Sailboat, Waves, Bike, Car, Leaf, Puzzle } from 'lucide-react';
import FishingExplorer from './FishingExplorer';
import FishingBoating from './FishingBoating';

const EXPERIENCE_CATEGORIES = [
  { id: 'fishing', label: 'Fishing Charters', Icon: Fish, desc: 'Inshore, offshore & family trips with local captains', img: 'https://images.unsplash.com/photo-1544142361-296f6b27c3a7?q=80&w=600&auto=format' },
  { id: 'boat_tours', label: 'Boat Tours', Icon: Sailboat, desc: 'Sunset cruises, sailing & scenic tours', img: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?q=80&w=600&auto=format', charterTypes: ['sunset_cruise', 'sailboat_charter'] },
  { id: 'kayaks', label: 'Kayak & Paddleboard', Icon: Waves, desc: 'Paddle the island waterways', img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600&auto=format', charterTypes: ['private_boat_rental'] },
  { id: 'bike_rentals', label: 'Bike Rentals', Icon: Bike, desc: 'Explore the island on two wheels', img: 'https://images.unsplash.com/photo-1526287765458-4b8d3a3a5c3f?q=80&w=600&auto=format' },
  { id: 'golf_cart', label: 'Golf Cart Rentals', Icon: Car, desc: 'Cruise the island in comfort', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&auto=format' },
  { id: 'nature', label: 'Nature Tours', Icon: Leaf, desc: 'Eco tours, birding & island wildlife', img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600&auto=format', charterTypes: ['eco_tour'] },
  { id: 'surf', label: 'Surf Lessons', Icon: Waves, desc: 'Surfing, paddleboarding & water sports', img: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=600&auto=format' },
  { id: 'family', label: 'Family Activities', Icon: Puzzle, desc: 'Kid-friendly adventures & island fun', img: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=600&auto=format' },
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
          <div className="w-16 h-16 rounded-2xl bg-sand flex items-center justify-center mb-5">
            <selectedCat.Icon className="w-7 h-7 text-ocean" strokeWidth={1.5} />
          </div>
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
      <div className="px-5 pt-5 pb-4">
        <p className="text-[10px] font-body tracking-luxe uppercase text-muted-foreground/60 mb-2">Reserve</p>
        <h1 className="font-heading text-[2rem] text-foreground leading-tight">Book Experiences</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Charters, tours, rentals & adventures</p>
      </div>

      <div className="px-5 pb-8 grid grid-cols-2 gap-3">
        {EXPERIENCE_CATEGORIES.map(({ id, label, Icon, desc, img }) => (
          <button
            key={id}
            onClick={() => setSelected(id)}
            className="group relative bg-card rounded-2xl overflow-hidden border border-border/20 shadow-luxe-sm hover:shadow-luxe transition-all duration-300 active:scale-[0.98] text-left"
          >
            <div className="h-28 overflow-hidden">
              <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-heading font-medium text-foreground leading-tight">{label}</h3>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{desc}</p>
            </div>
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
              <Icon className="w-4 h-4 text-charcoal" strokeWidth={1.5} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BackBar({ label, onBack }) {
  return (
    <div className="bg-card border-b border-border/30 px-5 py-3 flex items-center gap-2 sticky top-0 z-10">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-ocean">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> All Experiences
      </button>
      <span className="text-xs text-muted-foreground ml-1">/ {label}</span>
    </div>
  );
}