import React from 'react';
import { Link } from 'react-router-dom';
import { CONCIERGE_CATEGORIES } from '@/lib/conciergeConstants';

export default function CategoryGrid() {
  return (
    <div className="px-4 space-y-3">
      {CONCIERGE_CATEGORIES.map(cat => (
        <Link
          key={cat.id}
          to={`/concierge/request?category=${cat.id}`}
          className={`block rounded-2xl border p-4 ${cat.color} hover:shadow-luxe-sm transition-all`}
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-card/80 flex items-center justify-center flex-shrink-0">
              <cat.Icon className={`w-5 h-5 ${cat.iconColor}`} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-sm text-foreground">{cat.label}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{cat.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}