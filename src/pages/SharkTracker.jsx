import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ExternalLink, Fish, Plus, Loader2, Radio, Clock } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';
import DisclaimerBanner from '@/components/shark/DisclaimerBanner';
import SharkTrackerMap from '@/components/shark/SharkTrackerMap';
import SightingReportForm from '@/components/shark/SightingReportForm';
import SightingCard from '@/components/shark/SightingCard';
import { OCEARCH_URL, PROMINENT_EXPIRY_HOURS, isSightingActive } from '@/lib/sharkConstants';

export default function SharkTracker() {
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sightings = [], isLoading } = useQuery({
    queryKey: ['sharkSightings'],
    queryFn: () => base44.entities.SharkSighting.list('-sighting_date', 200),
  });

  const { data: ocearchData, isLoading: loadingOcearch } = useQuery({
    queryKey: ['ocearchCapeFear'],
    queryFn: async () => {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: "Search for recent OCEARCH tagged shark detections, pings, or activity near Cape Fear, North Carolina, Bald Head Island, or the Cape Fear River area in 2026. List any sharks detected with their species, name, date, and location. If no recent data is found, provide general information about shark species commonly tracked in this area.",
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            sharks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  species: { type: 'string' },
                  date: { type: 'string' },
                  location: { type: 'string' },
                  details: { type: 'string' }
                }
              }
            },
            summary: { type: 'string' }
          }
        }
      });
      return res;
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const { activeSightings, historicalSightings } = useMemo(() => {
    const active = [];
    const historical = [];
    sightings.forEach(s => {
      if (isSightingActive(s)) active.push(s);
      else historical.push(s);
    });
    return { activeSightings: active, historicalSightings: historical };
  }, [sightings]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/30 px-4 h-14 flex items-center gap-3">
        <Link to="/dashboard" className="p-1.5 -ml-1 rounded-full hover:bg-sand/50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </Link>
        <h1 className="font-heading text-base text-foreground flex-1">Shark Tracker</h1>
        <GlobalMenu />
      </header>

      <div className="pb-8">
        <DisclaimerBanner />

        <div className="px-4 mt-4">
          <div className="mb-2">
            <h2 className="font-heading text-lg text-foreground">Cape Fear Waters</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Tagged detections & reported sightings</p>
          </div>
          <SharkTrackerMap sightings={sightings} />
        </div>

        <div className="px-4 mt-4">
          <a
            href={OCEARCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-ocean text-white rounded-2xl py-3.5 font-medium text-sm tracking-luxe-sm hover:bg-ocean-deep transition-colors"
          >
            <Fish className="w-4 h-4" strokeWidth={1.5} />
            Open Live OCEARCH Tracker
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
          </a>
        </div>

        <div className="px-4 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-accent" strokeWidth={1.5} />
            <h2 className="font-heading text-lg text-foreground">Recent Tagged Shark Activity</h2>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-luxe-sm">
            {loadingOcearch ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-accent" strokeWidth={1.5} />
              </div>
            ) : ocearchData?.sharks?.length > 0 ? (
              <div className="space-y-3">
                {ocearchData.sharks.map((shark, i) => (
                  <div key={i} className="pb-3 border-b border-border/30 last:border-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{shark.name || 'Unknown'}</p>
                      {shark.date && <p className="text-[11px] text-muted-foreground flex-shrink-0">{shark.date}</p>}
                    </div>
                    {shark.species && <p className="text-[11px] text-accent mt-0.5">{shark.species}</p>}
                    {shark.location && <p className="text-[11px] text-muted-foreground mt-0.5">{shark.location}</p>}
                    {shark.details && <p className="text-xs text-foreground/70 mt-1 leading-relaxed">{shark.details}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {ocearchData?.summary || 'No recent tagged shark detections have been reported near Cape Fear. Visit the OCEARCH tracker for the latest global data.'}
              </p>
            )}
          </div>
        </div>

        <div className="px-4 mt-6">
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-card border border-border/50 rounded-2xl py-3.5 font-medium text-sm tracking-luxe-sm text-foreground hover:bg-sand/30 transition-colors shadow-luxe-sm"
          >
            <Plus className="w-4 h-4 text-accent" strokeWidth={1.5} />
            Report a Shark Sighting
          </button>
        </div>

        <div className="px-4 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
            <h2 className="font-heading text-lg text-foreground">Active Alerts</h2>
            <span className="text-[11px] text-muted-foreground">({activeSightings.length})</span>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-accent" strokeWidth={1.5} />
            </div>
          ) : activeSightings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No active sightings in the last {PROMINENT_EXPIRY_HOURS} hours.</p>
          ) : (
            <div className="space-y-3">
              {activeSightings.map(s => <SightingCard key={s.id} sighting={s} />)}
            </div>
          )}
        </div>

        {historicalSightings.length > 0 && (
          <div className="px-4 mt-6">
            <h2 className="font-heading text-lg text-foreground mb-3">Historical Records</h2>
            <div className="space-y-3">
              {historicalSightings.map(s => <SightingCard key={s.id} sighting={s} />)}
            </div>
          </div>
        )}
      </div>

      {showForm && <SightingReportForm onClose={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ['sharkSightings'] }); }} user={user} />}
    </div>
  );
}