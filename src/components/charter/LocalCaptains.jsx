import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Star, MapPin, Users, Anchor, Phone, Globe } from 'lucide-react';
import { DIFFICULTY_META, PRICE_RANGE_LABELS } from '@/lib/charterConstants';
import SaveCaptainButton from '@/components/captain/SaveCaptainButton';

export default function LocalCaptains() {
  const { data: charters = [], isLoading } = useQuery({
    queryKey: ['fishingCharters', 'captains'],
    queryFn: () => base44.entities.FishingCharter.filter({ is_available: true }, '-is_featured,-rating', 50),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (charters.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Anchor className="w-10 h-10 mx-auto mb-3 text-accent/40" />
        <p className="font-medium text-foreground">No captains listed yet</p>
        <p className="text-sm mt-1">Check back soon for local charter recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Featured captains first */}
      {charters.filter(c => c.is_featured).length > 0 && (
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-1">
          ⭐ Featured Captains
        </p>
      )}
      {charters.filter(c => c.is_featured).map(c => (
        <CaptainCard key={c.id} charter={c} />
      ))}

      {charters.filter(c => c.is_featured).length > 0 && (
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-1 pt-2">
          All Local Captains
        </p>
      )}
      {charters.filter(c => !c.is_featured).map(c => (
        <CaptainCard key={c.id} charter={c} />
      ))}
    </div>
  );
}

function CaptainCard({ charter }) {
  const diff = DIFFICULTY_META[charter.difficulty] || DIFFICULTY_META.beginner;
  const priceLabel = PRICE_RANGE_LABELS[charter.price_range] || 'Mid-Range';
  const photo = charter.captain_photo_url || charter.images?.[0];

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Photo */}
      {photo && (
        <div className="h-32 bg-secondary overflow-hidden">
          <img src={photo} alt={charter.captain_name || charter.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Captain name + rating */}
        <div className="flex items-start justify-between gap-2">
          <div>
            {charter.captain_name && (
              <p className="text-[10px] font-semibold text-accent uppercase tracking-wide">Captain</p>
            )}
            <h3 className="text-sm font-semibold text-foreground leading-tight">
              {charter.captain_name || charter.name}
            </h3>
            {charter.captain_name && (
              <p className="text-xs text-muted-foreground mt-0.5">{charter.name}</p>
            )}
          </div>
          {charter.rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-foreground">{charter.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {charter.captain_bio && (
          <p className="text-xs text-muted-foreground leading-relaxed">{charter.captain_bio}</p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${diff.bg} ${diff.color}`}>
            {diff.label}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {priceLabel}
          </span>
          {charter.trip_length_hours && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {charter.trip_length_hours}h trip
            </span>
          )}
          {charter.max_passengers && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground flex items-center gap-0.5">
              <Users className="w-2.5 h-2.5" /> {charter.max_passengers}
            </span>
          )}
        </div>

        {/* Location + price */}
        <div className="flex items-center justify-between pt-1">
          {charter.location_name ? (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="w-3 h-3" /> {charter.location_name}
            </div>
          ) : <span />}
          {charter.price_from && (
            <span className="text-sm font-bold text-foreground">
              ${charter.price_from}
              <span className="text-[10px] font-normal text-muted-foreground">+</span>
            </span>
          )}
        </div>

        {/* Contact + Save */}
        <div className="flex flex-wrap gap-2 pt-1">
          {charter.contact_phone && (
            <a
              href={`tel:${charter.contact_phone}`}
              className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-xl py-2 hover:opacity-90 transition-opacity"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
          )}
          {charter.website && (
            <a
              href={charter.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 text-xs font-medium border border-border text-foreground rounded-xl py-2 hover:bg-secondary transition-colors"
            >
              <Globe className="w-3.5 h-3.5" /> Website
            </a>
          )}
          <SaveCaptainButton charter={charter} captainName={charter.captain_name} />
        </div>
      </div>
    </div>
  );
}