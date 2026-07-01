import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Heart, CheckCircle2, ShieldCheck, Baby } from 'lucide-react';
import { AGE_RANGE_LABELS, COMFORT_LABELS, CERTIFICATIONS } from '@/lib/babysittingConstants';

export default function SitterCard({ sitter, isSaved, onToggleSave }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-[0_2px_12px_-8px_rgba(31,45,61,0.12)] hover:shadow-luxe transition-shadow">
      <div className="flex gap-4 p-4">
        {/* Photo */}
        <div className="flex-shrink-0">
          {sitter.profile_photo_url && !imgError ? (
            <img
              src={sitter.profile_photo_url}
              alt={sitter.first_name}
              onError={() => setImgError(true)}
              className="w-20 h-20 rounded-xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-sand flex items-center justify-center">
              <span className="font-heading text-2xl text-navy">
                {sitter.first_name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-heading text-base text-foreground">
                {sitter.first_name} {sitter.last_initial}
              </h3>
              <p className="text-xs text-muted-foreground">
                {AGE_RANGE_LABELS[sitter.age_range]}
              </p>
            </div>
            {onToggleSave && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleSave(sitter);
                }}
                className="p-1.5 -mr-1 rounded-full hover:bg-sand/60 transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${isSaved ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`}
                  strokeWidth={1.5}
                />
              </button>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-foreground">
              {sitter.rating > 0 ? sitter.rating.toFixed(1) : 'New'}
            </span>
            {sitter.review_count > 0 && (
              <span className="text-xs text-muted-foreground">({sitter.review_count})</span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-xs text-muted-foreground">
              {sitter.on_island ? 'On Island' : 'Off Island'}
              {sitter.travel_time_to_ferry ? ` · ${sitter.travel_time_to_ferry}` : ''}
            </span>
          </div>

          {/* Rate */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-xs font-medium text-foreground">${sitter.hourly_rate}/hr</span>
            <span className="text-xs text-muted-foreground">· min {sitter.min_booking_hours}hr</span>
          </div>
        </div>
      </div>

      {/* Certifications row */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {CERTIFICATIONS.filter((c) => sitter[c.key]).map((c) => (
          <span key={c.key} className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
            <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
            {c.label}
          </span>
        ))}
        {sitter.background_check_status === 'passed' && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-navy bg-accent/10 rounded-full px-2 py-0.5">
            <ShieldCheck className="w-3 h-3" strokeWidth={1.5} />
            Background Checked
          </span>
        )}
      </div>

      <Link
        to={`/babysitting/sitter/${sitter.id}`}
        className="block text-center text-xs font-medium text-primary border-t border-border/50 py-2.5 hover:bg-sand/40 transition-colors"
      >
        View Profile
      </Link>
    </div>
  );
}