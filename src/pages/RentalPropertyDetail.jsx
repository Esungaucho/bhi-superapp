import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ChevronLeft, Bed, Bath, Users, MapPin, Star, CalendarHeart, Waves,
  Phone, Mail, Globe, ExternalLink, ConciergeBell, Calendar, Sparkles,
  CheckCircle2, Car, Anchor
} from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';
import EventVendorRecommendations from '@/components/rentals/EventVendorRecommendations';
import { RENTAL_TYPES } from '@/lib/rentalPropertyConstants';

export default function RentalPropertyDetail() {
  const { id } = useParams();

  const { data: property, isLoading } = useQuery({
    queryKey: ['rentalProperty', id],
    queryFn: () => base44.entities.RentalProperty.get(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">Property not found</p>
        <Link to="/rentals" className="text-sm text-accent font-medium">Back to Rentals</Link>
      </div>
    );
  }

  const typeMeta = RENTAL_TYPES.find(t => t.id === property.rental_type);
  const isEventVenue = property.is_event_friendly || property.is_wedding_friendly || property.is_private_event_friendly;
  const gallery = property.photos?.length > 0 ? property.photos : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format'];

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Gallery */}
      <div className="relative h-64 overflow-hidden">
        <img src={gallery[0]} alt={property.property_name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="relative flex items-center justify-between px-4 pt-3">
          <Link to="/rentals" className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white">
            <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </Link>
          <GlobalMenu />
        </div>
        {isEventVenue && (
          <div className="absolute bottom-3 left-4 flex gap-1.5">
            {property.is_event_friendly && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-accent/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <CalendarHeart className="w-3 h-3" /> Event Friendly
              </span>
            )}
            {property.is_wedding_friendly && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-amber-600/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <Star className="w-3 h-3" fill="currentColor" /> Wedding Friendly
              </span>
            )}
            {property.is_private_event_friendly && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-ocean/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <Sparkles className="w-3 h-3" /> Private Events
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        {/* Title */}
        {typeMeta && <p className="text-[10px] font-bold tracking-luxe-sm uppercase text-accent mb-1">{typeMeta.label}</p>}
        <h1 className="font-heading text-xl text-foreground">{property.property_name}</h1>
        {property.location && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground/60" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground">{property.location}</p>
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <Stat icon={<Bed className="w-4 h-4" strokeWidth={1.5} />} value={property.bedrooms} label="Beds" />
          <Stat icon={<Bath className="w-4 h-4" strokeWidth={1.5} />} value={property.bathrooms} label="Baths" />
          <Stat icon={<Users className="w-4 h-4" strokeWidth={1.5} />} value={property.sleeps} label="Sleeps" />
          {property.nightly_rate ? (
            <Stat icon={<Star className="w-4 h-4" strokeWidth={1.5} />} value={`$${property.nightly_rate}`} label="Night" />
          ) : (
            <Stat icon={<Star className="w-4 h-4" strokeWidth={1.5} />} value="—" label="Rate" />
          )}
        </div>

        {/* Event details */}
        {isEventVenue && (
          <div className="mt-4 bg-accent/5 border border-accent/20 rounded-xl p-4">
            <p className="text-[10px] font-bold tracking-luxe-sm uppercase text-accent mb-2">Event Venue Details</p>
            {property.max_event_guest_count > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-accent" strokeWidth={1.5} />
                <p className="text-sm text-foreground">Up to {property.max_event_guest_count} event guests</p>
              </div>
            )}
            <div className="flex gap-3 mt-1">
              {property.indoor_event_space && (
                <span className="flex items-center gap-1 text-[11px] text-foreground/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} /> Indoor Space
                </span>
              )}
              {property.outdoor_event_space && (
                <span className="flex items-center gap-1 text-[11px] text-foreground/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} /> Outdoor Space
                </span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {property.description && (
          <div className="mt-5">
            <p className="text-[10px] font-bold tracking-luxe-sm uppercase text-muted-foreground mb-2">About This Property</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{property.description}</p>
          </div>
        )}

        {/* Parking / Ferry / Golf Cart */}
        {property.parking_ferry_golf_cart_notes && (
          <div className="mt-5 bg-card border border-border/50 rounded-xl p-3">
            <p className="text-[10px] font-bold tracking-luxe-sm uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5" strokeWidth={1.5} /> Parking, Ferry & Golf Cart
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">{property.parking_ferry_golf_cart_notes}</p>
          </div>
        )}

        {/* Rules */}
        {property.rules_restrictions && (
          <div className="mt-3 bg-card border border-border/50 rounded-xl p-3">
            <p className="text-[10px] font-bold tracking-luxe-sm uppercase text-muted-foreground mb-1.5">Rules & Restrictions</p>
            <p className="text-xs text-foreground/80 leading-relaxed">{property.rules_restrictions}</p>
          </div>
        )}

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] font-bold tracking-luxe-sm uppercase text-muted-foreground mb-2">Amenities</p>
            <div className="flex flex-wrap gap-1.5">
              {property.amenities.map((a, i) => (
                <span key={i} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-sand text-muted-foreground">{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Property Manager */}
        {(property.property_manager || property.property_manager_phone || property.property_manager_email) && (
          <div className="mt-5 bg-card border border-border/50 rounded-xl p-3">
            <p className="text-[10px] font-bold tracking-luxe-sm uppercase text-muted-foreground mb-2">Property Manager</p>
            {property.property_manager && <p className="text-sm font-medium text-foreground">{property.property_manager}</p>}
            <div className="flex gap-2 mt-2">
              {property.property_manager_phone && (
                <a href={`tel:${property.property_manager_phone}`} className="flex items-center justify-center w-9 h-9 rounded-lg bg-sand hover:bg-sand-deep transition-colors">
                  <Phone className="w-4 h-4 text-accent" strokeWidth={1.5} />
                </a>
              )}
              {property.property_manager_email && (
                <a href={`mailto:${property.property_manager_email}`} className="flex items-center justify-center w-9 h-9 rounded-lg bg-sand hover:bg-sand-deep transition-colors">
                  <Mail className="w-4 h-4 text-accent" strokeWidth={1.5} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Real Estate Agent */}
        {(property.real_estate_agent_name || property.real_estate_agent_id) && (
          <Link
            to="/real-estate"
            className="mt-3 flex items-center gap-3 bg-card border border-border/50 rounded-xl p-3 hover:border-accent/40 transition-colors"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-ocean/10 text-ocean flex-shrink-0">
              <Anchor className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </span>
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-luxe-sm uppercase text-muted-foreground">Connected Agent</p>
              <p className="text-sm font-medium text-foreground">{property.real_estate_agent_name || 'View in Luxury Real Estate'}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.5} />
          </Link>
        )}

        {/* Vendor recommendations for event venues */}
        {isEventVenue && <EventVendorRecommendations propertyId={property.id} />}

        {/* Action buttons */}
        <div className="mt-6 space-y-2">
          <button className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <ConciergeBell className="w-5 h-5" strokeWidth={1.5} /> Book Through BHI Concierge
          </button>
          {isEventVenue && (
            <Link
              to="/events/start"
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-card border border-accent/40 text-accent text-sm font-medium hover:bg-accent/5 transition-colors"
            >
              <CalendarHeart className="w-5 h-5" strokeWidth={1.5} /> Plan an Event at This Property
            </Link>
          )}
          {property.booking_link && (
            <a
              href={property.booking_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-card border border-border text-sm font-medium hover:border-accent transition-colors"
            >
              <Globe className="w-5 h-5 text-accent" strokeWidth={1.5} /> Book Direct
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="flex flex-col items-center bg-sand/50 rounded-xl py-2.5">
      <span className="text-muted-foreground mb-1">{icon}</span>
      <p className="text-sm font-bold text-foreground">{value}</p>
      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</p>
    </div>
  );
}