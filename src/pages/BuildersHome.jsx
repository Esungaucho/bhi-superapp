import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, ChevronLeft, Loader2, Hammer } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';
import BuilderCard from '@/components/marketplace/BuilderCard';
import CrossLinkSuggestions from '@/components/marketplace/CrossLinkSuggestions';
import { BUILDER_CATEGORIES } from '@/lib/marketplaceConstants';

export default function BuildersHome() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['builderHomeServices'],
    queryFn: () => base44.entities.BuilderHomeService.list('-priority_ranking', 200),
  });

  const approved = useMemo(() => businesses.filter(b => b.approval_status === 'approved'), [businesses]);

  const filtered = useMemo(() => {
    let result = approved;
    if (selectedCategory) {
      result = result.filter(b => b.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.name?.toLowerCase().includes(q) ||
        b.owner?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.service_area?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [approved, selectedCategory, search]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-40 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format"
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
          <p className="text-[10px] tracking-luxe uppercase text-white/70 font-medium">BHI · Southport · Wilmington</p>
          <h1 className="font-heading text-2xl text-white mt-1">Builders & Home</h1>
        </div>
      </div>

      <div className="px-4 py-4 pb-8">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : (
          <>
            {/* Category grid */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {BUILDER_CATEGORIES.map(({ id, label, Icon }) => {
                const isActive = selectedCategory === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedCategory(isActive ? null : id)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border transition-all ${
                      isActive
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-card text-muted-foreground hover:border-accent/40'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                    <span className="text-[9px] font-medium text-center leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" strokeWidth={1.5} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search builders & services..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-accent"
              />
            </div>

            {/* Results */}
            {selectedCategory && (
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground">
                  {BUILDER_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                </p>
                <button onClick={() => setSelectedCategory(null)} className="text-[11px] text-accent font-medium">
                  Clear filter
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {filtered.map(b => <BuilderCard key={b.id} business={b} />)}
            </div>
            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Hammer className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1} />
                <p className="text-sm">No businesses found</p>
              </div>
            )}

            <CrossLinkSuggestions context="builder" title="Connected Services" />
          </>
        )}
      </div>
    </div>
  );
}