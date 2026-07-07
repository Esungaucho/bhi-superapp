import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SeasonalBanner from '@/components/calendar/SeasonalBanner';
import FerrySection from '@/components/calendar/FerrySection';
import CalendarSearchFilter from '@/components/calendar/CalendarSearchFilter';
import TodayView from '@/components/calendar/views/TodayView';
import WeekView from '@/components/calendar/views/WeekView';
import WeekendView from '@/components/calendar/views/WeekendView';
import MonthView from '@/components/calendar/views/MonthView';
import ListView from '@/components/calendar/views/ListView';
import UpcomingView from '@/components/calendar/views/UpcomingView';

const VIEWS = [
  { id: 'today', label: 'Today' },
  { id: 'weekend', label: 'Weekend' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'list', label: 'List' },
  { id: 'upcoming', label: 'Upcoming' },
];

const DEFAULT_FILTERS = {
  category: 'all',
  organization: 'all',
  memberOnly: false,
  familyFriendly: false,
  free: false,
  registrationRequired: false,
};

export default function IslandCalendar() {
  const [view, setView] = useState('today');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: events = [] } = useQuery({
    queryKey: ['islandEvents'],
    queryFn: () => base44.entities.IslandEvent.list('start_time', 200),
  });
  const { data: saved = [] } = useQuery({
    queryKey: ['savedEvents', user?.email],
    queryFn: () => base44.entities.SavedEvent.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const savedIds = saved.map(s => s.event_id);

  const filteredEvents = useMemo(() => {
    let result = events;

    if (filters.category !== 'all') {
      result = result.filter(e => e.category === filters.category);
    }
    if (filters.organization !== 'all') {
      result = result.filter(e => e.source === filters.organization);
    }
    if (filters.memberOnly) {
      result = result.filter(e => e.member_only);
    }
    if (filters.familyFriendly) {
      result = result.filter(e => e.category === 'family' || e.category === 'kids' || e.tags?.some(t => t.toLowerCase().includes('family')));
    }
    if (filters.free) {
      result = result.filter(e => {
        const price = (e.price_note || '').toLowerCase();
        return price.includes('free') || !e.price_note || e.price_note === '';
      });
    }
    if (filters.registrationRequired) {
      result = result.filter(e => e.registration_required);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.short_description?.toLowerCase().includes(q) ||
        e.tags?.some(t => t.toLowerCase().includes(q)) ||
        e.location_name?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [events, filters, search]);

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

      {/* Search & Filters */}
      <CalendarSearchFilter search={search} setSearch={setSearch} filters={filters} setFilters={setFilters} />

      {/* View tabs */}
      <div className="flex gap-1 bg-secondary/60 rounded-full p-1 overflow-x-auto no-scrollbar">
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`flex-1 min-w-[60px] text-xs font-medium py-2 rounded-full transition-colors whitespace-nowrap ${view === v.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'today' && <TodayView events={filteredEvents} savedIds={savedIds} onToggleSave={toggleSave} />}
      {view === 'weekend' && <WeekendView events={filteredEvents} savedIds={savedIds} onToggleSave={toggleSave} />}
      {view === 'week' && <WeekView events={filteredEvents} savedIds={savedIds} onToggleSave={toggleSave} />}
      {view === 'month' && <MonthView events={filteredEvents} savedIds={savedIds} onToggleSave={toggleSave} selectedDate={selectedDate} onSelectDate={setSelectedDate} />}
      {view === 'list' && <ListView events={filteredEvents} savedIds={savedIds} onToggleSave={toggleSave} />}
      {view === 'upcoming' && <UpcomingView events={filteredEvents} savedIds={savedIds} onToggleSave={toggleSave} />}

      {/* Ferry section */}
      <FerrySection />
    </div>
  );
}