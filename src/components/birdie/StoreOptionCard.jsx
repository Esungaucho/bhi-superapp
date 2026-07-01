import React from 'react';
import { MapPin, Clock, DollarSign, Car, Ship, Package } from 'lucide-react';

export default function StoreOptionCard({ option, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border p-4 transition-all ${
        isSelected ? 'border-accent bg-accent/5 shadow-luxe-sm' : 'border-border bg-card hover:border-accent/30'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-heading text-sm text-foreground">{option.store_name}</h4>
          <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
            <MapPin className="w-3 h-3" strokeWidth={1.5} />
            <span className="text-[11px]">{option.address || 'Southport, NC area'}</span>
          </div>
        </div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-[11px] text-muted-foreground">{option.distance_miles} mi · {option.drive_time}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-[11px] text-muted-foreground">{option.hours || 'Hours unavailable'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-[11px] text-muted-foreground">{option.price_range}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Ship className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-[11px] text-muted-foreground">Ferry: {option.ferry_timing}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center gap-1">
          <Package className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
          <span className="text-[11px] text-muted-foreground">Shop fee: ${option.shopping_fee}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Est. Total</span>
          <p className="text-sm font-bold text-ocean">${option.estimated_total}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-2">
        <Clock className="w-3 h-3 text-accent" strokeWidth={1.5} />
        <span className="text-[11px] text-accent font-medium">Arrives by {option.estimated_arrival}</span>
      </div>
    </button>
  );
}