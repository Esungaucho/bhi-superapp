import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Search, BadgeCheck, Star, ChevronRight } from 'lucide-react';
import { VENDOR_CATEGORIES, PRICE_RANGE_LABELS } from '@/lib/eventConstants';
import GlobalMenu from '@/components/GlobalMenu';

export default function EventVendors() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['approvedEventVendors'],
    queryFn: () => base44.entities.EventVendor.filter({ approval_status: 'approved', is_verified: true }, '-is_featured', 100),
  });

  const filtered = useMemo(() => {
    return vendors.filter(v => {
      if (category !== 'all' && v.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return v.name?.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.specialties?.some(s => s.toLowerCase().includes(q));
      }
      return true;
    });
  }, [vendors, category, search]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <Link to="/events" className="p-1 -ml-1 rounded-full hover:bg-sand/60">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </Link>
        <h1 className="font-heading text-base text-foreground">Vendors & Services</h1>
        <GlobalMenu />
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vendors, services..."
            className="w-full bg-card border border-border/50 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 pb-3">
        <button
          onClick={() => setCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${category === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50 text-muted-foreground'}`}
        >
          All
        </button>
        {VENDOR_CATEGORIES.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setCategory(id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${category === id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50 text-muted-foreground'}`}
          >
            <Icon className="w-3 h-3" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Vendor grid */}
      <div className="px-4 pb-8">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No vendors found</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(vendor => {
              const catMeta = VENDOR_CATEGORIES.find(c => c.id === vendor.category);
              const CatIcon = catMeta?.Icon;
              return (
                <Link
                  key={vendor.id}
                  to={`/events/vendors/${vendor.id}`}
                  className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-accent/40 transition-colors group"
                >
                  {/* Photo */}
                  <div className="aspect-square relative bg-sand">
                    {vendor.photos?.[0] ? (
                      <img src={vendor.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {CatIcon && <CatIcon className="w-8 h-8 text-muted-foreground/30" strokeWidth={1} />}
                      </div>
                    )}
                    {vendor.is_featured && (
                      <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[9px] font-medium px-1.5 py-0.5 rounded-full">Featured</span>
                    )}
                    {vendor.is_verified && (
                      <span className="absolute top-2 right-2 bg-white/90 rounded-full p-0.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-foreground line-clamp-1">{vendor.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{catMeta?.label}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-muted-foreground">{PRICE_RANGE_LABELS[vendor.price_range] || 'Custom'}</span>
                      {vendor.rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-medium text-foreground">{vendor.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}