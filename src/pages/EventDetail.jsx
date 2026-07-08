import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = L.divIcon({
  className: '',
  html: '<div style="width:24px;height:24px;background:hsl(198,34%,37%);border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
import {
  Bookmark, Share2, Calendar, MapPin, Clock, Users, Bell, CalendarPlus,
  Navigation, ExternalLink, UtensilsCrossed, ShoppingBag, Waves, Ship, ChevronLeft, Star,
} from 'lucide-react';
import { getCategory, getOrganization, getSourceBadge, NOTIFICATION_TIMINGS } from '@/lib/calendarConstants';

export default function EventDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [notifySettings, setNotifySettings] = useState({});

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: event, isLoading } = useQuery({
    queryKey: ['islandEvent', id],
    queryFn: () => base44.entities.IslandEvent.get(id),
  });
  const { data: saved = [] } = useQuery({
    queryKey: ['savedEvents', user?.email],
    queryFn: () => base44.entities.SavedEvent.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const savedRecord = saved.find(s => s.event_id === id);
  const cat = event ? getCategory(event.category) : null;
  const org = event?.organization ? getOrganization(event.organization) : null;
  const sourceBadge = event ? getSourceBadge(event.source) : null;
  const heroImage = event?.featured_image || event?.image_url;
  const hasCoords = event?.latitude && event?.longitude;

  const toggleSave = async () => {
    if (savedRecord) {
      await base44.entities.SavedEvent.delete(savedRecord.id);
    } else {
      await base44.entities.SavedEvent.create({
        user_email: user.email,
        event_id: id,
        rsvp_status: 'going',
        notify_24h: true,
        notify_2h: true,
        notify_30m: false,
      });
    }
    queryClient.invalidateQueries({ queryKey: ['savedEvents', user?.email] });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: event.title, text: event.description, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const getGoogleCalendarUrl = () => {
    if (!event) return '#';
    const start = format(new Date(event.start_time), "yyyyMMdd'T'HHmmss");
    const end = event.end_time ? format(new Date(event.end_time), "yyyyMMdd'T'HHmmss") : start;
    const params = new URLSearchParams({
      action: 'TEMPLATE', text: event.title, dates: `${start}/${end}`,
      details: event.description || '', location: event.location_name || '',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const addToTrip = async () => {
    if (savedRecord) {
      await base44.entities.SavedEvent.update(savedRecord.id, { added_to_trip: !savedRecord.added_to_trip });
      queryClient.invalidateQueries({ queryKey: ['savedEvents', user?.email] });
    }
  };

  const toggleNotify = async (field) => {
    if (savedRecord) {
      const newVal = !(savedRecord[field]);
      await base44.entities.SavedEvent.update(savedRecord.id, { [field]: newVal });
      queryClient.invalidateQueries({ queryKey: ['savedEvents', user?.email] });
    }
  };

  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`
    : event?.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.address)}`
    : '#';

  if (isLoading) return (
    <div className="flex justify-center py-20"><div className="w-6 h-6 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
  );
  if (!event) return (
    <div className="text-center py-20 space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Event not found</p>
      <Link to="/calendar" className="text-xs text-accent">← Back to Calendar</Link>
    </div>
  );

  return (
    <div className="pb-8">
      {/* Hero image */}
      {heroImage && (
        <div className="relative h-64">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-navy-deep/20 to-transparent" />
          <Link to="/calendar" className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
            <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </Link>
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-semibold text-foreground">
              {cat.Icon && <cat.Icon className="w-3.5 h-3.5" strokeWidth={1.5} />}
              {cat.label}
            </span>
            {event.featured && (
              <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-900 rounded-full px-2.5 py-1 text-[11px] font-bold ml-2">
                <Star className="w-3 h-3 fill-current" /> Featured
              </span>
            )}
            {sourceBadge && event.source !== 'admin_manual' && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ml-2 ${sourceBadge.badge}`}>
                {sourceBadge.Icon && <sourceBadge.Icon className="w-3 h-3" strokeWidth={1.5} />}
                {sourceBadge.label}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {!heroImage && (
          <Link to="/calendar" className="flex items-center gap-1 text-sm text-muted-foreground">
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} /> Back
          </Link>
        )}

        {/* Title */}
        <h1 className="font-heading text-2xl text-foreground leading-tight">{event.title}</h1>

        {/* Short description */}
        {event.short_description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{event.short_description}</p>
        )}

        {/* Event details */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-foreground">
            <Calendar className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
            <span>{format(new Date(event.start_time), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-foreground">
            <Clock className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
            <span>{event.all_day || event.is_all_day ? 'All day' : `${format(new Date(event.start_time), 'h:mm a')}${event.end_time ? ' – ' + format(new Date(event.end_time), 'h:mm a') : ''}`}</span>
          </div>
          {event.location_name && (
            <div className="flex items-center gap-2.5 text-sm text-foreground">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
              <span>{event.location_name}</span>
            </div>
          )}
          {(org && org.label !== 'Unknown' && org.label !== 'Admin (Manual)') && (
            <div className="flex items-center gap-2.5 text-sm text-foreground">
              <Users className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
              <span>{org.label}</span>
            </div>
          )}
        </div>

        {/* Interactive map */}
        {hasCoords && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <p className="text-[10px] font-semibold uppercase tracking-luxe-sm text-muted-foreground px-4 pt-3">Location</p>
            <div className="h-48 mt-2">
              <MapContainer center={[event.latitude, event.longitude]} zoom={14} className="w-full h-full" style={{ zIndex: 0 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[event.latitude, event.longitude]} icon={markerIcon}>
                  <Popup>{event.location_name || event.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-accent border-t border-border/50 hover:bg-sand/30 transition-colors">
              <Navigation className="w-3.5 h-3.5" strokeWidth={1.5} /> Get Directions
            </a>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {/* Tags */}
        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map(tag => (
              <span key={tag} className="text-[11px] text-accent bg-accent/10 rounded-full px-2.5 py-1">#{tag}</span>
            ))}
          </div>
        )}

        {/* Price */}
        {event.price_note && (
          <div className="bg-accent/10 rounded-xl px-4 py-2.5">
            <p className="text-xs text-accent font-medium">{event.price_note}</p>
          </div>
        )}

        {/* Visit Official Event Page — prominent button */}
        {event.source_url && (
          <a href={event.source_url} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold bg-ocean text-white">
            <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
            Visit Official Event Page
          </a>
        )}

        {/* Primary actions */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={toggleSave}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-colors ${savedRecord ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'}`}
          >
            <Bookmark className={`w-4 h-4 ${savedRecord ? 'fill-current' : ''}`} />
            {savedRecord ? 'Saved to My Events' : 'Save Event'}
          </button>

          {/* Registration */}
          {event.registration_required && event.registration_url && (
            <a href={event.registration_url} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold bg-ocean text-white">
              <ExternalLink className="w-4 h-4" strokeWidth={1.5} /> Register Now
            </a>
          )}

          {/* Quick actions grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <a href={getGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-card border border-border text-foreground hover:bg-sand/30 transition-colors">
              <CalendarPlus className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Add to Calendar</span>
            </a>
            <button onClick={handleShare}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-card border border-border text-foreground hover:bg-sand/30 transition-colors">
              <Share2 className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Share</span>
            </button>
            <button onClick={addToTrip} disabled={!savedRecord}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-colors disabled:opacity-40 ${savedRecord?.added_to_trip ? 'bg-accent/10 border-accent text-accent' : 'bg-card border-border text-foreground hover:bg-sand/30'}`}>
              <Calendar className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{savedRecord?.added_to_trip ? 'In Trip' : 'Add to Trip'}</span>
            </button>
          </div>

          {/* Notification settings */}
          {savedRecord && (
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-accent" strokeWidth={1.5} />
                <p className="text-xs font-semibold text-foreground">Notify Me Before Event</p>
              </div>
              <div className="space-y-2">
                {NOTIFICATION_TIMINGS.map(t => (
                  <button key={t.id} onClick={() => toggleNotify(t.id)}
                    className="w-full flex items-center justify-between py-1.5">
                    <span className="flex items-center gap-2 text-xs text-foreground">
                      <t.Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                      {t.label}
                    </span>
                    <span className={`w-9 h-5 rounded-full flex items-center transition-colors ${savedRecord[t.id] ? 'bg-primary' : 'bg-border'}`}>
                      <span className={`w-4 h-4 bg-white rounded-full transition-transform mx-0.5 ${savedRecord[t.id] ? 'translate-x-4' : ''}`} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nearby concierge */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-luxe-sm text-muted-foreground mb-3">Explore Nearby</p>
            <div className="grid grid-cols-2 gap-2.5">
              <NearbyLink to="/food" icon={<UtensilsCrossed className="w-4 h-4 text-accent" strokeWidth={1.5} />} label="Restaurants" />
              <NearbyLink to="/shops" icon={<ShoppingBag className="w-4 h-4 text-accent" strokeWidth={1.5} />} label="Shopping" />
              <NearbyLink to="/weather" icon={<Waves className="w-4 h-4 text-accent" strokeWidth={1.5} />} label="Beaches" />
              <NearbyLink to="/ferry" icon={<Ship className="w-4 h-4 text-accent" strokeWidth={1.5} />} label="Ferry & Parking" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NearbyLink({ to, icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-2 py-2.5 px-3 rounded-xl bg-sand/30 hover:bg-sand/50 transition-colors">
      {icon}
      <span className="text-xs font-medium text-foreground">{label}</span>
    </Link>
  );
}