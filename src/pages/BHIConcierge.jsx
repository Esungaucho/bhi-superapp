import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Plus, ChevronRight, Package, Clock, MapPin, Loader2 } from 'lucide-react';
import CategoryGrid from '@/components/concierge/CategoryGrid';
import { getTrackingStage } from '@/lib/conciergeConstants';

const HERO = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format';

export default function BHIConcierge() {
  const [showActive, setShowActive] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['conciergeRequests', user?.email],
    queryFn: () => base44.entities.ConciergeRequest.filter({ user_email: user.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const activeRequests = requests.filter(r => !['completed', 'cancelled'].includes(r.status));

  return (
    <div className="animate-fade-in pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative h-[320px]">
          <img src={HERO} alt="Bald Head Island Concierge" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-medium tracking-luxe uppercase text-white/70">Island Concierge</span>
          </div>
          <h1 className="font-heading text-[1.75rem] leading-tight">Bald Head Island Concierge</h1>
          <p className="text-sm text-white/65 mt-1 font-display italic">Anything you need, without leaving the island.</p>
        </div>
      </section>

      {/* CTA */}
      <div className="px-4 -mt-6 relative z-10">
        <Link
          to="/concierge/request"
          className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-accent text-white text-sm font-medium shadow-luxe hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Submit a Request
        </Link>
      </div>

      {/* Active requests */}
      {activeRequests.length > 0 && (
        <section className="px-4 mt-6">
          <button onClick={() => setShowActive(!showActive)} className="flex items-center justify-between w-full mb-2">
            <h2 className="font-heading text-sm text-foreground">Active Requests</h2>
            <span className="text-[11px] text-muted-foreground">{activeRequests.length}</span>
          </button>
          {showActive && (
            <div className="space-y-2">
              {activeRequests.map(req => {
                const stage = getTrackingStage(req.status);
                const StageIcon = stage?.Icon || Package;
                return (
                  <Link
                    key={req.id}
                    to={`/concierge/track/${req.id}`}
                    className="flex items-center gap-3 bg-card border border-border/50 rounded-xl p-3 hover:border-accent/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-ocean/10 flex items-center justify-center flex-shrink-0">
                      <StageIcon className="w-4 h-4 text-ocean" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{req.item_requested}</p>
                      <p className="text-[10px] text-muted-foreground">{stage?.label}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Categories */}
      <section className="mt-6">
        <div className="px-4 mb-3">
          <h2 className="font-heading text-lg text-foreground">How Can We Help?</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Select a category to get started.</p>
        </div>
        <CategoryGrid />
      </section>

      {/* Trust */}
      <section className="px-4 mt-6">
        <div className="bg-ocean/5 rounded-2xl p-4 border border-ocean/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-ocean" strokeWidth={1.5} />
            <h3 className="text-sm font-medium text-foreground">Your Island Concierge</h3>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Every Island Concierge is vetted, background-checked, and dedicated to making your stay effortless. From forgotten sunscreen to a private chef, we handle it all with discretion and care.
          </p>
        </div>
      </section>
    </div>
  );
}