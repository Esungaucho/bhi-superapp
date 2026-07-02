import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Users, MapPin, Star, CalendarHeart, Waves } from 'lucide-react';
import { RENTAL_TYPES } from '@/lib/rentalPropertyConstants';

export default function RentalPropertyCard({ property }) {
  const typeMeta = RENTAL_TYPES.find(t => t.id === property.rental_type);
  const photo = property.photos?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=400&auto=format';

  return (
    <Link
      to={`/rental-properties/${property.id}`}
      className="block bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-luxe transition-all"
    >
      <div className="relative h-44 overflow-hidden">
        <img src={photo} alt={property.property_name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1">
          {property.is_event_friendly && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-white bg-accent/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <CalendarHeart className="w-2.5 h-2.5" /> Event Friendly
            </span>
          )}
          {property.is_wedding_friendly && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-white bg-amber-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <Star className="w-2.5 h-2.5" fill="currentColor" /> Wedding
            </span>
          )}
        </div>
        {property.is_featured && (
          <span className="absolute top-2 right-2 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
        <div className="absolute bottom-2 left-3 right-3 text-white">
          <p className="text-sm font-semibold leading-tight">{property.property_name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-white/80" strokeWidth={1.5} />
            <p className="text-[11px] text-white/80">{property.location}</p>
          </div>
        </div>
      </div>

      <div className="p-3">
        {typeMeta && (
          <p className="text-[10px] font-medium text-accent mb-2">{typeMeta.label}</p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" strokeWidth={1.5} /> {property.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" strokeWidth={1.5} /> {property.bathrooms}</span>
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" strokeWidth={1.5} /> {property.sleeps}</span>
        </div>
        {property.nightly_rate && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
            <p className="text-sm font-bold text-foreground">${property.nightly_rate}<span className="text-[10px] font-normal text-muted-foreground">/night</span></p>
            {property.is_event_friendly && property.max_event_guest_count > 0 && (
              <p className="text-[10px] text-muted-foreground">Up to {property.max_event_guest_count} guests</p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}