import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Loader2, Heart, Phone, Globe, Bell, BellOff, Calendar, Megaphone, Users, Star, Trash2, Anchor } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SavedCaptains() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: saved = [], isLoading } = useQuery({
    queryKey: ['savedCaptains'],
    queryFn: () => base44.entities.SavedCaptain.filter({ user_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const charterIds = saved.map(s => s.charter_id);

  const { data: charters = [] } = useQuery({
    queryKey: ['savedCharters', charterIds.join(',')],
    queryFn: async () => {
      if (charterIds.length === 0) return [];
      const results = [];
      for (const id of charterIds) {
        try { results.push(await base44.entities.FishingCharter.get(id)); } catch (e) {}
      }
      return results;
    },
    enabled: charterIds.length > 0,
  });

  const { data: allAvailability = [] } = useQuery({
    queryKey: ['savedCaptainsAvailability', charterIds.join(',')],
    queryFn: async () => {
      if (charterIds.length === 0) return [];
      const results = [];
      for (const id of charterIds) {
        try {
          const avail = await base44.entities.CaptainAvailability.filter({ charter_id: id }, 'trip_date', 5);
          results.push(...avail);
        } catch (e) {}
      }
      return results;
    },
    enabled: charterIds.length > 0,
  });

  const { data: allAnnouncements = [] } = useQuery({
    queryKey: ['savedCaptainsAnnouncements', charterIds.join(',')],
    queryFn: async () => {
      if (charterIds.length === 0) return [];
      const results = [];
      for (const id of charterIds) {
        try {
          const ann = await base44.entities.CaptainAnnouncement.filter({ charter_id: id, is_active: true }, '-created_date', 3);
          results.push(...ann);
        } catch (e) {}
      }
      return results;
    },
    enabled: charterIds.length > 0,
  });

  const toggleNotify = async (saved) => {
    await base44.entities.SavedCaptain.update(saved.id, { notify_new_dates: !saved.notify_new_dates });
    queryClient.invalidateQueries({ queryKey: ['savedCaptains'] });
    toast({ title: saved.notify_new_dates ? 'Notifications off' : 'Alerts on — you\'ll be notified of new dates!' });
  };

  const handleUnsave = async (id) => {
    await base44.entities.SavedCaptain.delete(id);
    queryClient.invalidateQueries({ queryKey: ['savedCaptains'] });
    toast({ title: 'Captain removed from saved' });
  };

  if (isLoading || !user) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }

  if (saved.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <Heart className="w-12 h-12 mx-auto mb-3 text-accent/40" />
        <h2 className="font-heading text-lg text-foreground">No Saved Captains</h2>
        <p className="text-sm text-muted-foreground mt-2">Browse Fishing & Boating to save your favorite captains.</p>
        <Link to="/map" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent mt-4">
          <Anchor className="w-4 h-4" /> Find Captains
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      <div>
        <h2 className="font-heading text-lg text-foreground">Saved Captains</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Quick rebook, new date alerts, and latest catches.</p>
      </div>

      {saved.map(s => {
        const charter = charters.find(c => c.id === s.charter_id);
        const availability = allAvailability.filter(a => a.charter_id === s.charter_id).slice(0, 3);
        const announcements = allAnnouncements.filter(a => a.charter_id === s.charter_id).slice(0, 2);

        return (
          <div key={s.id} className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Captain header */}
            <div className="p-4 bg-gradient-to-r from-sea-glass/10 to-transparent">
              <div className="flex items-start gap-3">
                {charter?.captain_photo_url ? (
                  <img src={charter.captain_photo_url} alt={s.captain_name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                    <Anchor className="w-5 h-5 text-accent" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-accent uppercase tracking-wide">Captain</p>
                  <h3 className="text-sm font-semibold text-foreground leading-tight">{s.captain_name}</h3>
                  <p className="text-xs text-muted-foreground">{s.charter_name}</p>
                  {charter?.rating && (
                    <span className="flex items-center gap-0.5 text-xs mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {charter.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick rebook */}
              <div className="flex gap-2 mt-3">
                {charter?.contact_phone && (
                  <a href={`tel:${charter.contact_phone}`} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-xl py-2">
                    <Phone className="w-3.5 h-3.5" /> Rebook
                  </a>
                )}
                {charter?.website && (
                  <a href={charter.website} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-border rounded-xl py-2">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
                <button onClick={() => toggleNotify(s)} className={`flex items-center justify-center gap-1 text-xs font-medium rounded-xl py-2 px-3 ${s.notify_new_dates ? 'bg-accent/10 text-accent border border-accent/30' : 'border border-border text-muted-foreground'}`}>
                  {s.notify_new_dates ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => handleUnsave(s.id)} className="flex items-center justify-center text-xs font-medium rounded-xl py-2 px-3 border border-border text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Upcoming availability */}
            {availability.length > 0 && (
              <div className="px-4 py-3 border-t border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-2">
                  <Calendar className="w-3 h-3" /> Upcoming Dates
                </p>
                <div className="space-y-1.5">
                  {availability.map(a => {
                    const spotsLeft = (a.max_passengers || 0) - (a.booked_passengers || 0);
                    return (
                      <div key={a.id} className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-medium text-foreground">{a.trip_label}</span>
                          <span className="text-muted-foreground ml-1.5">
                            {new Date(a.trip_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {a.status === 'last_minute' && <span className="text-[10px] text-amber-600 font-semibold">⚡ Last Min</span>}
                          {a.status === 'full' ? (
                            <span className="text-[10px] text-red-500 font-semibold">Full</span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{spotsLeft} left</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Announcements */}
            {announcements.length > 0 && (
              <div className="px-4 py-3 border-t border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-2">
                  <Megaphone className="w-3 h-3" /> Latest from Captain
                </p>
                <div className="space-y-1.5">
                  {announcements.map(a => (
                    <div key={a.id}>
                      <p className="text-xs font-semibold text-foreground">{a.title}</p>
                      {a.body && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{a.body}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}