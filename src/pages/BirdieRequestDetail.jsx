import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Loader2, Store, Package, Clock, MapPin, Phone, TramFront, Camera, Upload, MessageCircle } from 'lucide-react';
import TrackingTimeline from '@/components/birdie/TrackingTimeline';
import PricingBreakdown from '@/components/birdie/PricingBreakdown';
import ShopperCard from '@/components/birdie/ShopperCard';
import { getTrackingStage, getCategory, DELIVERY_OPTIONS, TRACKING_STAGES } from '@/lib/birdieConstants';

export default function BirdieRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: request, isLoading } = useQuery({
    queryKey: ['birdieRequest', id],
    queryFn: () => base44.entities.BirdieRequest.get(id),
    enabled: !!id,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['birdieTracking', id],
    queryFn: () => base44.entities.BirdieTrackingEvent.filter({ request_id: id }),
    enabled: !!id,
  });

  const { data: shoppers = [] } = useQuery({
    queryKey: ['birdieShoppers'],
    queryFn: () => base44.entities.BirdieShopper.filter({ approval_status: 'approved', is_available: true }),
  });

  const { data: assignedShopper } = useQuery({
    queryKey: ['birdieShopper', request?.shopper_id],
    queryFn: () => base44.entities.BirdieShopper.get(request.shopper_id),
    enabled: !!request?.shopper_id,
  });

  const [showShopperPicker, setShowShopperPicker] = useState(false);
  const [tramNumber, setTramNumber] = useState('');
  const [tramCompartment, setTramCompartment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [updatingTram, setUpdatingTram] = useState(false);

  const pricing = request ? {
    merchandiseCost: request.merchandise_cost,
    shoppingFee: request.shopping_fee,
    mileageFee: request.mileage_fee,
    ferryFee: request.ferry_fee,
    serviceFee: request.service_fee,
    deliveryFee: request.delivery_fee,
    tip: request.tip,
    total: request.total_cost,
  } : null;

  const handleUploadTramPhoto = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.BirdieRequest.update(id, { tram_photo_url: file_url });
      queryClient.invalidateQueries(['birdieRequest', id]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveTram = async () => {
    setUpdatingTram(true);
    try {
      await base44.entities.BirdieRequest.update(id, {
        tram_number: tramNumber,
        tram_compartment: tramCompartment,
        tram_timestamp: new Date().toISOString(),
        status: 'placed_in_tram',
      });
      await base44.entities.BirdieTrackingEvent.create({
        request_id: id,
        stage: 'placed_in_tram',
        note: `Your order is on Tram #${tramNumber} in Compartment ${tramCompartment}.`,
        actor: 'shopper',
      });
      queryClient.invalidateQueries(['birdieRequest', id]);
      queryClient.invalidateQueries(['birdieTracking', id]);
      setTramNumber('');
      setTramCompartment('');
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setUpdatingTram(false);
    }
  };

  const assignShopper = async (shopper) => {
    await base44.entities.BirdieRequest.update(id, {
      shopper_id: shopper.id,
      shopper_name: shopper.name,
      status: 'shopper_assigned',
    });
    await base44.entities.BirdieTrackingEvent.create({
      request_id: id,
      stage: 'shopper_assigned',
      note: `${shopper.name} has been assigned as your personal shopper.`,
      actor: 'system',
    });
    queryClient.invalidateQueries(['birdieRequest', id]);
    queryClient.invalidateQueries(['birdieTracking', id]);
    setShowShopperPicker(false);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }

  if (!request) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">Request not found.</p>
        <Link to="/birdie" className="text-sm text-accent mt-2 inline-block">Back to Birdie</Link>
      </div>
    );
  }

  const stage = getTrackingStage(request.status);
  const cat = getCategory(request.category);

  return (
    <div className="animate-fade-in pb-8">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/birdie')} className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-base text-foreground">Order Tracking</h1>
          <p className="text-[10px] text-muted-foreground">#{request.id?.slice(-8).toUpperCase()}</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Status banner */}
        <div className="bg-ocean/5 rounded-2xl p-4 border border-ocean/10">
          <div className="flex items-center gap-2 mb-1">
            <stage.Icon className="w-5 h-5 text-ocean" strokeWidth={1.5} />
            <h2 className="font-heading text-base text-foreground">{stage.label}</h2>
          </div>
          <p className="text-[11px] text-muted-foreground">{stage.description}</p>
          {request.estimated_arrival && (
            <p className="text-[11px] text-accent font-medium mt-2">
              Est. arrival: {new Date(request.estimated_arrival).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Item details */}
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Request Details</h3>
          <p className="text-sm font-medium text-foreground">{request.item_description}</p>
          {request.brand_preference && <p className="text-[11px] text-muted-foreground mt-0.5">{request.brand_preference}</p>}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[11px] text-muted-foreground">Qty: {request.quantity || 1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[11px] text-muted-foreground">{request.selected_store || 'Any store'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[11px] text-muted-foreground">
                {DELIVERY_OPTIONS.find(o => o.id === request.delivery_option)?.label}
              </span>
            </div>
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
        </div>

        {/* Tracking Timeline */}
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-4">Tracking</h3>
          <TrackingTimeline currentStatus={request.status} events={events} />
        </div>

        {/* Shopper info */}
        {assignedShopper ? (
          <div>
            <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Your Shopper</h3>
            <ShopperCard shopper={assignedShopper} />
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Awaiting shopper assignment…</p>
            <p className="text-[11px] text-muted-foreground mt-1">We'll notify you the moment a shopper accepts.</p>
          </div>
        )}

        {/* Tram info */}
        {request.status === 'placed_in_tram' && request.tram_number && (
          <div className="bg-accent/5 rounded-2xl p-4 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <TramFront className="w-5 h-5 text-accent" strokeWidth={1.5} />
              <h3 className="font-heading text-sm text-foreground">On the Tram</h3>
            </div>
            <p className="text-sm text-foreground">
              Your order is on <strong>Tram #{request.tram_number}</strong> in <strong>Compartment {request.tram_compartment}</strong>.
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

        {/* Tram entry form (for shopper/admin when status is arrived_on_island) */}
        {(request.status === 'arrived_on_island' || request.status === 'loaded_on_ferry') && !request.tram_number && (
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-3">Assign to Tram</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input
                type="text"
                value={tramNumber}
                onChange={e => setTramNumber(e.target.value)}
                placeholder="Tram #"
                className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                value={tramCompartment}
                onChange={e => setTramCompartment(e.target.value)}
                placeholder="Compartment"
                className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <label className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border bg-background text-sm text-muted-foreground cursor-pointer hover:bg-sand/30 mb-2">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Camera className="w-4 h-4" /> Attach Photo</>}
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleUploadTramPhoto(e.target.files[0])} />
            </label>
            <button
              onClick={handleSaveTram}
              disabled={!tramNumber.trim() || !tramCompartment.trim() || updatingTram}
              className="w-full h-10 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40"
            >
              {updatingTram ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Tram Assignment'}
            </button>
          </div>
        )}

        {/* Pricing */}
        {pricing && <PricingBreakdown pricing={pricing} />}

        {/* Contact */}
        <Link
          to="/birdie"
          className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-sand/30 transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> Contact Support
        </Link>
      </div>

      {/* Shopper picker */}
      {showShopperPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4" onClick={() => setShowShopperPicker(false)}>
          <div className="bg-card rounded-2xl w-full max-w-md p-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-base mb-3">Select a Shopper</h3>
            <div className="space-y-2">
              {shoppers.map(s => (
                <ShopperCard key={s.id} shopper={s} showAssignButton onAssign={assignShopper} />
              ))}
              {shoppers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No shoppers available right now.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}