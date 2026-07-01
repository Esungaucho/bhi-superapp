import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="px-4 -mt-6 relative z-10">
      <Link
        to="/search"
        className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl px-4 py-3.5 shadow-[0_8px_30px_-12px_rgba(31,45,61,0.25)] hover:shadow-[0_12px_36px_-12px_rgba(31,45,61,0.3)] transition-shadow"
      >
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
        <span className="text-sm text-muted-foreground font-body">Search the island…</span>
      </Link>
    </div>
  );
}