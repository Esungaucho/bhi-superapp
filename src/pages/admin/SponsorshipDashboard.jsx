import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Eye, MousePointerClick, Mail, X, Loader2, ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { SPONSOR_CATEGORIES } from '@/lib/marketplaceConstants';
import StatCard from '@/components/admin/StatCard';

export default function SponsorshipDashboard() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    entity_type: 'real_estate_agent',
    entity_name: '',
    sponsor_category: 'featured_realtor',
    start_date: '',
    end_date: '',
    monthly_fee: 0,
    annual_fee: 0,
    priority_ranking: 0,
  });

  const { data: sponsorships = [], isLoading } = useQuery({
    queryKey: ['sponsorships'],
    queryFn: () => base44.entities.Sponsorship.list('-priority_ranking', 200),
  });

  const activeCount = sponsorships.filter(s => s.is_active).length;
  const monthlyRevenue = sponsorships.filter(s => s.is_active).reduce((sum, s) => sum + (s.monthly_fee || 0), 0);
  const annualRevenue = sponsorships.filter(s => s.is_active).reduce((sum, s) => sum + (s.annual_fee || 0), 0);
  const totalViews = sponsorships.reduce((sum, s) => sum + (s.profile_views || 0), 0);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleCreate = async () => {
    await base44.entities.Sponsorship.create(form);
    queryClient.invalidateQueries(['sponsorships']);
    setShowForm(false);
    setForm({ entity_type: 'real_estate_agent', entity_name: '', sponsor_category: 'featured_realtor', start_date: '', end_date: '', monthly_fee: 0, annual_fee: 0, priority_ranking: 0 });
  };

  const handleDelete = async (id) => {
    await base44.entities.Sponsorship.delete(id);
    queryClient.invalidateQueries(['sponsorships']);
  };

  const toggleActive = async (s) => {
    await base44.entities.Sponsorship.update(s.id, { is_active: !s.is_active });
    queryClient.invalidateQueries(['sponsorships']);
  };

  const movePriority = async (s, direction) => {
    await base44.entities.Sponsorship.update(s.id, { priority_ranking: (s.priority_ranking || 0) + direction });
    queryClient.invalidateQueries(['sponsorships']);
  };

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-lg text-foreground">Sponsorship Dashboard</h2>
          <p className="text-xs text-muted-foreground">Manage featured placements & revenue</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium">
          <Plus className="w-4 h-4" strokeWidth={1.5} /> New
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard icon={<DollarSign className="w-4 h-4 text-emerald-500" />} label="Monthly Rev." value={`$${monthlyRevenue.toLocaleString()}`} />
        <StatCard icon={<DollarSign className="w-4 h-4 text-accent" />} label="Annual Rev." value={`$${annualRevenue.toLocaleString()}`} />
        <StatCard icon={<Eye className="w-4 h-4 text-ocean" />} label="Active" value={activeCount} />
        <StatCard icon={<MousePointerClick className="w-4 h-4 text-amber-500" />} label="Total Views" value={totalViews.toLocaleString()} />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : sponsorships.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1} />
          <p className="text-sm">No sponsorships yet</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sponsorships.map(s => {
            const catMeta = SPONSOR_CATEGORIES[s.sponsor_category] || {};
            return (
              <div key={s.id} className="bg-card border border-border/50 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{s.entity_name}</p>
                    <p className="text-[11px] text-accent">{catMeta.label || s.sponsor_category?.replace(/_/g, ' ')}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] text-muted-foreground">
                      {s.monthly_fee > 0 && <span>${s.monthly_fee}/mo</span>}
                      {s.annual_fee > 0 && <span>${s.annual_fee}/yr</span>}
                      <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {s.profile_views || 0}</span>
                      <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" /> {s.inquiries || 0}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${s.is_active ? 'text-emerald-600 bg-emerald-50' : 'text-muted-foreground bg-sand'}`}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/30">
                  <button onClick={() => movePriority(s, 1)} className="p-1.5 rounded-lg hover:bg-sand/50 transition-colors" title="Move up">
                    <ArrowUp className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => movePriority(s, -1)} className="p-1.5 rounded-lg hover:bg-sand/50 transition-colors" title="Move down">
                    <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => toggleActive(s)} className="ml-auto text-[11px] font-medium text-accent px-2 py-1">
                    {s.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-end sm:items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl w-full max-w-md p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-base">New Sponsorship</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <Field label="Business Type">
                <select value={form.entity_type} onChange={e => set('entity_type', e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm">
                  <option value="real_estate_agent">Real Estate Agent</option>
                  <option value="builder">Builder / Home Service</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="wedding_vendor">Wedding Vendor</option>
                  <option value="concierge_partner">Concierge Partner</option>
                </select>
              </Field>
              <Field label="Business / Agent Name">
                <input value={form.entity_name} onChange={e => set('entity_name', e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm" placeholder="e.g. Coastal Luxury Realty" />
              </Field>
              <Field label="Sponsor Category">
                <select value={form.sponsor_category} onChange={e => set('sponsor_category', e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm">
                  {Object.entries(SPONSOR_CATEGORIES).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date">
                  <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm" />
                </Field>
                <Field label="End Date">
                  <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Monthly Fee ($)">
                  <input type="number" value={form.monthly_fee} onChange={e => set('monthly_fee', Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm" />
                </Field>
                <Field label="Annual Fee ($)">
                  <input type="number" value={form.annual_fee} onChange={e => set('annual_fee', Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm" />
                </Field>
              </div>
              <Field label="Priority Ranking">
                <input type="number" value={form.priority_ranking} onChange={e => set('priority_ranking', Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm" />
              </Field>
              <button onClick={handleCreate} className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium mt-2">
                Create Sponsorship
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}