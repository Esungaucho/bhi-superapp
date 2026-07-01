import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ShoppingBag, Info } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import { COLLECTIONS } from '@/lib/islandShopConstants';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format';

export default function IslandShop() {
  const [activeCollection, setActiveCollection] = useState('all');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['islandShopProducts'],
    queryFn: () => base44.entities.IslandShopProduct.list('-created_date', 200),
  });

  const filtered = useMemo(() => {
    if (activeCollection === 'all') return products;
    if (activeCollection === 'featured') return products.filter(p => p.is_featured);
    return products.filter(p => p.collection === activeCollection);
  }, [products, activeCollection]);

  const activeCollectionMeta = useMemo(() => {
    if (activeCollection === 'all' || activeCollection === 'featured') return null;
    return COLLECTIONS.find(c => c.id === activeCollection);
  }, [activeCollection]);

  return (
    <div className="animate-fade-in pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative h-[260px]">
          <img src={HERO_IMAGE} alt="Island Shop" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-medium tracking-luxe uppercase text-white/70">Curated Collections</span>
          </div>
          <h1 className="font-heading text-[2rem] leading-tight">Island Shop</h1>
          <p className="text-sm text-white/65 mt-1 max-w-[16rem]">
            Thoughtfully curated essentials for life on Bald Head Island.
          </p>
        </div>
      </section>

      {/* Affiliate Disclosure */}
      <div className="mx-4 mt-4 mb-5 flex items-start gap-2.5 rounded-xl border border-border/50 bg-sand/30 p-3">
        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Some links may be affiliate links, which means we may earn a small commission at no additional cost to you.
        </p>
      </div>

      {/* Collection Filter */}
      <div className="px-4 mb-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveCollection('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all border ${
              activeCollection === 'all'
                ? 'bg-ocean text-white border-ocean'
                : 'bg-card text-foreground border-border hover:border-ocean/30'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveCollection('featured')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all border ${
              activeCollection === 'featured'
                ? 'bg-ocean text-white border-ocean'
                : 'bg-card text-foreground border-border hover:border-ocean/30'
            }`}
          >
            Featured
          </button>
          {COLLECTIONS.map(col => (
            <button
              key={col.id}
              onClick={() => setActiveCollection(col.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all border whitespace-nowrap ${
                activeCollection === col.id
                  ? 'bg-ocean text-white border-ocean'
                  : 'bg-card text-foreground border-border hover:border-ocean/30'
              }`}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 px-4">
          <ShoppingBag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">No products in this collection yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Check back soon for new arrivals.</p>
        </div>
      ) : (
        <div className="px-4">
          {activeCollectionMeta && (
            <div className="mb-5">
              <h2 className="font-heading text-lg text-foreground">{activeCollectionMeta.label}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{activeCollectionMeta.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}