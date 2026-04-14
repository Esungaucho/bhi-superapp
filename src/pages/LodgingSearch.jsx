import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import LodgingCard from '@/components/lodging/LodgingCard';
import LodgingFilters from '@/components/lodging/LodgingFilters';

export default function LodgingSearch() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ source: 'all', bedrooms: 'any', maxPrice: 'any', guests: 'any' });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['lodgings'],
    queryFn: () => base44.entities.Lodging.list('-is_featured', 100),
  });

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (search && !l.title.toLowerCase().includes(search.toLowerCase()) &&
          !(l.neighborhood || '').toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.source !== 'all' && l.source !== filters.source) return false;
      if (filters.bedrooms !== 'any' && l.bedrooms < parseInt(filters.bedrooms)) return false;
      if (filters.maxPrice !== 'any' && l.price_per_night > parseInt(filters.maxPrice)) return false;
      if (filters.guests !== 'any' && l.max_guests < parseInt(filters.guests)) return false;
      return true;
    });
  }, [listings, search, filters]);

  const featured = filtered.filter(l => l.is_featured);
  const regular = filtered.filter(l => !l.is_featured);

  return (
    <div>
      {/* Hero search bar */}
      <div className="bg-primary px-4 pt-4 pb-5">
        <h2 className="text-primary-foreground font-bold text-lg mb-3">🏡 Find Your Stay</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or neighborhood…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl bg-white/95 border-0"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="pt-3 pb-1">
        <LodgingFilters filters={filters} onChange={setFilters} />
      </div>

      <div className="px-4 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground">
            <p className="text-4xl mb-2">🏡</p>
            <p className="font-medium">No listings found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Featured</p>
                <div className="space-y-4">
                  {featured.map(l => <LodgingCard key={l.id} listing={l} />)}
                </div>
              </div>
            )}
            <div>
              {featured.length > 0 && regular.length > 0 && (
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">All Listings</p>
              )}
              <div className="space-y-4">
                {regular.map(l => <LodgingCard key={l.id} listing={l} />)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-6">{filtered.length} listing{filtered.length !== 1 ? 's' : ''} found</p>
          </>
        )}
      </div>
    </div>
  );
}