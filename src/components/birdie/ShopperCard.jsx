import React from 'react';
import { Star, MapPin, Car, ShieldCheck, Package } from 'lucide-react';
import { VEHICLE_TYPES, SHOPPER_STATUS } from '@/lib/birdieConstants';

export default function ShopperCard({ shopper, onAssign, showAssignButton }) {
  const vehicle = VEHICLE_TYPES.find(v => v.id === shopper.vehicle_type);
  const status = SHOPPER_STATUS[shopper.approval_status] || SHOPPER_STATUS.pending;

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-full bg-sand/40 overflow-hidden flex-shrink-0">
          {shopper.profile_photo_url ? (
            <img src={shopper.profile_photo_url} alt={shopper.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-heading text-muted-foreground">
              {shopper.name?.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-heading text-sm text-foreground truncate">{shopper.name}</h4>
            {shopper.background_check_status === 'passed' && (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" strokeWidth={1.5} />
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-medium text-foreground">{shopper.rating?.toFixed(1) || '5.0'}</span>
            <span className="text-[11px] text-muted-foreground">· {shopper.completed_deliveries || 0} deliveries</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
            <MapPin className="w-3 h-3" strokeWidth={1.5} />
            <span className="text-[11px] truncate">{shopper.current_location || 'Southport, NC'}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
          {shopper.is_available && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">Available</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center gap-1">
          <Car className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-[11px] text-muted-foreground">{vehicle?.label || shopper.vehicle_type}</span>
        </div>
        {shopper.specialties?.length > 0 && (
          <div className="flex items-center gap-1 overflow-hidden">
            <Package className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-[11px] text-muted-foreground truncate">{shopper.specialties.slice(0, 2).join(', ')}</span>
          </div>
        )}
      </div>

      {showAssignButton && shopper.approval_status === 'approved' && (
        <button
          onClick={() => onAssign(shopper)}
          className="w-full mt-3 h-9 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
        >
          Assign to This Shopper
        </button>
      )}
    </div>
  );
}