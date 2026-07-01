import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Star, MapPin, Clock, Users } from 'lucide-react';
import { CHARTER_CATEGORIES, DIFFICULTY_META, getCharterCategory } from '@/lib/charterConstants';
import CharterDetail from './CharterDetail';

export default function FishingBoating() {
  const [activeCat, setActiveCat] = useState('all');
  const [selectedCharter, setSelectedCharter] = useState(null);

  const { data: charters = [], isLoading } = useQuery({
    queryKey: ['fishingCharters'],
    queryFn: () => base44.entities.FishingCharter.filter({ is_available: true }, '-is_featured', 50),
  });

  const filtered = activeCat === 'all' ? charters : charters.filter(c => c.category === activeCat);

  if (selectedCharter) {
    return (
      <CharterDetail
        charter={selectedCharter}
        onBack={() => setSelectedCharter(null)}
        onBook={() => alert('Booking flow coming soon!')}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-sea-glass/20 to-navy/10 px-4 py-4 border-b border-border">
        <h2 className="font-heading text-xl text-foreground">🎣 Fishing & Boating</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Charters, cruises & rentals on Bald Head Island</p>
      </div>

      {/* Category filters */}
      <div className="bg-card px-4 py-2.5 border-b border-border">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveCat('all')}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${activeCat === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}
          >
            All
          </button>
          {CHARTER_CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${activeCat === c.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-3xl mb-2">⚓</p>
            <p className="text-sm font-medium text-foreground">No listings yet</p>
            <p className="text-xs mt-1">Check back soon for fishing & boating options</p>
          </div>
        ) : (
          filtered.map(charter => (
            <CharterCard key={charter.id} charter={charter} onClick={() => setSelectedCharter(charter)} />
          ))
        )}
      </div>
    </div>
  );
}

function CharterCard({ charter, onClick }) {
  const cat = getCharterCategory(charter.category);
  const difficulty = DIFFICULTY_META[charter.difficulty] || DIFFICULTY_META.beginner;
  const heroImage = charter.images?.[0];

  return (
    <div onClick={onClick} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      {heroImage ? (
        <div className="relative h-40">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          {charter.is_featured && (
            <span className="absolute top-2 left-2 bg-amber-400 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">★ Featured</span>
          )}
          <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-semibold px-2 py-0.5 rounded-full text-foreground">
            {cat.emoji} {cat.label}
          </span>
        </div>
      ) : (
        <div className="h-24 bg-gradient-to-br from-sea-glass/20 to-navy/10 flex items-center justify-center">
          <span className="text-3xl">{cat.emoji}</span>
          {charter.is_featured && (
            <span className="absolute top-2 left-2 bg-amber-400 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">★ Featured</span>
          )}
        </div>
      )}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground leading-snug">{charter.name}</h3>
          {charter.rating && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-foreground flex-shrink-0">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {charter.rating.toFixed(1)}
            </span>
          )}
        </div>
        {charter.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{charter.description}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-2.5 text-[11px] text-muted-foreground">
          {charter.trip_length_hours && (
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {charter.trip_length_hours}hr</span>
          )}
          {charter.max_passengers && (
            <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {charter.max_passengers}</span>
          )}
          {charter.location_name && (
            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> <span className="truncate">{charter.location_name}</span></span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/50">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficulty.bg} ${difficulty.color}`}>
            {difficulty.label}
          </span>
          <div className="flex items-center gap-2">
            {charter.price_range && <span className="text-xs font-medium text-muted-foreground">{charter.price_range}</span>}
            {charter.price_from && <span className="text-sm font-bold text-foreground">From ${charter.price_from}</span>}
            <button className="text-xs font-semibold bg-primary text-primary-foreground rounded-full px-3 py-1.5">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}