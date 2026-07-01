import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Search, SlidersHorizontal, Baby, ShieldCheck, Heart, FileText, CalendarClock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SitterCard from '@/components/babysitting/SitterCard';
import LegalPages from '@/components/babysitting/LegalPages';
import { CERTIFICATIONS } from '@/lib/babysittingConstants';

export default function Babysitting() {
  const [tab, setTab] = useState('browse');
  const [search, setSearch] = useState('');
  const [filterIsland, setFilterIsland] = useState('all');
  const [filterCert, setFilterCert] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sitters = [], isLoading } = useQuery({
    queryKey: ['approvedBabysitters'],
    queryFn: () => base44.entities.Babysitter.filter({ approval_status: 'approved', is_active: true }),
  });

  const { data: saved = [] } = useQuery({
    queryKey: ['savedBabysitters', user?.email],
    queryFn: () => base44.entities.SavedBabysitter.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['myBabysitterBookings', user?.email],
    queryFn: () => base44.entities.BabysitterBooking.filter({ parent_email: user.email }),
    enabled: !!user?.email,
  });

  const savedIds = useMemo(() => new Set(saved.map((s) => s.sitter_id)), [saved]);

  const filtered = useMemo(() => {
    return sitters.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        if (!s.first_name?.toLowerCase().includes(q) && !s.bio?.toLowerCase().includes(q)) return false;
      }
      if (filterIsland === 'on_island' && !s.on_island) return false;
      if (filterIsland === 'off_island' && s.on_island) return false;
      if (filterCert && !s[filterCert]) return false;
      return true;
    });
  }, [sitters, search, filterIsland, filterCert]);

  const toggleSave = async (sitter) => {
    const existing = saved.find((s) => s.sitter_id === sitter.id);
    try {
      if (existing) {
        await base44.entities.SavedBabysitter.delete(existing.id);
      } else {
        await base44.entities.SavedBabysitter.create({
          user_email: user.email,
          sitter_id: sitter.id,
          sitter_name: `${sitter.first_name} ${sitter.last_initial}`,
          sitter_photo_url: sitter.profile_photo_url,
          sitter_hourly_rate: sitter.hourly_rate,
        });
      }
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const activeBookings = myBookings.filter((b) => !['completed', 'cancelled', 'declined'].includes(b.status));

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-navy/8 to-sea-glass/8 px-4 pt-6 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Baby className="w-5 h-5 text-navy" strokeWidth={1.5} />
          <span className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground">Bald Head Island Concierge</span>
        </div>
        <h1 className="font-heading text-2xl text-foreground mb-1">Babysitting & Family Care</h1>
        <p className="text-sm text-muted-foreground">Trusted, vetted island childcare for your family.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 border-b border-border/50">
        {[
          { key: 'browse', label: 'Browse', Icon: Search },
          { key: 'saved', label: 'Saved', Icon: Heart },
          { key: 'bookings', label: 'My Bookings', Icon: CalendarClock },
          { key: 'legal', label: 'Safety', Icon: ShieldCheck },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-sand/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Browse */}
      {tab === 'browse' && (
        <div className="px-4 pt-4">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or bio..."
              className="w-full bg-card border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
            Filters
            <ChevronRight className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-90' : ''}`} strokeWidth={1.5} />
          </button>

          {showFilters && (
            <div className="bg-card border border-border/50 rounded-xl p-4 mb-4 space-y-3 animate-fade-in">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Location</p>
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'on_island', label: 'On Island' },
                    { key: 'off_island', label: 'Off Island' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setFilterIsland(opt.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        filterIsland === opt.key ? 'bg-primary text-primary-foreground' : 'bg-sand text-muted-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATIONS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setFilterCert(filterCert === c.key ? null : c.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        filterCert === c.key ? 'bg-primary text-primary-foreground' : 'bg-sand text-muted-foreground'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">No sitters match your filters.</p>
          ) : (
            <div className="grid gap-3">
              {filtered.map((sitter) => (
                <SitterCard
                  key={sitter.id}
                  sitter={sitter}
                  isSaved={savedIds.has(sitter.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saved */}
      {tab === 'saved' && (
        <div className="px-4 pt-4">
          {saved.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">No saved sitters yet.</p>
          ) : (
            <div className="grid gap-3">
              {sitters.filter((s) => savedIds.has(s.id)).map((sitter) => (
                <SitterCard key={sitter.id} sitter={sitter} isSaved onToggleSave={toggleSave} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings */}
      {tab === 'bookings' && (
        <div className="px-4 pt-4">
          {activeBookings.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">No active bookings.</p>
          ) : (
            <div className="grid gap-3">
              {activeBookings.map((booking) => (
                <Link
                  key={booking.id}
                  to={`/babysitting/booking/${booking.id}`}
                  className="bg-card border border-border/50 rounded-xl p-4 hover:shadow-luxe transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {booking.sitter_photo_url ? (
                      <img src={booking.sitter_photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center">
                        <Baby className="w-5 h-5 text-navy" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{booking.sitter_name}</p>
                      <p className="text-xs text-muted-foreground">{booking.date} · {booking.start_time}–{booking.end_time}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legal */}
      {tab === 'legal' && <LegalPages />}
    </div>
  );
}