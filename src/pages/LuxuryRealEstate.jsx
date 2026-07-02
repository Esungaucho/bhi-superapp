import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Phone, Mail, Globe, Instagram, Calendar, MessageSquare, MapPin, Award, Star, ChevronLeft, Loader2, Home as HomeIcon } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';
import RealtorCard from '@/components/marketplace/RealtorCard';
import CrossLinkSuggestions from '@/components/marketplace/CrossLinkSuggestions';
import { LUXURY_LEVELS } from '@/lib/marketplaceConstants';

export default function LuxuryRealEstate() {
  const [search, setSearch] = useState('');

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['realEstateAgents'],
    queryFn: () => base44.entities.RealEstateAgent.list('-priority_ranking', 100),
  });

  const approved = useMemo(() => agents.filter(a => a.approval_status === 'approved' && a.is_active !== false), [agents]);
  const sponsored = useMemo(
    () => approved.filter(a => a.is_sponsored || a.sponsor_type === 'featured_realtor').sort((a, b) => (b.priority_ranking || 0) - (a.priority_ranking || 0)),
    [approved]
  );
  const featuredRealtor = sponsored[0];

  const directory = useMemo(() => {
    const rest = approved.filter(a => a !== featuredRealtor);
    if (!search.trim()) return rest;
    const q = search.toLowerCase();
    return rest.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.brokerage?.toLowerCase().includes(q) ||
      a.areas_served?.toLowerCase().includes(q) ||
      a.specialties?.some(s => s.toLowerCase().includes(q))
    );
  }, [approved, featuredRealtor, search]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-40 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background" />
        <div className="relative flex items-center justify-between px-4 pt-3">
          <a href="/concierge" className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white">
            <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </a>
          <GlobalMenu />
        </div>
        <div className="relative px-4 pt-2">
          <p className="text-[10px] tracking-luxe uppercase text-white/70 font-medium">Coastal North Carolina</p>
          <h1 className="font-heading text-2xl text-white mt-1">Luxury Real Estate</h1>
        </div>
      </div>

      <div className="px-4 py-4 pb-8">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : (
          <>
            {/* Featured Realtor */}
            {featuredRealtor && <FeaturedRealtor agent={featuredRealtor} />}

            {/* Search */}
            <div className="relative mt-6 mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" strokeWidth={1.5} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search agents, brokerages, areas..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-accent"
              />
            </div>

            {/* Directory */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground">
                {directory.length} Agent{directory.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {directory.map(agent => <RealtorCard key={agent.id} agent={agent} />)}
            </div>
            {directory.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <HomeIcon className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1} />
                <p className="text-sm">No agents found</p>
              </div>
            )}

            <CrossLinkSuggestions context="real_estate_listing" title="Connected Services" />
          </>
        )}
      </div>
    </div>
  );
}

function FeaturedRealtor({ agent }) {
  const luxury = LUXURY_LEVELS[agent.luxury_level] || LUXURY_LEVELS.luxury;

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-luxe animate-fade-in">
      {/* Sponsored banner */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 px-4 py-1.5 border-b border-amber-200/50">
        <p className="text-[10px] font-bold tracking-luxe-sm uppercase text-amber-700 flex items-center gap-1.5">
          <Star className="w-3 h-3" fill="currentColor" /> Featured Luxury Realtor
        </p>
      </div>

      {/* Large photo */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={agent.large_photo_url || agent.headshot_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format'}
          alt={agent.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="font-heading text-xl">{agent.name}</p>
          <p className="text-sm text-white/80">{agent.brokerage}</p>
          <div className="flex gap-1.5 mt-1.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${luxury.className}`}>{luxury.label}</span>
            {agent.concierge_recommendation && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <Award className="w-2.5 h-2.5" /> Concierge Pick
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {agent.years_experience != null && (
            <div className="text-center bg-sand/50 rounded-xl py-2.5">
              <p className="font-heading text-lg text-ocean">{agent.years_experience}</p>
              <p className="text-[10px] text-muted-foreground">Years Experience</p>
            </div>
          )}
          {agent.areas_served && (
            <div className="text-center bg-sand/50 rounded-xl py-2.5">
              <p className="text-xs font-semibold text-ocean truncate px-2">{agent.areas_served}</p>
              <p className="text-[10px] text-muted-foreground">Areas Served</p>
            </div>
          )}
        </div>

        {/* Bio */}
        {agent.bio && <p className="text-sm text-muted-foreground leading-relaxed">{agent.bio}</p>}

        {/* Why Work With Me */}
        {agent.why_work_with_me && (
          <div className="bg-accent/5 rounded-xl p-3 border border-accent/20">
            <p className="text-[10px] font-bold tracking-luxe-sm uppercase text-accent mb-1.5">Why Work With Me</p>
            <p className="text-xs text-foreground/80 leading-relaxed">{agent.why_work_with_me}</p>
          </div>
        )}

        {/* Current Listings & Recently Sold */}
        {(agent.current_listings || agent.recently_sold) && (
          <div className="space-y-2">
            {agent.current_listings && (
              <div className="flex items-start gap-2">
                <HomeIcon className="w-4 h-4 text-ocean mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Current Listings</p>
                  <p className="text-xs text-foreground/80">{agent.current_listings}</p>
                </div>
              </div>
            )}
            {agent.recently_sold && (
              <div className="flex items-start gap-2">
                <Star className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Recently Sold</p>
                  <p className="text-xs text-foreground/80">{agent.recently_sold}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Testimonials */}
        {agent.testimonials && agent.testimonials.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Testimonials</p>
            <div className="space-y-2">
              {agent.testimonials.slice(0, 2).map((t, i) => (
                <div key={i} className="bg-sand/40 rounded-xl p-3">
                  <p className="text-xs italic text-foreground/80 leading-relaxed">"{t.text}"</p>
                  <p className="text-[10px] font-medium text-muted-foreground mt-1">— {t.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          {agent.phone && (
            <a href={`tel:${agent.phone}`} className="flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
              <Phone className="w-4 h-4" strokeWidth={1.5} /> Call
            </a>
          )}
          {agent.email && (
            <a href={`mailto:${agent.email}`} className="flex items-center justify-center gap-2 h-10 rounded-xl bg-card border border-border text-xs font-medium hover:border-accent transition-colors">
              <Mail className="w-4 h-4 text-accent" strokeWidth={1.5} /> Email
            </a>
          )}
          <button className="flex items-center justify-center gap-2 h-10 rounded-xl bg-card border border-border text-xs font-medium hover:border-accent transition-colors">
            <Calendar className="w-4 h-4 text-accent" strokeWidth={1.5} /> Schedule Showing
          </button>
          <button className="flex items-center justify-center gap-2 h-10 rounded-xl bg-card border border-border text-xs font-medium hover:border-accent transition-colors">
            <MessageSquare className="w-4 h-4 text-accent" strokeWidth={1.5} /> Message
          </button>
          {agent.website && (
            <a href={agent.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 h-10 rounded-xl bg-card border border-border text-xs font-medium hover:border-accent transition-colors">
              <Globe className="w-4 h-4 text-accent" strokeWidth={1.5} /> Website
            </a>
          )}
          {agent.instagram && (
            <a href={agent.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 h-10 rounded-xl bg-card border border-border text-xs font-medium hover:border-accent transition-colors">
              <Instagram className="w-4 h-4 text-accent" strokeWidth={1.5} /> Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}