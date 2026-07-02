import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Loader2, Search, Home as HomeIcon } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';
import RentalPropertyCard from '@/components/rentals/RentalPropertyCard';
import { RENTAL_TYPES } from '@/lib/rentalPropertyConstants';

export default function RentalsHub() {
  const [selectedType, setSelectedType] = useState(null);
  const [search, setSearch] = useState('');

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['rentalProperties'],
    queryFn: () => base44.entities.RentalProperty.list('-is_featured', 200),
  });

  const approved = useMemo(
    () => properties.filter(p => p.approval_status === 'approved' && p.is_active !== false),
    [properties]
  );

  const filtered = useMemo(() => {
    let result = approved;
    if (selectedType) {
      result = result.filter(p => p.rental_type === selectedType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.property_name?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [approved, selectedType, search]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-44 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background" />
        <div className="relative flex items-center justify-between px-4 pt-3">
          <a href="/dashboard" className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white">
            <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </a>
          <GlobalMenu />
        </div>
        <div className="relative px-4 pt-2">
          <p className="text-[10px] tracking-luxe uppercase text-white/70 font-medium">Bald Head Island · Southport</p>
          <h1 className="font-heading text-2xl text-white mt-1">Rentals</h1>
          <p className="text-xs text-white/70 mt-1">Luxury vacation homes, waterfront retreats & event venues</p>
        </div>
      </div>

      <div className="px-4 py-4 pb-8">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : (
          <>
            {/* Category grid */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {RENTAL_TYPES.map(({ id, label, Icon }) => {
                const isActive = selectedType === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedType(isActive ? null : id)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border transition-all ${
                      isActive
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-card text-muted-foreground hover:border-accent/40'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                    <span className="text-[8px] font-medium text-center leading-tight">{label}</span>
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
                placeholder="Search properties, locations..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-accent"
              />
            </div>

            {/* Results header */}
            {selectedType && (
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground">
                  {RENTAL_TYPES.find(t => t.id === selectedType)?.label}
                </p>
                <button onClick={() => setSelectedType(null)} className="text-[11px] text-accent font-medium">Clear</button>
              </div>
            )}

            {/* Properties */}
            <div className="grid grid-cols-1 gap-3">
              {filtered.map(p => <RentalPropertyCard key={p.id} property={p} />)}
            </div>
            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <HomeIcon className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1} />
                <p className="text-sm">No rentals found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}