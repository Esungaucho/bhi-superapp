import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, BedDouble, Bath } from 'lucide-react';

const SOURCE_LABELS = {
  vrbo: { label: 'VRBO', color: 'bg-blue-100 text-blue-700' },
  airbnb: { label: 'Airbnb', color: 'bg-rose-100 text-rose-700' },
  intracoastal: { label: 'Intracoastal Realty', color: 'bg-emerald-100 text-emerald-700' },
};

export default function LodgingCard({ listing }) {
  const src = SOURCE_LABELS[listing.source] || { label: listing.source, color: 'bg-secondary text-foreground' };
  const image = listing.images?.[0] || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=80';

  return (
    <Link to={`/lodging/${listing.id}`} className="block bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-44 bg-muted overflow-hidden">
        <img src={image} alt={listing.title} className="w-full h-full object-cover" />
        {listing.is_featured && (
          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>
        )}
        <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${src.color}`}>
          {src.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="font-semibold text-sm text-foreground line-clamp-1">{listing.title}</p>
        {listing.neighborhood && (
          <p className="text-[11px] text-muted-foreground">📍 {listing.neighborhood}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{listing.bedrooms} bd</span>
          <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{listing.bathrooms} ba</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />up to {listing.max_guests}</span>
        </div>

        {/* Price + rating */}
        <div className="flex justify-between items-center pt-1">
          <p className="text-sm font-bold text-foreground">
            ${listing.price_per_night}<span className="font-normal text-muted-foreground text-xs">/night</span>
          </p>
          {listing.rating && (
            <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {listing.rating.toFixed(1)}
              {listing.review_count > 0 && <span className="text-muted-foreground font-normal">({listing.review_count})</span>}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}