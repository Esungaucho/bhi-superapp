import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LodgingFilters({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
      <Select value={filters.source} onValueChange={v => set('source', v)}>
        <SelectTrigger className="h-8 text-xs rounded-full px-3 min-w-[110px] bg-card border">
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="vrbo">VRBO</SelectItem>
          <SelectItem value="airbnb">Airbnb</SelectItem>
          <SelectItem value="intracoastal">Intracoastal</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.bedrooms} onValueChange={v => set('bedrooms', v)}>
        <SelectTrigger className="h-8 text-xs rounded-full px-3 min-w-[100px] bg-card border">
          <SelectValue placeholder="Bedrooms" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Beds</SelectItem>
          <SelectItem value="1">1+ Bed</SelectItem>
          <SelectItem value="2">2+ Beds</SelectItem>
          <SelectItem value="3">3+ Beds</SelectItem>
          <SelectItem value="4">4+ Beds</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.maxPrice} onValueChange={v => set('maxPrice', v)}>
        <SelectTrigger className="h-8 text-xs rounded-full px-3 min-w-[110px] bg-card border">
          <SelectValue placeholder="Max Price" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Price</SelectItem>
          <SelectItem value="200">Up to $200</SelectItem>
          <SelectItem value="350">Up to $350</SelectItem>
          <SelectItem value="500">Up to $500</SelectItem>
          <SelectItem value="1000">Up to $1000</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.guests} onValueChange={v => set('guests', v)}>
        <SelectTrigger className="h-8 text-xs rounded-full px-3 min-w-[100px] bg-card border">
          <SelectValue placeholder="Guests" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Size</SelectItem>
          <SelectItem value="2">2+ Guests</SelectItem>
          <SelectItem value="4">4+ Guests</SelectItem>
          <SelectItem value="6">6+ Guests</SelectItem>
          <SelectItem value="8">8+ Guests</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}