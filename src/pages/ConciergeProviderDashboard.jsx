import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronLeft, Check, X, Camera, Truck, Package, Upload, MessageCircle, Clock } from 'lucide-react';
import { TRACKING_STAGES, getTrackingStage, getCategory, DELIVERY_OPTIONS } from '@/lib/conciergeConstants';

export default function ConciergeProviderDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('available');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['conciergeProvidersByEmail', user?.email],
    queryFn: () => base44.entities.ConciergeProvider.filter({ email: user.email }),
    enabled: !!user?.email,
  });

  const provider = providers[0];

  const { data: availableRequests = [], isLoading: loadingAvail } = useQuery({
    queryKey: ['conciergeRequestsAvailable'],
    queryFn: () => base44.entities.ConciergeRequest.filter({ status: 'request_submitted' }, '-created_date', 50),
  });

  const { data: myRequests = [], isLoading: loadingMine } = useQuery({
    queryKey: ['conciergeRequestsByProvider', provider?.id],
    queryFn: () => base44.entities.ConciergeRequest.filter({ provider_id: provider.id }, '-created_date', 50),
    enabled: !!provider?.id,
  });

  const myActive = myRequests.filter(r => !['completed', 'cancelled'].includes(r.status));
  const myCompleted = myRequests.filter(r => r.status === 'completed');

  // Detail view state
  const [tramNumber, setTramNumber] = useState('');
  const [boxNumber, setBoxNumber] = useState('');
  const [uploadingType, setUploadingType] = useState('');

  const acceptRequest = async (req) => {
    if (!provider) return;
    await base44.entities.ConciergeRequest.update(req.id, {
      provider_id: provider.id,
      provider_name: provider.name,
      status: 'concierge_assigned',
    });
    queryClient.invalidateQueries(['conciergeRequestsAvailable']);
    queryClient.invalidateQueries(['conciergeRequestsByProvider']);
    setSelectedRequest(null);
  };

  const advanceStatus = async (req) => {
    const stages = TRACKING_STAGES.map(s => s.id);
    const idx = stages.indexOf(req.status);
    if (idx >= stages.length - 1) return;
    const nextStage = stages[idx + 1];
    await base44.entities.ConciergeRequest.update(req.id, { status: nextStage });
    queryClient.invalidateQueries(['conciergeRequestsByProvider']);
    setSelectedRequest(null);
  };

  const handleUpload = async (file, type) => {
    setUploadingType(type);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.ConciergeRequest.update(selectedRequest.id, { [type]: file_url });
      queryClient.invalidateQueries(['conciergeRequestsByProvider']);
      setSelectedRequest(prev => ({ ...prev, [type]: file_url }));
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingType('');
    }
  };

  const saveTram = async () => {
    await base44.entities.ConciergeRequest.update(selectedRequest.id, {
      tram_number: tramNumber,
      box_number: boxNumber,
      tram_timestamp: new Date().toISOString(),
      status: 'placed_on_tram',
    });
    queryClient.invalidateQueries(['conciergeRequestsByProvider']);
    setTramNumber('');
    setBoxNumber('');
    setSelectedRequest(null);
  };

  if (!provider) {
    return (
      <div className="p-4 text-center py-16">
        <p className="text-sm text-muted-foreground">You are not registered as an Island Concierge.</p>
        <p className="text-xs text-muted-foreground mt-1">Contact an admin to get approved.</p>
      </div>
    );
  }

  // Detail view
  if (selectedRequest) {
    const cat = getCategory(selectedRequest.category);
    const stage = getTrackingStage(selectedRequest.status);
    const currentIdx = TRACKING_STAGES.findIndex(s => s.id === selectedRequest.status);
    const canAdvance = currentIdx < TRACKING_STAGES.length - 1 && selectedRequest.status !== 'completed';

    return (
      <div className="animate-fade-in pb-8">
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/30 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSelectedRequest(null)} className="p-1 -ml-1">
            <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </button>
          <div className="flex-1">
            <h1 className="font-heading text-base text-foreground">Request Details</h1>
            <p className="text-[10px] text-muted-foreground">#{selectedRequest.id?.slice(-8).toUpperCase()}</p>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Customer Request</h3>
            <p className="text-sm font-medium text-foreground">{selectedRequest.item_requested}</p>
            {cat && <p className="text-[11px] text-muted-foreground mt-0.5">{cat.label}</p>}
            {selectedRequest.store_preference && <p className="text-[11px] text-muted-foreground mt-1">Store: {selectedRequest.store_preference}</p>}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-[11px] text-muted-foreground capitalize">{selectedRequest.timing?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-[11px] text-muted-foreground">{DELIVERY_OPTIONS.find(o => o.id === selectedRequest.delivery_preference)?.label}</span>
              </div>
            </div>
            {selectedRequest.island_address && <p className="text-[11px] text-muted-foreground mt-2">Address: {selectedRequest.island_address}</p>}
            {selectedRequest.user_phone && <p className="text-[11px] text-muted-foreground mt-1">Phone: {selectedRequest.user_phone}</p>}
            {selectedRequest.notes && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
                <p className="text-[11px] text-foreground">{selectedRequest.notes}</p>
              </div>
            )}
            {selectedRequest.photo_url && (
              <img src={selectedRequest.photo_url} alt="Reference" className="w-full h-32 rounded-xl object-cover mt-3" />
            )}
          </div>

          {/* Status */}
          <div className="bg-ocean/5 rounded-2xl p-4 border border-ocean/10">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Current Status</p>
            <p className="text-sm font-heading text-foreground mt-0.5">{stage?.label}</p>
          </div>

          {/* Receipt upload */}
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-3">Receipt Photo</h3>
            {selectedRequest.receipt_photo_url ? (
              <img src={selectedRequest.receipt_photo_url} alt="Receipt" className="w-full h-40 rounded-xl object-cover" />
            ) : (
              <label className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border bg-background text-sm text-muted-foreground cursor-pointer hover:bg-sand/30">
                {uploadingType === 'receipt_photo_url' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Camera className="w-4 h-4" /> Upload Receipt</>}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleUpload(e.target.files[0], 'receipt_photo_url')} />
              </label>
            )}
          </div>

          {/* Tram entry */}
          {selectedRequest.delivery_preference === 'tram_delivery' && !selectedRequest.tram_number && (
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-3">Tram Assignment</h3>
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
                  value={boxNumber}
                  onChange={e => setBoxNumber(e.target.value)}
                  placeholder="Box #"
                  className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <label className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border bg-background text-sm text-muted-foreground cursor-pointer hover:bg-sand/30 mb-2">
                {uploadingType === 'tram_photo_url' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Camera className="w-4 h-4" /> Photo Proof</>}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleUpload(e.target.files[0], 'tram_photo_url')} />
              </label>
              <button
                onClick={saveTram}
                disabled={!tramNumber.trim() || !boxNumber.trim()}
                className="w-full h-10 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40"
              >
                Confirm Tram Assignment
              </button>
            </div>
          )}

          {/* Delivery photo */}
          {canAdvance && (
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-3">Delivery Photo</h3>
              {selectedRequest.delivery_photo_url ? (
                <img src={selectedRequest.delivery_photo_url} alt="Delivery" className="w-full h-40 rounded-xl object-cover" />
              ) : (
                <label className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border bg-background text-sm text-muted-foreground cursor-pointer hover:bg-sand/30">
                  {uploadingType === 'delivery_photo_url' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Camera className="w-4 h-4" /> Upload Photo</>}
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleUpload(e.target.files[0], 'delivery_photo_url')} />
                </label>
              )}
            </div>
          )}

          {/* Actions */}
          {canAdvance && (
            <button
              onClick={() => advanceStatus(selectedRequest)}
              className="w-full h-11 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90"
            >
              {selectedRequest.status === 'arrived_on_island' ? 'Mark as Completed' : 'Advance Status →'}
            </button>
          )}

          <a
            href={`tel:${selectedRequest.user_phone}`}
            className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-sand/30"
          >
            <MessageCircle className="w-4 h-4" /> Message Customer
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-8">
      <header className="px-4 py-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-sand/40 overflow-hidden flex-shrink-0">
            {provider.profile_photo_url ? (
              <img src={provider.profile_photo_url} alt={provider.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-heading text-muted-foreground">{provider.name?.charAt(0)}</div>
            )}
          </div>
          <div>
            <h1 className="font-heading text-lg text-foreground">{provider.name}</h1>
            <p className="text-[11px] text-muted-foreground">Island Concierge · {provider.completed_requests || 0} completed</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3">
        {[
          { id: 'available', label: 'Available', count: availableRequests.length },
          { id: 'active', label: 'My Active', count: myActive.length },
          { id: 'completed', label: 'Completed', count: myCompleted.length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 h-9 rounded-lg text-xs font-medium transition-colors ${
              activeTab === t.id ? 'bg-card text-foreground shadow-sm border border-border/50' : 'text-muted-foreground'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'available' && (
          loadingAvail ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div> :
          availableRequests.length === 0 ? <p className="text-center text-sm text-muted-foreground py-8">No available requests right now.</p> :
          <div className="space-y-2">
            {availableRequests.map(req => {
              const cat = getCategory(req.category);
              return (
                <button
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="w-full text-left bg-card border border-border/50 rounded-xl p-3 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{req.item_requested}</p>
                      <p className="text-[11px] text-muted-foreground">{cat?.label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                        <span className="text-[10px] text-muted-foreground capitalize">{req.timing?.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'active' && (
          loadingMine ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div> :
          myActive.length === 0 ? <p className="text-center text-sm text-muted-foreground py-8">No active requests.</p> :
          <div className="space-y-2">
            {myActive.map(req => {
              const cat = getCategory(req.category);
              const stage = getTrackingStage(req.status);
              return (
                <button
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="w-full text-left bg-card border border-border/50 rounded-xl p-3 hover:border-accent/30 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground truncate">{req.item_requested}</p>
                  <p className="text-[11px] text-accent">{stage?.label}</p>
                  <p className="text-[10px] text-muted-foreground">{cat?.label}</p>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'completed' && (
          myCompleted.length === 0 ? <p className="text-center text-sm text-muted-foreground py-8">No completed requests yet.</p> :
          <div className="space-y-2">
            {myCompleted.map(req => (
              <div key={req.id} className="bg-card border border-border/50 rounded-xl p-3 opacity-60">
                <p className="text-sm font-medium text-foreground truncate">{req.item_requested}</p>
                <p className="text-[10px] text-muted-foreground">Completed</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}