import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, ExternalLink, Star, Package } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'beach_gear', label: 'Beach Gear' },
  { value: 'baby_essentials', label: 'Baby Essentials' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'sunscreen_wellness', label: 'Sunscreen & Wellness' },
  { value: 'golf_cart_accessories', label: 'Golf Cart Accessories' },
  { value: 'rainy_day_activities', label: 'Rainy Day Activities' },
  { value: 'travel_essentials', label: 'Travel Essentials' },
  { value: 'home_essentials', label: 'Home Essentials' },
  { value: 'ferry_day_items', label: 'Ferry Day Items' },
];

export default function ShopBeforeArrive() {
  const [category, setCategory] = useState('all');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['affiliateProducts'],
    queryFn: () => base44.entities.AffiliateProduct.list('-created_date', 100),
  });

  const filtered = category === 'all' ? products : products.filter(p => p.category === category);
  const featured = filtered.filter(p => p.is_featured);

  return (
    <div className="px-4 pt-5 pb-8">
      <h1 className="font-heading text-xl text-foreground mb-1">Shop Before You Arrive</h1>
      <p className="text-xs text-muted-foreground mb-5">Curated essentials for your Bald Head Island trip</p>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex-shrink-0 text-xs font-medium rounded-full px-4 py-2 transition-colors ${
              category === cat.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">No products in this category yet.</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Check back soon for curated recommendations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-luxe-sm">
      {product.image ? (
        <img src={product.image} alt={product.name} className="w-full h-32 object-cover" />
      ) : (
        <div className="w-full h-32 bg-secondary flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-muted-foreground/30" strokeWidth={1} />
        </div>
      )}
      <div className="p-3">
        {product.is_featured && (
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" strokeWidth={1.5} />
            <span className="text-[9px] font-semibold text-amber-600 uppercase tracking-luxe-xs">Featured</span>
          </div>
        )}
        <p className="text-xs font-semibold text-foreground leading-tight mb-1 line-clamp-2">{product.name}</p>
        {product.description && (
          <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
        )}
        <a
          href={product.affiliate_link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center justify-center gap-1 bg-primary text-primary-foreground rounded-full py-2 text-[10px] font-semibold"
        >
          Shop Now <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
        </a>
      </div>
    </div>
  );
}