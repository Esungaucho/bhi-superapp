import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldCheck, Star, MapPin } from 'lucide-react';
import ProviderCard from '@/components/concierge/ProviderCard';

export default function ConciergeProviders() {
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['conciergeProvidersAll'],
    queryFn: () => base44.entities.ConciergeProvider.filter({ approval_status: 'approved' }),
  });

  const available = providers.filter(p => p.is_available);
  const unavailable = providers.filter(p => !p.is_available);

  return (
    <div className="animate-fade-in pb-8">
      <header className="px-4 py-4 border-b border-border/30">
        <h1 className="font-heading text-xl text-foreground">Island Concierges</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Vetted professionals dedicated to your stay.</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="bg-ocean/5 rounded-2xl p-3 border border-ocean/10 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-ocean flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Every Island Concierge is background-checked and rated by the BHI community. You'll be matched with the best available concierge for your request.
            </p>
          </div>

          {available.length > 0 && (
            <div>
              <h2 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Available Now</h2>
              <div className="space-y-2">
                {available.map(p => <ProviderCard key={p.id} provider={p} />)}
              </div>
            </div>
          )}

          {unavailable.length > 0 && (
            <div>
              <h2 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Currently Unavailable</h2>
              <div className="space-y-2">
                {unavailable.map(p => <ProviderCard key={p.id} provider={p} />)}
              </div>
            </div>
          )}

          {providers.length === 0 && (
            <div className="text-center py-12">
              <ShieldCheck className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">No concierges available yet.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Check back soon.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}