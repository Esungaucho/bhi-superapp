import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/admin/StatCard';

const TIER_META = {
  basic: { label: 'Basic', color: 'border-slate-300 bg-slate-50 text-slate-700', badge: 'bg-slate-100 text-slate-600', price: '$99/mo', commission: '8%' },
  premium: { label: 'Premium', color: 'border-amber-300 bg-amber-50 text-amber-800', badge: 'bg-amber-100 text-amber-700', price: '$500–$1,500/mo', commission: '6%' },
  conglomerate: { label: 'Conglomerate', color: 'border-purple-300 bg-purple-50 text-purple-800', badge: 'bg-purple-100 text-purple-700', price: '$3,500/mo', commission: '4%' },
};

const STATUS_COLORS = {
  active: 'text-emerald-600 bg-emerald-50',
  inactive: 'text-muted-foreground bg-muted',
  trial: 'text-blue-600 bg-blue-50',
};

const TABS = ['all', 'basic', 'premium', 'conglomerate'];

export default function PartnerManagement() {
  const [tierFilter, setTierFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: shops = [], isLoading: loadingShops } = useQuery({
    queryKey: ['allShops'],
    queryFn: () => base44.entities.Shop.list(),
  });

  const { data: subscriptions = [], isLoading: loadingSubs } = useQuery({
    queryKey: ['shopSubscriptions'],
    queryFn: () => base44.entities.ShopSubscription.list(),
  });

  const updateShopMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Shop.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allShops'] }),
  });

  const isLoading = loadingShops || loadingSubs;

  const filtered = shops.filter(s => tierFilter === 'all' || s.subscription_tier === tierFilter);

  const counts = {
    all: shops.length,
    basic: shops.filter(s => s.subscription_tier === 'basic').length,
    premium: shops.filter(s => s.subscription_tier === 'premium').length,
    conglomerate: shops.filter(s => s.subscription_tier === 'conglomerate').length,
  };

  // MRR estimate
  const mrr = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.monthly_fee || 0), 0);

  const activePartners = shops.filter(s => s.subscription_status === 'active').length;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="px-4 pt-5 pb-6 space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Partners" value={shops.length} icon="🏪" color="bg-accent/10 text-accent" />
        <StatCard label="Active Partners" value={activePartners} icon="✅" color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Monthly MRR" value={`$${mrr.toLocaleString()}`} sub="From subscriptions" icon="💰" color="bg-purple-50 text-purple-600" />
        <StatCard label="Conglomerate" value={counts.conglomerate} sub="Alliance partners" icon="🤝" color="bg-amber-50 text-amber-600" />
      </div>

      {/* Tier filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {TABS.map(t => (
          <button key={t} onClick={() => setTierFilter(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              tierFilter === t ? 'bg-accent text-accent-foreground border-accent' : 'bg-card border-border text-muted-foreground'
            }`}>
            {t === 'all' ? `All (${counts.all})` : `${TIER_META[t]?.label} (${counts[t]})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No partners in this tier</p>}

      <div className="space-y-3">
        {filtered.map(shop => {
          const sub = subscriptions.find(s => s.shop_id === shop.id);
          const tier = TIER_META[shop.subscription_tier] || TIER_META.basic;
          return (
            <div key={shop.id} className={`border-2 rounded-xl p-4 space-y-3 ${tier.color}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{shop.name}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tier.badge}`}>{tier.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">{shop.category?.replace(/_/g, ' ')} · {tier.price}</p>
                  {shop.owner_email && <p className="text-[11px] text-muted-foreground mt-0.5">{shop.owner_email}</p>}
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[shop.subscription_status] || STATUS_COLORS.trial}`}>
                  {shop.subscription_status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/60 rounded-lg py-1.5">
                  <p className="text-xs font-bold">{shop.commission_rate ? `${(shop.commission_rate * 100).toFixed(0)}%` : tier.commission}</p>
                  <p className="text-[10px] text-muted-foreground">Commission</p>
                </div>
                <div className="bg-white/60 rounded-lg py-1.5">
                  <p className="text-xs font-bold">{shop.rating ? `⭐ ${shop.rating}` : '—'}</p>
                  <p className="text-[10px] text-muted-foreground">Rating</p>
                </div>
                <div className="bg-white/60 rounded-lg py-1.5">
                  <p className="text-xs font-bold">{sub ? `$${sub.monthly_fee}` : '—'}</p>
                  <p className="text-[10px] text-muted-foreground">MRR</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm"
                  onClick={() => updateShopMutation.mutate({ id: shop.id, data: { is_featured: !shop.is_featured } })}
                  className={`flex-1 rounded-lg text-xs ${shop.is_featured ? 'bg-amber-100 border-amber-300 text-amber-700' : ''}`}>
                  {shop.is_featured ? '⭐ Featured' : '☆ Set Featured'}
                </Button>
                <Button variant="outline" size="sm"
                  onClick={() => updateShopMutation.mutate({ id: shop.id, data: { subscription_status: shop.subscription_status === 'active' ? 'inactive' : 'active' } })}
                  className={`flex-1 rounded-lg text-xs ${shop.subscription_status === 'active' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                  {shop.subscription_status === 'active' ? <><XCircle className="w-3 h-3 mr-1" />Deactivate</> : <><CheckCircle2 className="w-3 h-3 mr-1" />Activate</>}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}