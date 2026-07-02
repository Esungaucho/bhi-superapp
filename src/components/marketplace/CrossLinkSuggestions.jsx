import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { CROSS_LINK_MAP } from '@/lib/marketplaceConstants';

export default function CrossLinkSuggestions({ context, title = 'You May Also Like' }) {
  const suggestions = CROSS_LINK_MAP[context];
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-3 px-1">{title}</p>
      <div className="grid grid-cols-2 gap-2.5">
        {suggestions.map(({ label, Icon, link }) => (
          <Link
            key={label}
            to={link}
            className="flex items-center gap-2.5 bg-card border border-border/50 rounded-xl p-3 hover:border-accent/40 hover:shadow-luxe-sm transition-all group"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/8 text-accent flex-shrink-0">
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </span>
            <span className="text-xs font-medium text-foreground flex-1">{label}</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-accent transition-colors" strokeWidth={1.5} />
          </Link>
        ))}
      </div>
    </div>
  );
}