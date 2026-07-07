import React, { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';
import { EVENT_CATEGORIES, EVENT_ORGANIZATIONS } from '@/lib/calendarConstants';

export default function CalendarSearchFilter({ search, setSearch, filters, setFilters }) {
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && v !== 'all').length;

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search events by keyword..."
          className="w-full bg-card border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Quick category chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => updateFilter('category', 'all')}
          className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
            filters.category === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {EVENT_CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => updateFilter('category', filters.category === c.id ? 'all' : c.id)}
            className={`flex-shrink-0 flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              filters.category === c.id
                ? 'bg-primary text-primary-foreground'
                : `bg-card border border-border hover:border-transparent ${c.badge}`
            }`}
          >
            <c.Icon className="w-3 h-3" strokeWidth={1.5} />
            {c.label}
          </button>
        ))}
      </div>

      {/* Filter button */}
      <div className="relative">
        <button
          onClick={() => setFilterOpen(o => !o)}
          className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-sand/30"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full text-[10px] font-bold w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${filterOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
        </button>

        {filterOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-luxe-lg z-50 max-h-[60vh] overflow-y-auto no-scrollbar">
              {/* Category */}
              <FilterSection label="Category">
                <FilterOption label="All Categories" active={filters.category === 'all'} onClick={() => updateFilter('category', 'all')} />
                {EVENT_CATEGORIES.map(c => (
                  <FilterOption
                    key={c.id}
                    label={c.label}
                    icon={<c.Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />}
                    active={filters.category === c.id}
                    onClick={() => updateFilter('category', c.id)}
                  />
                ))}
              </FilterSection>

              {/* Organization */}
              <FilterSection label="Organization">
                <FilterOption label="All Organizations" active={filters.organization === 'all'} onClick={() => updateFilter('organization', 'all')} />
                {EVENT_ORGANIZATIONS.map(o => (
                  <FilterOption key={o.id} label={o.label} active={filters.organization === o.source} onClick={() => updateFilter('organization', o.source)} />
                ))}
              </FilterSection>

              {/* Toggles */}
              <FilterSection label="Show Only">
                <ToggleOption label="Member Only" checked={filters.memberOnly} onChange={() => updateFilter('memberOnly', !filters.memberOnly)} />
                <ToggleOption label="Family Friendly" checked={filters.familyFriendly} onChange={() => updateFilter('familyFriendly', !filters.familyFriendly)} />
                <ToggleOption label="Free Events" checked={filters.free} onChange={() => updateFilter('free', !filters.free)} />
                <ToggleOption label="Registration Required" checked={filters.registrationRequired} onChange={() => updateFilter('registrationRequired', !filters.registrationRequired)} />
              </FilterSection>

              {/* Reset */}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setFilters({ category: 'all', organization: 'all', memberOnly: false, familyFriendly: false, free: false, registrationRequired: false });
                    setFilterOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-destructive border-t border-border/50 hover:bg-destructive/5"
                >
                  <X className="w-3.5 h-3.5" /> Clear All Filters
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FilterSection({ label, children }) {
  return (
    <div className="px-4 py-3 border-b border-border/30 last:border-b-0">
      <p className="text-[10px] font-semibold uppercase tracking-luxe-sm text-muted-foreground mb-2">{label}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function FilterOption({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-xs transition-colors hover:bg-sand/40 ${active ? 'text-primary font-medium' : 'text-foreground'}`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      {active && <Check className="w-3.5 h-3.5" strokeWidth={1.5} />}
    </button>
  );
}

function ToggleOption({ label, checked, onChange }) {
  return (
    <button onClick={onChange} className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-xs hover:bg-sand/40">
      <span className="text-foreground">{label}</span>
      <span className={`w-9 h-5 rounded-full flex items-center transition-colors ${checked ? 'bg-primary' : 'bg-border'}`}>
        <span className={`w-4 h-4 bg-white rounded-full transition-transform mx-0.5 ${checked ? 'translate-x-4' : ''}`} />
      </span>
    </button>
  );
}