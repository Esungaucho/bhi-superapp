import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ShoppingBag, Users, Package, Search, ChevronRight, Check, X, Phone, Star } from 'lucide-react';
import ShopperCard from '@/components/birdie/ShopperCard';
import { TRACKING_STAGES, getTrackingStage, SHOPPER_STATUS } from '@/lib/birdieConstants';

export default function BirdieAdmin() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('orders');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: requests = [], isLoading: loadingReq } = useQuery({
    queryKey: ['birdieRequests'],
    queryFn: () => base44.entities.BirdieRequest.list('-created_date', 200),
  });

  const { data: shoppers = [], isLoading: loadingShop } = useQuery({
    queryKey: ['birdieShoppersAll'],
    queryFn: () => base44.entities.BirdieShopper.list('-created_date', 100),
  });

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (search && !r.item_description?.toLowerCase().includes(search.toLowerCase()) && !r.user_name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [requests, search, statusFilter]);

  const stats = useMemo(() => ({
    total: requests.length,
    active: requests.filter(r => !['delivered', 'cancelled'].includes(r.status)).length,
    pendingShoppers: shoppers.filter(s => s.approval_status === 'pending').length,
    revenue: requests.filter(r => r.status === 'delivered').reduce((sum, r) => sum + (r.total_cost || 0), 0),
  }), [requests, shoppers]);

  const approveShopper = async (shopper) => {
    await base44.entities.BirdieShopper.update(shopper.id, { approval_status: 'approved' });
    queryClient.invalidateQueries(['birdieShoppersAll']);
  };

  const suspendShopper = async (shopper) => {
    await base44.entities.BirdieShopper.update(shopper.id, { approval_status: 'suspended' });
    queryClient.invalidateQueries(['birdieShoppersAll']);
  };

  const advanceStatus = async (request) => {
    const stages = TRACKING_STAGES.map(s => s.id);
    const currentIdx = stages.indexOf(request.status);
    if (currentIdx >= stages.length - 1) return;
    const nextStage = stages[currentIdx + 1];
    await base44.entities.BirdieRequest.update(request.id, { status: nextStage });
    await base44.entities.BirdieTrackingEvent.create({
      request_id: request.id,
      stage: nextStage,
      note: getTrackingStage(nextStage).description,
      actor: 'admin',
    });
    queryClient.invalidateQueries(['birdieRequests']);
  };

  const cancelRequest = async (request) => {
    if (!confirm('Cancel this request?')) return;
    await base44.entities.BirdieRequest.update(request.id, { status: 'cancelled', admin_notes: 'Cancelled by admin' });
    queryClient.invalidateQueries(['birdieRequests']);
  };

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
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" /> Birdie Admin
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Manage orders, approve shoppers, track deliveries</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <StatCard icon={Package} label="Orders" value={stats.total} />
        <StatCard icon={ShoppingBag} label="Active" value={stats.active} color="text-accent" />
        <StatCard icon={Users} label="Pending" value={stats.pendingShoppers} color="text-amber-600" />
        <StatCard icon={Star} label="Revenue" value={`$${stats.revenue.toFixed(0)}`} color="text-emerald-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-sand/30 rounded-xl p-1">
        {[
          { id: 'orders', label: 'Orders' },
          { id: 'shoppers', label: 'Shoppers' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders tab */}
      {tab === 'orders' && (
        <div>
          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search orders…"
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:border-accent"
            >
              <option value="">All Statuses</option>
              {TRACKING_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loadingReq ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
          ) : filteredRequests.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No orders found.</p>
          ) : (
            <div className="space-y-2">
              {filteredRequests.map(req => {
                const stage = getTrackingStage(req.status);
                const StageIcon = stage?.Icon || Package;
                return (
                  <div key={req.id} className="bg-card border border-border/50 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{req.item_description}</p>
                        <p className="text-[11px] text-muted-foreground">{req.user_name} · #{req.id?.slice(-6).toUpperCase()}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <StageIcon className="w-3 h-3 text-accent" strokeWidth={1.5} />
                          <span className="text-[11px] text-accent font-medium">{stage?.label}</span>
                        </div>
                        {req.selected_store && <p className="text-[10px] text-muted-foreground mt-0.5">{req.selected_store}</p>}
                        {req.total_cost && <p className="text-xs font-bold text-foreground mt-1">${req.total_cost?.toFixed(2)}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-2 pt-2 border-t border-border/30">
                      {req.status !== 'delivered' && req.status !== 'cancelled' && (
                        <button
                          onClick={() => advanceStatus(req)}
                          className="flex-1 h-8 rounded-lg bg-accent text-white text-[11px] font-medium hover:bg-accent/90"
                        >
                          Advance →
                        </button>
                      )}
                      {req.shopper_phone && (
                        <a href={`tel:${req.shopper_phone}`} className="h-8 px-3 rounded-lg border border-border flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        </a>
                      )}
                      {req.status !== 'delivered' && req.status !== 'cancelled' && (
                        <button
                          onClick={() => cancelRequest(req)}
                          className="h-8 px-3 rounded-lg border border-red-200 text-[11px] text-red-500 font-medium hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Shoppers tab */}
      {tab === 'shoppers' && (
        <div>
          {loadingShop ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
          ) : (
            <div className="space-y-3">
              {shoppers.filter(s => s.approval_status === 'pending').length > 0 && (
                <div>
                  <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-amber-600 mb-2">Pending Approval</h3>
                  <div className="space-y-2">
                    {shoppers.filter(s => s.approval_status === 'pending').map(s => (
                      <div key={s.id} className="bg-card border border-amber-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Pending</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{s.vehicle_type} · {s.current_location || 'Southport, NC'}</p>
                        <div className="flex gap-1.5 mt-2">
                          <button onClick={() => approveShopper(s)} className="flex-1 h-8 rounded-lg bg-emerald-600 text-white text-[11px] font-medium flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button onClick={() => suspendShopper(s)} className="flex-1 h-8 rounded-lg border border-border text-[11px] font-medium text-muted-foreground flex items-center justify-center gap-1">
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">All Shoppers</h3>
                <div className="space-y-2">
                  {shoppers.map(s => (
                    <div key={s.id}>
                      <ShopperCard shopper={s} />
                      {s.approval_status === 'approved' && (
                        <button onClick={() => suspendShopper(s)} className="w-full mt-1 h-8 rounded-lg border border-border text-[11px] text-muted-foreground hover:bg-red-50 hover:text-red-500">
                          Suspend
                        </button>
                      )}
                    </div>
                  ))}
                  {shoppers.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No shoppers registered yet.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}