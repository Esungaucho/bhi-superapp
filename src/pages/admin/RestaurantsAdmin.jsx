import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  Plus, Pencil, Trash2, X, Loader2, Upload, Globe, UtensilsCrossed,
  Phone, MapPin, CalendarClock, Bird, Search
} from 'lucide-react';

const EMPTY = {
  name: '', description: '', cuisine: '', image_url: '', address: '', phone: '',
  hours: '', website_url: '', menu_url: '', reservation_url: '', location: '',
  is_waterfront: false, is_kid_friendly: false, has_vegan_gluten_free: false,
  offers_catering: false, supports_private_events: false, is_featured_partner: false,
  notes: '', is_featured: false,
};

export default function RestaurantsAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const fileRef = useRef();

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['adminRestaurants'],
    queryFn: () => base44.entities.Restaurant.list('-created_date', 200),
  });

  const filtered = restaurants.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.name?.toLowerCase().includes(q) || r.cuisine?.toLowerCase().includes(q) || r.location?.toLowerCase().includes(q);
  });

  const handleAdd = () => { setEditing(EMPTY); setShowForm(true); };
  const handleEdit = (r) => { setEditing(r); setShowForm(true); };
  const handleClose = () => { setEditing(null); setShowForm(false); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this restaurant?')) return;
    try {
      await base44.entities.Restaurant.delete(id);
      toast({ title: 'Restaurant deleted' });
      queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      toast({ title: 'Importing...', description: 'Processing CSV file' });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            restaurants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  cuisine: { type: 'string' },
                  image_url: { type: 'string' },
                  address: { type: 'string' },
                  phone: { type: 'string' },
                  hours: { type: 'string' },
                  website_url: { type: 'string' },
                  menu_url: { type: 'string' },
                  reservation_url: { type: 'string' },
                  location: { type: 'string' },
                  is_waterfront: { type: 'boolean' },
                  is_kid_friendly: { type: 'boolean' },
                  has_vegan_gluten_free: { type: 'boolean' },
                  offers_catering: { type: 'boolean' },
                  supports_private_events: { type: 'boolean' },
                  is_featured_partner: { type: 'boolean' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
      });

      const list = result?.output?.restaurants || result?.output || [];
      if (Array.isArray(list) && list.length > 0) {
        await base44.entities.Restaurant.bulkCreate(list);
        toast({ title: `Imported ${list.length} restaurants` });
        queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
        queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      } else {
        toast({ title: 'No rows found in file', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Import failed', description: err.message, variant: 'destructive' });
    }
    e.target.value = '';
  };

  return (
    <div className="px-4 py-4 pb-12">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-foreground">Restaurants</h1>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.json" onChange={handleImport} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-foreground hover:bg-sand/40">
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <button onClick={handleAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, cuisine, location..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No restaurants yet</p>
          <p className="text-xs mt-1">Add one or import from CSV</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
              {r.image_url ? (
                <img src={r.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-sand flex items-center justify-center flex-shrink-0">
                  <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground line-clamp-1">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.cuisine}{r.location ? ` · ${r.location}` : ''}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {r.is_waterfront && <Badge label="Waterfront" />}
                  {r.is_kid_friendly && <Badge label="Kid-Friendly" />}
                  {r.has_vegan_gluten_free && <Badge label="Vegan/GF" />}
                  {r.offers_catering && <Badge label="Catering" />}
                  {r.supports_private_events && <Badge label="Private Events" />}
                  {r.is_featured_partner && <Badge label="Featured Partner" accent />}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => handleEdit(r)} className="p-2 rounded-lg hover:bg-sand/40 text-muted-foreground hover:text-foreground">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <RestaurantForm restaurant={editing} onClose={handleClose} />
      )}
    </div>
  );
}

function Badge({ label, accent }) {
  return (
    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${accent ? 'bg-accent/15 text-accent' : 'bg-sand text-muted-foreground'}`}>
      {label}
    </span>
  );
}

function RestaurantForm({ restaurant, onClose }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ ...EMPTY, ...restaurant });
  const [saving, setSaving] = useState(false);
  const isEdit = !!restaurant?.id;

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const toggle = (key) => setForm(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    if (!form.name?.trim() || !form.cuisine?.trim()) {
      toast({ title: 'Name and cuisine are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await base44.entities.Restaurant.update(restaurant.id, form);
      } else {
        await base44.entities.Restaurant.create(form);
      }
      toast({ title: isEdit ? 'Restaurant updated' : 'Restaurant created' });
      queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-background w-full max-w-[430px] max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h2 className="font-bold text-foreground">{isEdit ? 'Edit Restaurant' : 'New Restaurant'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-sand/40"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-3 pb-4">
          <Field label="Name *">
            <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Cuisine *">
            <input value={form.cuisine} onChange={e => set('cuisine', e.target.value)} placeholder="Seafood, American, Pizza..." className={inputCls} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className={inputCls} />
          </Field>
          <Field label="Image URL">
            <input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(910) 457-..." className={inputCls} />
            </Field>
            <Field label="Hours">
              <input value={form.hours} onChange={e => set('hours', e.target.value)} placeholder="11am-9pm" className={inputCls} />
            </Field>
          </div>
          <Field label="Address">
            <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" className={inputCls} />
          </Field>
          <Field label="Location / Area">
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Marina, South Beach..." className={inputCls} />
          </Field>
          <Field label="Website URL">
            <input value={form.website_url} onChange={e => set('website_url', e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>
          <Field label="Menu URL">
            <input value={form.menu_url} onChange={e => set('menu_url', e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>
          <Field label="Reservation URL">
            <input value={form.reservation_url} onChange={e => set('reservation_url', e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Toggle label="Waterfront" checked={form.is_waterfront} onClick={() => toggle('is_waterfront')} />
            <Toggle label="Kid-Friendly" checked={form.is_kid_friendly} onClick={() => toggle('is_kid_friendly')} />
            <Toggle label="Vegan / GF Options" checked={form.has_vegan_gluten_free} onClick={() => toggle('has_vegan_gluten_free')} />
            <Toggle label="Catering" checked={form.offers_catering} onClick={() => toggle('offers_catering')} />
            <Toggle label="Private Events" checked={form.supports_private_events} onClick={() => toggle('supports_private_events')} />
            <Toggle label="Featured Partner" checked={form.is_featured_partner} onClick={() => toggle('is_featured_partner')} />
          </div>

          <Field label="Notes">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={inputCls} />
          </Field>
        </div>

        <div className="px-5 py-3 border-t border-border flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-sand text-foreground text-sm font-semibold hover:bg-sand/70">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-40">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${checked ? 'border-accent bg-accent/5 text-accent' : 'border-border bg-card text-muted-foreground'}`}>
      {label}
      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${checked ? 'border-accent bg-accent' : 'border-border'}`}>
        {checked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
    </button>
  );
}