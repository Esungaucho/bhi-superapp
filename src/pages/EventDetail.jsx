import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Bookmark, Share2, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { getCategory, getSeason } from '@/lib/calendarConstants';

export default function EventDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [rsvp, setRsvp] = useState('going');

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
  const season = event?.is_seasonal ? getSeason(event.season_type) : null;

  const toggleSave = async () => {
    if (savedRecord) {
      await base44.entities.SavedEvent.delete(savedRecord.id);
    } else {
      await base44.entities.SavedEvent.create({ user_email: user.email, event_id: id, rsvp_status: rsvp, reminder_set: true });
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
      details: event.description || '', location: event.location_name || ''
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  if (!event) return <div className="text-center py-20 text-muted-foreground">Event not found</div>;

  return (
    <div className="pb-8">
      {event.image_url && (
        <div className="relative h-56">
          <img src={event.image_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-block bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-semibold text-foreground">
              {cat.emoji} {cat.label}
            </span>
          </div>
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {!event.image_url && (
          <span className="inline-block bg-accent/10 rounded-full px-3 py-1 text-[11px] font-semibold text-accent">
            {cat.emoji} {cat.label}
          </span>
        )}
        <h1 className="font-heading text-2xl text-foreground leading-tight">{event.title}</h1>

        {season && (
          <div className="bg-gradient-to-br from-sea-glass/15 to-navy/5 rounded-xl p-3 flex items-center gap-2 border border-accent/20">
            <span className="text-lg">{season.emoji}</span>
            <div>
              <p className="text-xs font-semibold text-foreground">{season.label}</p>
              {season.desc && <p className="text-[10px] text-muted-foreground">{season.desc}</p>}
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-foreground">
            <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
            <span>{format(new Date(event.start_time), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-foreground">
            <Clock className="w-4 h-4 text-accent flex-shrink-0" />
            <span>{event.is_all_day ? 'All day' : `${format(new Date(event.start_time), 'h:mm a')}${event.end_time ? ' – ' + format(new Date(event.end_time), 'h:mm a') : ''}`}</span>
          </div>
          {event.location_name && (
            <div className="flex items-center gap-2.5 text-sm text-foreground">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
              <span>{event.location_name}</span>
            </div>
          )}
          {event.source_name && (
            <div className="flex items-center gap-2.5 text-sm text-foreground">
              <Users className="w-4 h-4 text-accent flex-shrink-0" />
              <span>{event.source_name}</span>
            </div>
          )}
        </div>

        {event.description && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map(tag => (
              <span key={tag} className="text-[11px] text-accent bg-accent/10 rounded-full px-2.5 py-1">#{tag}</span>
            ))}
          </div>
        )}

        {event.price_note && (
          <div className="bg-accent/10 rounded-xl px-4 py-2.5">
            <p className="text-xs text-accent font-medium">{event.price_note}</p>
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <button
            onClick={toggleSave}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-colors ${savedRecord ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'}`}
          >
            <Bookmark className={`w-4 h-4 ${savedRecord ? 'fill-current' : ''}`} />
            {savedRecord ? 'Saved!' : 'Save Event'}
          </button>

          {savedRecord && (
            <div className="flex gap-2">
              {['going', 'interested', 'maybe'].map(status => (
                <button
                  key={status}
                  onClick={async () => {
                    setRsvp(status);
                    await base44.entities.SavedEvent.update(savedRecord.id, { rsvp_status: status });
                    queryClient.invalidateQueries({ queryKey: ['savedEvents', user?.email] });
                  }}
                  className={`flex-1 text-xs font-medium py-2 rounded-full capitalize transition-colors ${(savedRecord.rsvp_status || rsvp) === status ? 'bg-accent/20 text-accent' : 'bg-secondary text-muted-foreground'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <a href={getGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-medium bg-card border border-border text-foreground">
              <Calendar className="w-3.5 h-3.5" /> Add to Calendar
            </a>
            <button onClick={handleShare}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-medium bg-card border border-border text-foreground">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}