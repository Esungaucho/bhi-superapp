import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Sun, Home, Bike, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { trackActionAsync } from '@/lib/behaviorTracking';

const ITEMS = [
  { label: 'Island Map', Icon: Map, path: '/map', desc: 'Navigate every corner', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&auto=format' },
  { label: 'Weather', Icon: Sun, path: '/weather', desc: 'Conditions & forecast', img: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?q=80&w=600&auto=format' },
  { label: 'Lodging', Icon: Home, path: '/lodging', desc: 'Stays & vacation rentals', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format' },
  { label: 'Rentals', Icon: Bike, path: '/equipment', desc: 'Bikes, carts & gear', img: 'https://images.unsplash.com/photo-1526287765458-4b8d3a3a5c3f?q=80&w=600&auto=format' },
  { label: 'Food & Dining', Icon: UtensilsCrossed, path: '/food', desc: 'Restaurants & orders', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600&auto=format' },
  { label: 'Shops', Icon: ShoppingBag, path: '/shops', desc: 'Boutiques & essentials', img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=600&auto=format' },
];

export default function Discovery() {
  return (
    <div className="px-5 pt-5 pb-8 animate-fade-in">
      <header className="mb-7">
        <p className="text-[10px] font-body tracking-luxe uppercase text-muted-foreground/60 mb-2">Explore</p>
        <h1 className="font-heading text-[2rem] text-foreground leading-tight">Discovery</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-[18rem]">
          Everything the island has to offer, curated for your stay.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map(({ label, Icon, path, desc, img }) => (
          <Link
            key={path}
            to={path}
            onClick={() => trackActionAsync({ action_type: 'category_browse', action_label: label, target_path: path, session_context: 'discovery' })}
            className="group relative bg-card rounded-2xl overflow-hidden border border-border/20 shadow-luxe-sm hover:shadow-luxe transition-all duration-300 active:scale-[0.98]"
          >
            <div className="h-32 overflow-hidden">
              <img
                src={img}
                alt={label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-heading font-medium text-foreground leading-tight">{label}</h3>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{desc}</p>
            </div>
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
              <Icon className="w-4 h-4 text-charcoal" strokeWidth={1.5} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}