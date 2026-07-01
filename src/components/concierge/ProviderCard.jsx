import React from 'react';
import { Star, MapPin, ShieldCheck, Check, X } from 'lucide-react';

export default function ProviderCard({ provider, showActions, onAccept, isAssigned }) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-full bg-sand/40 overflow-hidden flex-shrink-0">
          {provider.profile_photo_url ? (
            <img src={provider.profile_photo_url} alt={provider.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-heading text-muted-foreground">
              {provider.name?.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-heading text-sm text-foreground truncate">{provider.name}</h4>
            {provider.background_check_status === 'passed' && (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" strokeWidth={1.5} />
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-medium text-foreground">{provider.rating?.toFixed(1) || '5.0'}</span>
            <span className="text-[11px] text-muted-foreground">· {provider.completed_requests || 0} completed</span>
          </div>
          {provider.current_location && (
            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
              <MapPin className="w-3 h-3" strokeWidth={1.5} />
              <span className="text-[11px]">{provider.current_location}</span>
            </div>
          )}
          {provider.bio && <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{provider.bio}</p>}
        </div>
        {isAssigned && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Assigned</span>
        )}
      </div>

      {showActions && (
        <button
          onClick={() => onAccept(provider)}
          className="w-full mt-3 h-9 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
        >
          Accept Request
        </button>
      )}
    </div>
  );
}