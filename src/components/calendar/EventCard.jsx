import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Bookmark, MapPin, Star, Clock, CalendarPlus } from 'lucide-react';
import { getCategory, getOrganization } from '@/lib/calendarConstants';

export default function EventCard({ event, isSaved, onToggleSave }) {
  const cat = getCategory(event.category);
  const startTime = new Date(event.start_time);
  const org = event.organization ? getOrganization(event.organization) : null;
  const heroImage = event.featured_image || event.image_url;

  const gcalUrl = () => {
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const start = fmt(startTime);
    const endDate = event.end_time ? new Date(event.end_time) : new Date(startTime.getTime() + 60 * 60 * 1000);
    const end = fmt(endDate);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title || '',
      dates: `${start}/${end}`,
      details: event.description || event.short_description || '',
      location: [event.location_name, event.address].filter(Boolean).join(', '),
    });
    return `https://www.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <div className="relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-luxe transition-all duration-300 animate-fade-up">
      <Link to={`/calendar/event/${event.id}`} className="block">
        {heroImage && (
          <div className="relative h-36 overflow-hidden">
            <img src={heroImage} alt="" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {event.featured && (
              <span className="absolute top-2.5 left-2.5 bg-amber-400 text-amber-900 rounded-full px-2 py-0.5 text-[9px] font-bold flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-current" /> Featured
              </span>
            )}
            {event.member_only && (
              <span className="absolute top-2.5 right-10 bg-foreground/80 text-background rounded-full px-2 py-0.5 text-[9px] font-semibold">
                Members
              </span>
            )}
          </div>
        )}
        <div className="p-3.5">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${cat.badge || 'bg-ocean/8 text-ocean'}`}>
              {cat.Icon && <cat.Icon className="w-3 h-3" strokeWidth={1.5} />}
              {cat.label}
            </span>
            {event.featured && !heroImage && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{event.title}</h3>
          {(event.short_description || event.description) && !heroImage && (
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{event.short_description || event.description}</p>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2">
            <span className="font-medium text-foreground">{format(startTime, 'EEE, MMM d')}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {event.all_day || event.is_all_day ? 'All day' : format(startTime, 'h:mm a')}
            </span>
          </div>
          {event.location_name && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{event.location_name}</span>
            </div>
          )}
          {org && org.label !== 'Unknown' && org.label !== 'Admin (Manual)' && (
            <p className="text-[10px] text-muted-foreground/60 mt-1.5">{org.label}</p>
          )}
        </div>
      </Link>
      <a
        href={gcalUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center gap-1.5 py-2 border-t border-border/50 text-[11px] font-medium text-muted-foreground hover:text-primary hover:bg-sand/30 transition-colors"
      >
        <CalendarPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
        Add to Google Calendar
      </a>
      {onToggleSave && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(event); }}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-colors ${isSaved ? 'bg-accent text-accent-foreground' : 'bg-white/80 text-foreground'}`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      )}
    </div>
  );
}