import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Anchor, Calendar, Fish, Megaphone, Phone, Globe, Star } from 'lucide-react';
import AvailabilityManager from '@/components/captain/AvailabilityManager';
import CatchManager from '@/components/captain/CatchManager';
import AnnouncementManager from '@/components/captain/AnnouncementManager';

const TABS = [
  { id: 'availability', label: 'Availability', icon: Calendar },
  { id: 'catches', label: 'Catches', icon: Fish },
  { id: 'announcements', label: 'Posts', icon: Megaphone },
];

export default function CaptainDashboard() {
  const [tab, setTab] = useState('availability');

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: charters = [], isLoading } = useQuery({
    queryKey: ['myCharters', user?.email],
    queryFn: () => base44.entities.FishingCharter.filter({ owner_email: user.email }),
    enabled: !!user?.email,
  });

  if (isLoading || !user) {
    return (
      <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
    );
  }

  if (charters.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <Anchor className="w-12 h-12 mx-auto mb-3 text-accent/40" />
        <h2 className="font-heading text-lg text-foreground">No Charter Linked</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
          Your account isn't linked to a charter listing yet. Contact the island admin to have your charter assigned to your email.
        </p>
      </div>
    );
  }

  const charter = charters[0];

  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      {/* Charter profile header */}
      <div className="bg-gradient-to-br from-sea-glass/20 to-navy/10 rounded-2xl p-4 border border-accent/20">
        <div className="flex items-start gap-3">
          {charter.captain_photo_url ? (
            <img src={charter.captain_photo_url} alt={charter.captain_name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
              <Anchor className="w-6 h-6 text-accent" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {charter.captain_name && <p className="text-[10px] font-semibold text-accent uppercase tracking-wide">Captain</p>}
            <h2 className="font-heading text-lg text-foreground leading-tight">{charter.captain_name || charter.name}</h2>
            {charter.captain_name && <p className="text-xs text-muted-foreground">{charter.name}</p>}
            <div className="flex items-center gap-2 mt-1">
              {charter.rating && (
                <span className="flex items-center gap-0.5 text-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {charter.rating.toFixed(1)}
                </span>
              )}
              {charter.contact_phone && (
                <a href={`tel:${charter.contact_phone}`} className="text-xs text-accent flex items-center gap-0.5"><Phone className="w-3 h-3" /></a>
              )}
              {charter.website && (
                <a href={charter.website} target="_blank" rel="noopener noreferrer" className="text-xs text-accent flex items-center gap-0.5"><Globe className="w-3 h-3" /></a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/60 rounded-full p-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full transition-colors ${tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      {tab === 'availability' && <AvailabilityManager charter={charter} />}
      {tab === 'catches' && <CatchManager charter={charter} />}
      {tab === 'announcements' && <AnnouncementManager charter={charter} />}
    </div>
  );
}