import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { EVENT_CATEGORIES } from '@/lib/calendarConstants';
import SeasonalBanner from '@/components/calendar/SeasonalBanner';
import FerrySection from '@/components/calendar/FerrySection';
import TodayView from '@/components/calendar/views/TodayView';
import WeekView from '@/components/calendar/views/WeekView';
import MonthView from '@/components/calendar/views/MonthView';
import ListView from '@/components/calendar/views/ListView';

const VIEWS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'list', label: 'List' },
];

export default function IslandCalendar() {
  const [view, setView] = useState('today');
  const [activeCat, setActiveCat] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: events = [] } = useQuery({
    queryKey: ['islandEvents'],
    queryFn: () => base44.entities.IslandEvent.filter({ status: 'approved' }, 'start_time', 100),
  });
  const { data: saved = [] } = useQuery({
    queryKey: ['savedEvents', user?.email],
    queryFn: () => base44.entities.SavedEvent.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const savedIds = saved.map(s => s.event_id);
  const filteredEvents = activeCat === 'all' ? events : events.filter(e => e.category === activeCat);

  const toggleSave = async (event) => {
    const existing = saved.find(s => s.event_id === event.id);
    if (existing) {
      await base44.entities.SavedEvent.delete(existing.id);
    } else {
      await base44.entities.SavedEvent.create({ user_email: user.email, event_id: event.id, rsvp_status: 'going' });
      await base44.entities.IslandEvent.update(event.id, { saved_count: (event.saved_count || 0) + 1 });
    }
    queryClient.invalidateQueries({ queryKey: ['savedEvents', user?.email] });
  };

  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      <SeasonalBanner />

      {/* View tabs */}
      <div className="flex gap-1.5 bg-secondary/60 rounded-full p-1">
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`flex-1 text-xs font-medium py-2 rounded-full transition-colors ${view === v.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4">
        <button
          onClick={() => setActiveCat('all')}
          className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${activeCat === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}
        >
          All
        </button>
        {EVENT_CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${activeCat === c.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'today' && <TodayView events={filteredEvents} savedIds={savedIds} onToggleSave={toggleSave} />}
      {view === 'week' && <WeekView events={filteredEvents} savedIds={savedIds} onToggleSave={toggleSave} />}
      {view === 'month' && <MonthView events={filteredEvents} savedIds={savedIds} onToggleSave={toggleSave} selectedDate={selectedDate} onSelectDate={setSelectedDate} />}
      {view === 'list' && <ListView events={filteredEvents} savedIds={savedIds} onToggleSave={toggleSave} />}

      {/* Ferry section */}
      <FerrySection />
    </div>
  );
}