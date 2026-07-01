import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Loader2, MapPin, Phone, Store, Truck, MessageCircle, Clock } from 'lucide-react';
import ConciergeTimeline from '@/components/concierge/ConciergeTimeline';
import ConciergePricing from '@/components/concierge/ConciergePricing';
import { getCategory, getTrackingStage, DELIVERY_OPTIONS } from '@/lib/conciergeConstants';

export default function ConciergeTrack() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: request, isLoading } = useQuery({
    queryKey: ['conciergeRequest', id],
    queryFn: () => base44.entities.ConciergeRequest.get(id),
    enabled: !!id,
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['conciergeProviders'],
    queryFn: () => base44.entities.ConciergeProvider.filter({ approval_status: 'approved', is_available: true }),
  });

  const { data: assignedProvider } = useQuery({
    queryKey: ['conciergeProvider', request?.provider_id],
    queryFn: () => base44.entities.ConciergeProvider.get(request.provider_id),
    enabled: !!request?.provider_id,
  });

  const pricing = request ? {
    itemCost: request.item_cost,
    serviceFee: request.service_fee,
    mileageFee: request.mileage_fee,
    ferryFee: request.ferry_fee,
    appFee: request.app_fee,
    deliveryFee: DELIVERY_OPTIONS.find(o => o.id === request.delivery_preference)?.fee || 0,
    tip: request.tip,
    total: request.total_cost,
  } : null;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  if (!request) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">Request not found.</p>
        <Link to="/concierge" className="text-sm text-accent mt-2 inline-block">Back to Concierge</Link>
      </div>
    );
  }

  const cat = getCategory(request.category);
  const stage = getTrackingStage(request.status);
  const StageIcon = stage?.Icon || Clock;

  return (
    <div className="animate-fade-in pb-8">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/concierge')} className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-base text-foreground">Request Tracking</h1>
          <p className="text-[10px] text-muted-foreground">#{request.id?.slice(-8).toUpperCase()}</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Status banner */}
        <div className="bg-ocean/5 rounded-2xl p-4 border border-ocean/10">
          <div className="flex items-center gap-2 mb-1">
            <StageIcon className="w-5 h-5 text-ocean" strokeWidth={1.5} />
            <h2 className="font-heading text-base text-foreground">{stage?.label}</h2>
          </div>
          <p className="text-[11px] text-muted-foreground">{stage?.description}</p>
        </div>

        {/* Request details */}
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Request Details</h3>
          <p className="text-sm font-medium text-foreground">{request.item_requested}</p>
          {cat && <p className="text-[11px] text-muted-foreground mt-0.5">{cat.label}</p>}
          {request.store_preference && <p className="text-[11px] text-muted-foreground mt-1">Store: {request.store_preference}</p>}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[11px] text-muted-foreground capitalize">{request.timing?.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[11px] text-muted-foreground">{DELIVERY_OPTIONS.find(o => o.id === request.delivery_preference)?.label}</span>
            </div>
            {request.island_address && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-[11px] text-muted-foreground truncate">{request.island_address}</span>
              </div>
            )}
            {request.user_phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-[11px] text-muted-foreground">{request.user_phone}</span>
              </div>
            )}
          </div>
          {request.notes && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
              <p className="text-[11px] text-foreground">{request.notes}</p>
            </div>
          )}
          {request.photo_url && (
            <img src={request.photo_url} alt="Reference" className="w-full h-32 rounded-xl object-cover mt-3" />
          )}
        </div>

        {/* Timeline */}
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-4">Tracking</h3>
          <ConciergeTimeline currentStatus={request.status} />
        </div>

        {/* Tram details */}
        {request.tram_number && (
          <div className="bg-accent/5 rounded-2xl p-4 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-accent" strokeWidth={1.5} />
              <h3 className="font-heading text-sm text-foreground">On the Tram</h3>
            </div>
            <p className="text-sm text-foreground">
              Your package is on <strong>Tram #{request.tram_number}</strong>, <strong>Box #{request.box_number}</strong>.
            </p>
            {request.tram_timestamp && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Placed at {new Date(request.tram_timestamp).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            )}
            {request.tram_photo_url && (
              <img src={request.tram_photo_url} alt="Package on tram" className="w-full h-40 rounded-xl object-cover mt-3" />
            )}
          </div>
        )}

        {/* Provider info */}
        {assignedProvider && (
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Your Island Concierge</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-sand/40 overflow-hidden flex-shrink-0">
                {assignedProvider.profile_photo_url ? (
                  <img src={assignedProvider.profile_photo_url} alt={assignedProvider.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-heading text-muted-foreground">{assignedProvider.name?.charAt(0)}</div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{assignedProvider.name}</p>
                <p className="text-[11px] text-muted-foreground">{assignedProvider.completed_requests || 0} completed · {assignedProvider.rating?.toFixed(1)} stars</p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing */}
        {pricing && <ConciergePricing pricing={pricing} />}

        <Link
          to="/concierge"
          className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-sand/30 transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> Contact Concierge Support
        </Link>
      </div>
    </div>
  );
}