import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatCard from '@/components/admin/StatCard';

const STATUS_COLORS = {
  active: 'text-emerald-600 bg-emerald-50',
  paused: 'text-amber-600 bg-amber-50',
  completed: 'text-muted-foreground bg-muted',
  draft: 'text-blue-600 bg-blue-50',
};

const TYPE_LABELS = {
  banner: 'Banner',
  carousel: 'Carousel',
  contextual: 'Contextual',
  sponsored_listing: 'Sponsored',
};

export default function AdCampaigns() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', advertiser: '', budget: '', cpm_rate: 5, type: 'banner', placement: 'deals_carousel', status: 'draft', start_date: '', end_date: '' });
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['adCampaigns'],
    queryFn: () => base44.entities.AdCampaign.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.AdCampaign.create({ ...form, budget: parseFloat(form.budget) || 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adCampaigns'] }); setShowForm(false); setForm({ name: '', advertiser: '', budget: '', cpm_rate: 5, type: 'banner', placement: 'deals_carousel', status: 'draft', start_date: '', end_date: '' }); },
  });

  const toggleMutation = useMutation({
    mutationFn: (c) => base44.entities.AdCampaign.update(c.id, { status: c.status === 'active' ? 'paused' : 'active' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adCampaigns'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AdCampaign.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adCampaigns'] }),
  });

  const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);
  const totalSpent = campaigns.reduce((s, c) => s + (c.spent || 0), 0);
  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const active = campaigns.filter(c => c.status === 'active').length;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="px-4 pt-5 pb-6 space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Active Campaigns" value={active} icon="📢" color="bg-accent/10 text-accent" />
        <StatCard label="Total Budget" value={`$${totalBudget.toLocaleString()}`} icon="💵" color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Total Spent" value={`$${totalSpent.toFixed(2)}`} sub={`${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}% used`} icon="💸" color="bg-red-50 text-red-500" />
        <StatCard label="Impressions" value={totalImpressions.toLocaleString()} icon="👁️" color="bg-purple-50 text-purple-600" />
      </div>

      <Button onClick={() => setShowForm(!showForm)} className="w-full gap-2 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground">
        <Plus className="w-4 h-4" /> New Campaign
      </Button>

      {showForm && (
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <p className="text-sm font-bold">New Campaign</p>
          <Input placeholder="Campaign name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-10 rounded-lg" />
          <Input placeholder="Advertiser / brand" value={form.advertiser} onChange={e => setForm(f => ({ ...f, advertiser: e.target.value }))} className="h-10 rounded-lg" />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Budget ($)" type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="h-10 rounded-lg" />
            <Input placeholder="CPM rate ($)" type="number" value={form.cpm_rate} onChange={e => setForm(f => ({ ...f, cpm_rate: parseFloat(e.target.value) }))} className="h-10 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="h-10 rounded-lg border px-3 text-sm bg-background">
              {['banner', 'carousel', 'contextual', 'sponsored_listing'].map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
            <select value={form.placement} onChange={e => setForm(f => ({ ...f, placement: e.target.value }))} className="h-10 rounded-lg border px-3 text-sm bg-background">
              {['dashboard_hero', 'deals_carousel', 'ferry_schedule', 'restaurant_list', 'map_pin'].map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Start Date</p>
              <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="h-10 rounded-lg" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">End Date</p>
              <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="h-10 rounded-lg" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createMutation.mutate()} disabled={!form.name || !form.advertiser || createMutation.isPending} className="flex-1 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {campaigns.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No campaigns yet</p>}
        {campaigns.map(c => {
          const pct = c.budget > 0 ? Math.min(100, ((c.spent || 0) / c.budget) * 100) : 0;
          const ctr = c.impressions > 0 ? ((c.clicks || 0) / c.impressions * 100).toFixed(2) : '0.00';
          return (
            <div key={c.id} className="bg-card border rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.advertiser} · {TYPE_LABELS[c.type]}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[c.status]}`}>{c.status}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Budget used</span>
                  <span>${(c.spent || 0).toFixed(2)} / ${c.budget}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-xs font-bold">{(c.impressions || 0).toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Impressions</p></div>
                <div><p className="text-xs font-bold">{(c.clicks || 0).toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Clicks</p></div>
                <div><p className="text-xs font-bold">{ctr}%</p><p className="text-[10px] text-muted-foreground">CTR</p></div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => toggleMutation.mutate(c)} disabled={toggleMutation.isPending} className="flex-1 rounded-lg text-xs gap-1.5">
                  {c.status === 'active' ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Activate</>}
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(c.id)} disabled={deleteMutation.isPending} className="rounded-lg text-xs text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}