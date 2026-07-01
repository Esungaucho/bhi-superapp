import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, Check, X, Phone, ChevronLeft, Truck, Camera, MessageCircle, Package, Clock } from 'lucide-react';
import { TRACKING_STAGES, getTrackingStage, getCategory, DELIVERY_OPTIONS, PROVIDER_STATUS } from '@/lib/conciergeConstants';

export default function ConciergeAdmin() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('requests');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [tramNumber, setTramNumber] = useState('');
  const [boxNumber, setBoxNumber] = useState('');
  const [uploadingType, setUploadingType] = useState('');

  const { data: requests = [], isLoading: loadingReq } = useQuery({
    queryKey: ['conciergeRequestsAll'],
    queryFn: () => base44.entities.ConciergeRequest.list('-created_date', 200),
  });

  const { data: providers = [], isLoading: loadingProv } = useQuery({
    queryKey: ['conciergeProvidersAdmin'],
    queryFn: () => base44.entities.ConciergeProvider.list('-created_date', 100),
  });

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (search && !r.item_requested?.toLowerCase().includes(search.toLowerCase()) && !r.user_name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [requests, search, statusFilter]);

  const stats = useMemo(() => ({
    total: requests.length,
    active: requests.filter(r => !['completed', 'cancelled'].includes(r.status)).length,
    pendingProviders: providers.filter(p => p.approval_status === 'pending').length,
    revenue: requests.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.total_cost || 0), 0),
  }), [requests, providers]);

  const approveProvider = async (p) => {
    await base44.entities.ConciergeProvider.update(p.id, { approval_status: 'approved' });
    queryClient.invalidateQueries(['conciergeProvidersAdmin']);
  };

  const suspendProvider = async (p) => {
    await base44.entities.ConciergeProvider.update(p.id, { approval_status: 'suspended' });
    queryClient.invalidateQueries(['conciergeProvidersAdmin']);
  };

  const advanceStatus = async (req) => {
    const stages = TRACKING_STAGES.map(s => s.id);
    const idx = stages.indexOf(req.status);
    if (idx >= stages.length - 1) return;
    const next = stages[idx + 1];
    await base44.entities.ConciergeRequest.update(req.id, { status: next });
    queryClient.invalidateQueries(['conciergeRequestsAll']);
    setSelectedRequest(null);
  };

  const handleUpload = async (file, type) => {
    setUploadingType(type);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.ConciergeRequest.update(selectedRequest.id, { [type]: file_url });
      queryClient.invalidateQueries(['conciergeRequestsAll']);
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
    queryClient.invalidateQueries(['conciergeRequestsAll']);
    setTramNumber('');
    setBoxNumber('');
    setSelectedRequest(null);
  };

  // Detail view
  if (selectedRequest) {
    const cat = getCategory(selectedRequest.category);
    const stage = getTrackingStage(selectedRequest.status);
    const currentIdx = TRACKING_STAGES.findIndex(s => s.id === selectedRequest.status);
    const canAdvance = currentIdx < TRACKING_STAGES.length - 1 && selectedRequest.status !== 'completed' && selectedRequest.status !== 'cancelled';

    return (
      <div className="animate-fade-in pb-8">
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/30 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSelectedRequest(null)} className="p-1 -ml-1">
            <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="font-heading text-base text-foreground">Request Details</h1>
        </header>

        <div className="p-4 space-y-4">
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <p className="text-sm font-medium text-foreground">{selectedRequest.item_requested}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{cat?.label} · #{selectedRequest.id?.slice(-8).toUpperCase()}</p>
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
            <p className="text-[11px] text-muted-foreground mt-2">Customer: {selectedRequest.user_name}</p>
            <p className="text-[11px] text-muted-foreground">Phone: {selectedRequest.user_phone}</p>
            {selectedRequest.island_address && <p className="text-[11px] text-muted-foreground">Address: {selectedRequest.island_address}</p>}
            {selectedRequest.notes && <p className="text-[11px] text-muted-foreground mt-2 italic">"{selectedRequest.notes}"</p>}
          </div>

          <div className="bg-ocean/5 rounded-2xl p-4 border border-ocean/10">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Status</p>
            <p className="text-sm font-heading text-foreground mt-0.5">{stage?.label}</p>
            {selectedRequest.provider_name && <p className="text-[11px] text-muted-foreground mt-1">Concierge: {selectedRequest.provider_name}</p>}
          </div>

          {/* Tram entry */}
          {selectedRequest.delivery_preference === 'tram_delivery' && !selectedRequest.tram_number && (
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-3">Tram Assignment</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input type="text" value={tramNumber} onChange={e => setTramNumber(e.target.value)} placeholder="Tram #" className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent" />
                <input type="text" value={boxNumber} onChange={e => setBoxNumber(e.target.value)} placeholder="Box #" className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent" />
              </div>
              <label className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border bg-background text-sm text-muted-foreground cursor-pointer hover:bg-sand/30 mb-2">
                {uploadingType === 'tram_photo_url' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Camera className="w-4 h-4" /> Photo Proof</>}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleUpload(e.target.files[0], 'tram_photo_url')} />
              </label>
              <button onClick={saveTram} disabled={!tramNumber.trim() || !boxNumber.trim()} className="w-full h-10 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40">
                Confirm Tram
              </button>
            </div>
          )}

          {selectedRequest.tram_number && (
            <div className="bg-accent/5 rounded-2xl p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-accent" strokeWidth={1.5} />
                <p className="text-sm font-medium text-foreground">Tram #{selectedRequest.tram_number} · Box #{selectedRequest.box_number}</p>
              </div>
              {selectedRequest.tram_photo_url && <img src={selectedRequest.tram_photo_url} alt="Tram" className="w-full h-32 rounded-xl object-cover mt-2" />}
            </div>
          )}

          {canAdvance && (
            <button onClick={() => advanceStatus(selectedRequest)} className="w-full h-11 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90">
              Advance Status →
            </button>
          )}

          <a href={`tel:${selectedRequest.user_phone}`} className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-sand/30">
            <MessageCircle className="w-4 h-4" /> Message Customer
          </a>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-card border border-border/50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-xl font-bold mt-0.5 ${color || 'text-foreground'}`}>{value}</p>
    </div>
  );

  return (
    <div className="p-4 pb-8">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-foreground">Concierge Admin</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage requests, providers, and deliveries</p>
      </header>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <StatCard icon={Package} label="Total" value={stats.total} />
        <StatCard icon={Clock} label="Active" value={stats.active} color="text-accent" />
        <StatCard icon={Check} label="Pending" value={stats.pendingProviders} color="text-amber-600" />
        <StatCard icon={Check} label="Revenue" value={`$${stats.revenue.toFixed(0)}`} color="text-emerald-600" />
      </div>

      <div className="flex gap-1 mb-4 bg-sand/30 rounded-xl p-1">
        {[
          { id: 'requests', label: 'Requests' },
          { id: 'providers', label: 'Concierges' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        <div>
          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests…" className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm focus:outline-none focus:border-accent" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:border-accent">
              <option value="">All Statuses</option>
              {TRACKING_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loadingReq ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div> :
           filteredRequests.length === 0 ? <p className="text-center text-sm text-muted-foreground py-8">No requests found.</p> :
           <div className="space-y-2">
             {filteredRequests.map(req => {
               const stage = getTrackingStage(req.status);
               return (
                 <button key={req.id} onClick={() => setSelectedRequest(req)} className="w-full text-left bg-card border border-border/50 rounded-xl p-3 hover:border-accent/30 transition-colors">
                   <p className="text-sm font-medium text-foreground truncate">{req.item_requested}</p>
                   <p className="text-[11px] text-muted-foreground">{req.user_name} · {stage?.label}</p>
                   {req.total_cost && <p className="text-xs font-bold text-foreground mt-1">${req.total_cost?.toFixed(2)}</p>}
                 </button>
               );
             })}
           </div>
          }
        </div>
      )}

      {tab === 'providers' && (
        loadingProv ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div> :
        <div className="space-y-2">
          {providers.map(p => {
            const status = PROVIDER_STATUS[p.approval_status] || PROVIDER_STATUS.pending;
            return (
              <div key={p.id} className="bg-card border border-border/50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-sand/40 overflow-hidden flex-shrink-0">
                      {p.profile_photo_url ? <img src={p.profile_photo_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm font-heading text-muted-foreground">{p.name?.charAt(0)}</div>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.completed_requests || 0} completed · {p.rating?.toFixed(1)} stars</p>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                </div>
                {p.approval_status === 'pending' && (
                  <div className="flex gap-1.5">
                    <button onClick={() => approveProvider(p)} className="flex-1 h-8 rounded-lg bg-emerald-600 text-white text-[11px] font-medium flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" /> Approve
                    </button>
                    <button onClick={() => suspendProvider(p)} className="flex-1 h-8 rounded-lg border border-border text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
                      <X className="w-3 h-3" /> Reject
                    </button>
                  </div>
                )}
                {p.approval_status === 'approved' && (
                  <button onClick={() => suspendProvider(p)} className="w-full h-8 rounded-lg border border-border text-[11px] text-muted-foreground hover:bg-red-50 hover:text-red-500">
                    Suspend
                  </button>
                )}
              </div>
            );
          })}
          {providers.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No concierges registered.</p>}
        </div>
      )}
    </div>
  );
}