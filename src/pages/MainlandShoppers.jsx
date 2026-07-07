import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Store, MapPin, Clock, Truck, FileText, Loader2, Check, Package } from 'lucide-react';

const CITIES = [
  { value: 'wilmington', label: 'Wilmington' },
  { value: 'southport', label: 'Southport' },
];

const DELIVERY = [
  { value: 'ferry_pickup', label: 'Ferry Pickup' },
  { value: 'tram_delivery', label: 'Tram Delivery' },
  { value: 'island_delivery', label: 'Island Delivery' },
];

const URGENCY = [
  { value: 'standard', label: 'Standard', color: 'text-muted-foreground' },
  { value: 'rush', label: 'Rush', color: 'text-amber-600' },
  { value: 'emergency', label: 'Emergency', color: 'text-destructive' },
];

const STATUS_FLOW = [
  'request_received', 'shopper_assigned', 'shopping_in_progress',
  'on_the_way_to_ferry', 'on_ferry', 'ready_for_pickup', 'delivered',
];

const STATUS_LABELS = {
  request_received: 'Request Received',
  shopper_assigned: 'Shopper Assigned',
  shopping_in_progress: 'Shopping in Progress',
  on_the_way_to_ferry: 'On the Way to Ferry',
  on_ferry: 'On Ferry',
  ready_for_pickup: 'Ready for Pickup',
  delivered: 'Delivered',
};

export default function MainlandShoppers() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['shoppingRequests'],
    queryFn: () => base44.entities.ShoppingRequest.list('-created_date'),
  });

  return (
    <div className="px-4 pt-5 pb-8">
      <h1 className="font-heading text-xl text-foreground mb-1">Mainland Shoppers</h1>
      <p className="text-xs text-muted-foreground mb-5">Book verified shoppers in Wilmington or Southport to pick up items and deliver them to the ferry.</p>

      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold mb-6"
      >
        <ShoppingBag className="w-4 h-4" strokeWidth={1.5} /> New Shopping Request
      </button>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">No shopping requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => <RequestCard key={req.id} request={req} />)}
        </div>
      )}

      {showForm && <RequestForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function RequestCard({ request }) {
  const statusIdx = STATUS_FLOW.indexOf(request.status);
  const urgency = URGENCY.find(u => u.value === request.urgency) || URGENCY[0];

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-luxe-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{request.store}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground capitalize">{request.pickup_city}</span>
            <span className={`text-[10px] font-semibold ${urgency.color}`}>· {urgency.label}</span>
          </div>
        </div>
        <span className="text-[9px] rounded-full px-2 py-1 font-semibold bg-primary/10 text-primary">
          {STATUS_LABELS[request.status] || request.status}
        </span>
      </div>

      {request.shopping_list && (
        <p className="text-xs text-muted-foreground bg-secondary/30 rounded-xl p-3 mb-3">{request.shopping_list}</p>
      )}

      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        {request.ferry_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" strokeWidth={1.5} /> {request.ferry_time}</span>}
        {request.delivery_preference && <span className="flex items-center gap-1"><Truck className="w-3 h-3" strokeWidth={1.5} /> {DELIVERY.find(d => d.value === request.delivery_preference)?.label}</span>}
      </div>

      {request.status !== 'delivered' && (
        <div className="flex items-center gap-1 mt-3">
          {STATUS_FLOW.map((step, i) => (
            <div
              key={step}
              className={`flex-1 h-1 rounded-full ${i <= statusIdx ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestForm({ onClose }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', store: '', pickup_city: 'southport',
    shopping_list: '', ferry_time: '', delivery_preference: 'ferry_pickup',
    notes: '', urgency: 'standard',
  });
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.email || !form.store || !form.shopping_list) return;
    setSaving(true);
    try {
      await base44.entities.ShoppingRequest.create({ user_email: '', ...form, status: 'request_received' });
      queryClient.invalidateQueries({ queryKey: ['shoppingRequests'] });
      onClose();
    } catch {
      alert('Failed to submit request.');
    } finally {
      setSaving(false);
    }
  };

  const valid = form.name && form.phone && form.email && form.store && form.shopping_list;

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-card rounded-t-2xl sm:rounded-2xl p-5 max-w-sm w-full max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="font-heading text-lg text-foreground mb-4">New Shopping Request</h3>
        <div className="space-y-3">
          <Row>
            <Field label="Your Name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-base" placeholder="Full name" /></Field>
            <Field label="Phone"><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-base" placeholder="Phone number" /></Field>
          </Row>
          <Field label="Email"><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-base" placeholder="Email address" /></Field>
          <Row>
            <Field label="Store"><input value={form.store} onChange={e => setForm({ ...form, store: e.target.value })} className="input-base" placeholder="e.g. Harris Teeter" /></Field>
            <Field label="Pickup City">
              <select value={form.pickup_city} onChange={e => setForm({ ...form, pickup_city: e.target.value })} className="input-base">
                {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
          </Row>
          <Field label="Shopping List">
            <textarea value={form.shopping_list} onChange={e => setForm({ ...form, shopping_list: e.target.value })} rows={3} className="input-base resize-none" placeholder="Items to shop for..." />
          </Field>
          <Row>
            <Field label="Preferred Ferry Time"><input value={form.ferry_time} onChange={e => setForm({ ...form, ferry_time: e.target.value })} className="input-base" placeholder="e.g. 2:00 PM" /></Field>
            <Field label="Delivery Preference">
              <select value={form.delivery_preference} onChange={e => setForm({ ...form, delivery_preference: e.target.value })} className="input-base">
                {DELIVERY.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </Field>
          </Row>
          <Field label="Urgency Level">
            <select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })} className="input-base">
              {URGENCY.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </Field>
          <Field label="Notes">
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="input-base resize-none" placeholder="Special instructions..." />
          </Field>
        </div>
        <button onClick={handleSubmit} disabled={saving || !valid} className="w-full mt-5 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={1.5} />} Submit Request
        </button>
      </div>
    </div>
  );
}

function Row({ children }) {
  return <div className="flex gap-3">{children}</div>;
}

function Field({ label, children }) {
  return (
    <div className="flex-1">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}