import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { trackActionAsync } from '@/lib/behaviorTracking';

export default function SearchBar() {
  return (
    <section className="px-5 mt-6">
      <Link
        to="/search"
        onClick={() => trackActionAsync({ action_type: 'search', action_label: 'search_bar_tap', session_context: 'dashboard' })}
        className="flex items-center gap-3 bg-card border border-border/40 rounded-2xl px-5 py-4 shadow-luxe-sm hover:shadow-luxe hover:border-accent/30 transition-all duration-300"
      >
        <Search className="w-[18px] h-[18px] text-muted-foreground/60 flex-shrink-0" strokeWidth={1.5} />
        <span className="text-sm text-muted-foreground/50 font-body">Search restaurants, beaches, ferries, rentals…</span>
      </Link>
    </section>
  );
}