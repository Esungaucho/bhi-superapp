import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Bookmark, MapPin, Star } from 'lucide-react';
import { getCategory } from '@/lib/calendarConstants';

export default function EventCard({ event, isSaved, onToggleSave }) {
  const cat = getCategory(event.category);
  const startTime = new Date(event.start_time);

  return (
    <div className="relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/calendar/event/${event.id}`} className="block">
        {event.image_url && (
          <div className="relative h-32">
            <img src={event.image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="bg-accent/10 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-accent">
              {cat.emoji} {cat.label}
            </span>
            {event.is_featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-snug">{event.title}</h3>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1.5">
            <span className="font-medium text-foreground">{format(startTime, 'EEE, MMM d')}</span>
            <span>·</span>
            <span>{event.is_all_day ? 'All day' : format(startTime, 'h:mm a')}</span>
          </div>
          {event.location_name && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{event.location_name}</span>
            </div>
          )}
        </div>
      </Link>
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