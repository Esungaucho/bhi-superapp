import React, { useState } from 'react';
import { Star, Clock, Anchor, MapPin, Users, Phone, ChevronLeft, Ship } from 'lucide-react';
import { DIFFICULTY_META, PRICE_RANGE_LABELS } from '@/lib/charterConstants';

export default function CharterDetail({ charter, onBack, onBook }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = charter.images?.length ? charter.images : [];
  const difficulty = DIFFICULTY_META[charter.difficulty] || DIFFICULTY_META.beginner;

  return (
    <div className="pb-24">
      {/* Hero image */}
      {images.length > 0 ? (
        <div className="relative h-64">
          <img src={images[activeImage]} alt="" className="w-full h-full object-cover" />
          <button onClick={onBack} className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-2 h-2 rounded-full transition-opacity ${i === activeImage ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-32 bg-gradient-to-br from-sea-glass/30 to-navy/10 flex items-center justify-center">
          <button onClick={onBack} className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <Ship className="w-10 h-10 text-accent/40" />
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {/* Title */}
        <div>
          <h1 className="font-heading text-2xl text-foreground leading-tight">{charter.name}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            {charter.rating && (
              <span className="flex items-center gap-0.5 text-sm font-medium text-foreground">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {charter.rating.toFixed(1)}
                <span className="text-muted-foreground font-normal">({charter.review_count || 0})</span>
              </span>
            )}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficulty.bg} ${difficulty.color}`}>
              {difficulty.label}
            </span>
            {charter.price_range && (
              <span className="text-[10px] font-semibold text-accent">{charter.price_range} · {PRICE_RANGE_LABELS[charter.price_range]}</span>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2.5">
          {charter.trip_length_hours && (
            <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Trip Length</p>
                <p className="text-xs font-semibold text-foreground">{charter.trip_length_hours} hr{charter.trip_length_hours !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
          {charter.max_passengers && (
            <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Capacity</p>
                <p className="text-xs font-semibold text-foreground">Up to {charter.max_passengers}</p>
              </div>
            </div>
          )}
          {charter.price_from && (
            <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-2">
              <Anchor className="w-4 h-4 text-accent flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">From</p>
                <p className="text-xs font-semibold text-foreground">${charter.price_from}</p>
              </div>
            </div>
          )}
          {charter.location_name && (
            <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Departs</p>
                <p className="text-xs font-semibold text-foreground truncate">{charter.location_name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {charter.description && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1.5">About This Trip</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{charter.description}</p>
          </div>
        )}

        {/* Captain profile */}
        {charter.captain_name && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Meet Your Captain</h3>
            <div className="flex items-start gap-3">
              {charter.captain_photo_url ? (
                <img src={charter.captain_photo_url} alt={charter.captain_name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sea-glass to-navy flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                  {charter.captain_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">Captain {charter.captain_name}</p>
                {charter.captain_bio && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{charter.captain_bio}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Target fish by season */}
        {charter.target_fish_seasonal && (
          <div className="bg-gradient-to-br from-sea-glass/15 to-navy/5 rounded-2xl border border-accent/20 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1.5">🐟 Target Fish by Season</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{charter.target_fish_seasonal}</p>
          </div>
        )}

        {/* Tags */}
        {charter.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {charter.tags.map(tag => (
              <span key={tag} className="text-[11px] text-accent bg-accent/10 rounded-full px-2.5 py-1">#{tag}</span>
            ))}
          </div>
        )}

        {/* Contact */}
        {charter.contact_phone && (
          <a href={`tel:${charter.contact_phone}`} className="flex items-center gap-2 text-sm text-accent">
            <Phone className="w-4 h-4" /> {charter.contact_phone}
          </a>
        )}
      </div>

      {/* Book now bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border px-4 py-3 z-50">
        <button
          onClick={onBook}
          className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold"
        >
          Book Now{charter.price_from ? ` · From $${charter.price_from}` : ''}
        </button>
      </div>
    </div>
  );
}