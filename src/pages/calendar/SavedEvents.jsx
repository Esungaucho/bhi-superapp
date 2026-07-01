import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bookmark, Loader2 } from 'lucide-react';
import EventCard from '@/components/calendar/EventCard';

export default function SavedEvents() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: saved = [], isLoading } = useQuery({
    queryKey: ['savedEvents', user?.email],
    queryFn: () => base44.entities.SavedEvent.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const savedEventIds = saved.map(s => s.event_id);

  const { data: events = [] } = useQuery({
    queryKey: ['savedEventDetails', savedEventIds.join(',')],
    queryFn: async () => {
      const results = await Promise.all(savedEventIds.map(id => base44.entities.IslandEvent.get(id).catch(() => null)));
      return results.filter(Boolean).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    },
    enabled: savedEventIds.length > 0,
  });

  const toggleSave = async (event) => {
    const record = saved.find(s => s.event_id === event.id);
    if (record) {
      await base44.entities.SavedEvent.delete(record.id);
      queryClient.invalidateQueries({ queryKey: ['savedEvents', user?.email] });
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      <div className="flex items-center gap-2">
        <Bookmark className="w-5 h-5 text-accent" />
        <h2 className="font-heading text-xl text-foreground">Saved Events</h2>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">📌</p>
          <p className="font-medium text-foreground">No saved events yet</p>
          <p className="text-sm mt-1">Tap the bookmark on any event to save it here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <EventCard key={event.id} event={event} isSaved={true} onToggleSave={toggleSave} />
          ))}
        </div>
      )}
    </div>
  );
}