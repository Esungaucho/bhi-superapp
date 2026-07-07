import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Sparkles, Crown, Package, Loader2, Trash2, Plus, X } from 'lucide-react';

const TABS = [
  { value: 'shopping', label: 'Shopping', Icon: ShoppingBag },
  { value: 'valet', label: 'Valet', Icon: Sparkles },
  { value: 'products', label: 'Products', Icon: Package },
  { value: 'members', label: 'Members', Icon: Crown },
];

const SHOPPING_STATUSES = [
  'request_received', 'shopper_assigned', 'shopping_in_progress',
  'on_the_way_to_ferry', 'on_ferry', 'ready_for_pickup', 'delivered',
];

export default function ConciergeToolsAdmin() {
  const [tab, setTab] = useState('shopping');

  return (
    <div className="px-4 pt-5 pb-8">
      <h2 className="font-heading text-xl text-foreground mb-4">Concierge Tools</h2>

      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold rounded-full px-4 py-2 ${
              tab === t.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            <t.Icon className="w-3.5 h-3.5" strokeWidth={1.5} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'shopping' && <ShoppingTab />}
      {tab === 'valet' && <ValetTab />}
      {tab === 'products' && <ProductsTab />}
      {tab === 'members' && <MembersTab />}
    </div>
  );
}

function ShoppingTab() {
  const queryClient = useQueryClient();
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['adminShoppingRequests'],
    queryFn: () => base44.entities.ShoppingRequest.list('-created_date', 50),
  });

  const updateStatus = async (id, status) => {
    await base44.entities.ShoppingRequest.update(id, { status });
    queryClient.invalidateQueries({ queryKey: ['adminShoppingRequests'] });
  };

  if (isLoading) return <Spinner />;

  if (requests.length === 0) return <Empty label="No shopping requests" />;

  return (
    <div className="space-y-3">
      {requests.map(req => (
        <div key={req.id} className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{req.store}</p>
              <p className="text-[10px] text-muted-foreground">{req.name} · {req.pickup_city}</p>
            </div>
            <span className="text-[9px] rounded-full px-2 py-0.5 font-semibold bg-primary/10 text-primary capitalize">
              {req.urgency}
            </span>
          </div>
          {req.shopping_list && <p className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-2 mb-2">{req.shopping_list}</p>}
          <select
            value={req.status}
            onChange={(e) => updateStatus(req.id, e.target.value)}
            className="w-full text-xs rounded-lg border border-input bg-background px-3 py-2 capitalize"
          >
            {SHOPPING_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

function ValetTab() {
  const { data: waitlist = [], isLoading } = useQuery({
    queryKey: ['adminValetWaitlist'],
    queryFn: () => base44.entities.ValetWaitlist.list('-created_date', 50),
  });

  if (isLoading) return <Spinner />;
  if (waitlist.length === 0) return <Empty label="No valet waitlist entries" />;

  return (
    <div className="space-y-2">
      {waitlist.map(entry => (
        <div key={entry.id} className="bg-card rounded-xl border border-border p-3">
          <p className="text-sm font-semibold text-foreground">{entry.name}</p>
          <p className="text-[10px] text-muted-foreground">{entry.email} · {entry.phone}</p>
          {entry.arrival_date && <p className="text-[10px] text-muted-foreground mt-1">Arrival: {entry.arrival_date}</p>}
          {entry.notes && <p className="text-[10px] text-muted-foreground mt-1 italic">{entry.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function ProductsTab() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['adminAffiliateProducts'],
    queryFn: () => base44.entities.AffiliateProduct.list('-created_date', 50),
  });

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await base44.entities.AffiliateProduct.delete(id);
    queryClient.invalidateQueries({ queryKey: ['adminAffiliateProducts'] });
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs font-semibold mb-4">
        <Plus className="w-3.5 h-3.5" strokeWidth={1.5} /> Add Product
      </button>
      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
            {p.image && <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
              <p className="text-[10px] text-muted-foreground">{p.category.replace(/_/g, ' ')}</p>
            </div>
            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
      {showForm && <ProductForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function ProductForm({ onClose }) {
  const [form, setForm] = useState({ name: '', image: '', description: '', category: 'beach_gear', affiliate_link: '', is_featured: false });
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!form.name || !form.affiliate_link) return;
    setSaving(true);
    try {
      await base44.entities.AffiliateProduct.create(form);
      queryClient.invalidateQueries({ queryKey: ['adminAffiliateProducts'] });
      onClose();
    } catch { alert('Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg text-foreground">Add Product</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} /></button>
        </div>
        <div className="space-y-3">
          <FormField label="Name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-base" /></FormField>
          <FormField label="Image URL"><input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="input-base" /></FormField>
          <FormField label="Description"><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="input-base resize-none" /></FormField>
          <FormField label="Category">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-base">
              {['beach_gear','baby_essentials','groceries','sunscreen_wellness','golf_cart_accessories','rainy_day_activities','travel_essentials','home_essentials','ferry_day_items'].map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
            </select>
          </FormField>
          <FormField label="Affiliate Link"><input value={form.affiliate_link} onChange={e => setForm({ ...form, affiliate_link: e.target.value })} className="input-base" /></FormField>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-foreground">Featured</span>
          </label>
        </div>
        <button onClick={handleSubmit} disabled={saving || !form.name || !form.affiliate_link} className="w-full mt-5 bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Save Product'}
        </button>
      </div>
    </div>
  );
}

function MembersTab() {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['adminMemberships'],
    queryFn: () => base44.entities.Membership.list('-created_date', 50),
  });

  if (isLoading) return <Spinner />;
  if (members.length === 0) return <Empty label="No memberships yet" />;

  return (
    <div className="space-y-2">
      {members.map(m => (
        <div key={m.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
          <Crown className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{m.user_email}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] rounded-full px-2 py-0.5 font-semibold bg-secondary text-muted-foreground capitalize">{m.status?.replace(/_/g,' ')}</span>
              {m.subscription_type && <span className="text-[9px] text-muted-foreground capitalize">{m.subscription_type}</span>}
            </div>
          </div>
          {m.trial_end_date && <span className="text-[10px] text-muted-foreground">Trial ends {new Date(m.trial_end_date).toLocaleDateString()}</span>}
        </div>
      ))}
    </div>
  );
}

function Spinner() { return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>; }
function Empty({ label }) { return <div className="text-center py-12"><p className="text-sm text-muted-foreground">{label}</p></div>; }
function FormField({ label, children }) { return <div><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-1.5 block">{label}</label>{children}</div>; }