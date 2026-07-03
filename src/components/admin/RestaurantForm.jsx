import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  X, Loader2, Plus, Trash2, Camera, Upload
} from 'lucide-react';

const EMPTY = {
  name: '', description: '', cuisine: '', image_url: '', gallery: [],
  address: '', phone: '', email: '', hours: '', website_url: '', menu_url: '',
  reservation_url: '', location: '', lat: null, lng: null, price_range: '$$',
  dining_categories: [],
  is_waterfront: false, has_indoor_seating: false, has_outdoor_seating: false,
  is_kid_friendly: false, is_dog_friendly: false,
  has_vegan_options: false, has_gluten_free_options: false, has_vegetarian_options: false,
  offers_takeout: false, offers_delivery: false, offers_catering: false,
  supports_private_events: false, dress_code: '',
  is_featured_partner: false, is_birdie_trusted_partner: false, is_concierge_recommended: false,
  notes: '', is_featured: false,
};

const PRICE_OPTIONS = ['$', '$$', '$$$', '$$$$'];
const DINING_CATS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'date_night', label: 'Date Night' },
];

export default function RestaurantForm({ restaurant, onClose }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ ...EMPTY, ...restaurant, gallery: restaurant?.gallery || [] });
  const [saving, setSaving] = useState(false);
  const [galleryInput, setGalleryInput] = useState('');
  const isEdit = !!restaurant?.id;

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const toggle = (key) => setForm(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleDiningCat = (catId) => {
    setForm(prev => ({
      ...prev,
      dining_categories: prev.dining_categories.includes(catId)
        ? prev.dining_categories.filter(c => c !== catId)
        : [...prev.dining_categories, catId],
    }));
  };

  const addGalleryUrl = () => {
    const url = galleryInput.trim();
    if (!url) return;
    setForm(prev => ({ ...prev, gallery: [...(prev.gallery || []), url] }));
    setGalleryInput('');
  };

  const removeGalleryUrl = (idx) => {
    setForm(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set('image_url', file_url);
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const urls = await Promise.all(
        files.map(file => base44.integrations.Core.UploadFile({ file }))
      );
      setForm(prev => ({
        ...prev,
        gallery: [...(prev.gallery || []), ...urls.map(u => u.file_url)],
      }));
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.cuisine?.trim()) {
      toast({ title: 'Name and cuisine are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
      };
      if (isEdit) {
        await base44.entities.Restaurant.update(restaurant.id, payload);
      } else {
        await base44.entities.Restaurant.create(payload);
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

        <div className="overflow-y-auto px-5 py-4 space-y-4 pb-4">
          {/* Basic Info */}
          <SectionTitle>Basic Info</SectionTitle>
          <Field label="Name *">
            <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Cuisine *">
            <input value={form.cuisine} onChange={e => set('cuisine', e.target.value)} placeholder="Seafood, American, Pizza..." className={inputCls} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className={inputCls} />
          </Field>

          {/* Cover Photo */}
          <Field label="Cover Photo">
            <div className="flex items-center gap-3">
              {form.image_url ? (
                <img src={form.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-sand flex items-center justify-center">
                  <Camera className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-foreground hover:bg-sand/40 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Upload
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </label>
            </div>
            <input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="or paste URL..." className={inputCls + ' mt-2'} />
          </Field>

          {/* Photo Gallery */}
          <Field label="Photo Gallery">
            <div className="flex items-center gap-2 mb-2">
              <input value={galleryInput} onChange={e => setGalleryInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addGalleryUrl())}
                placeholder="Paste image URL..." className={inputCls} />
              <button onClick={addGalleryUrl} className="p-2.5 rounded-xl bg-accent text-white flex-shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-foreground hover:bg-sand/40 cursor-pointer mb-2">
              <Upload className="w-3.5 h-3.5" /> Upload Photos
              <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
            </label>
            {form.gallery?.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5">
                {form.gallery.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt="" className="w-full h-14 rounded-lg object-cover" />
                    <button onClick={() => removeGalleryUrl(idx)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          {/* Contact */}
          <SectionTitle>Contact & Location</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(910) 457-..." className={inputCls} />
            </Field>
            <Field label="Email">
              <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="info@..." className={inputCls} />
            </Field>
          </div>
          <Field label="Address">
            <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" className={inputCls} />
          </Field>
          <Field label="Location / Area">
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Marina, South Beach..." className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <input type="number" step="any" value={form.lat ?? ''} onChange={e => set('lat', e.target.value)} placeholder="33.87..." className={inputCls} />
            </Field>
            <Field label="Longitude">
              <input type="number" step="any" value={form.lng ?? ''} onChange={e => set('lng', e.target.value)} placeholder="-77.99..." className={inputCls} />
            </Field>
          </div>

          {/* Online Links */}
          <SectionTitle>Online Links</SectionTitle>
          <Field label="Website URL">
            <input value={form.website_url} onChange={e => set('website_url', e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>
          <Field label="Menu URL">
            <input value={form.menu_url} onChange={e => set('menu_url', e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>
          <Field label="Reservation URL">
            <input value={form.reservation_url} onChange={e => set('reservation_url', e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>

          {/* Hours & Price */}
          <SectionTitle>Hours & Price</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hours">
              <input value={form.hours} onChange={e => set('hours', e.target.value)} placeholder="11am-9pm" className={inputCls} />
            </Field>
            <Field label="Price Range">
              <select value={form.price_range} onChange={e => set('price_range', e.target.value)} className={inputCls}>
                {PRICE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Dining Categories">
            <div className="flex flex-wrap gap-2">
              {DINING_CATS.map(cat => (
                <button key={cat.id} onClick={() => toggleDiningCat(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    form.dining_categories?.includes(cat.id)
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-card text-muted-foreground'
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Seating & Atmosphere */}
          <SectionTitle>Seating & Atmosphere</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Indoor Seating" checked={form.has_indoor_seating} onClick={() => toggle('has_indoor_seating')} />
            <Toggle label="Outdoor Seating" checked={form.has_outdoor_seating} onClick={() => toggle('has_outdoor_seating')} />
            <Toggle label="Waterfront" checked={form.is_waterfront} onClick={() => toggle('is_waterfront')} />
            <Toggle label="Kid Friendly" checked={form.is_kid_friendly} onClick={() => toggle('is_kid_friendly')} />
            <Toggle label="Dog Friendly" checked={form.is_dog_friendly} onClick={() => toggle('is_dog_friendly')} />
            <Toggle label="Dress Code" checked={!!form.dress_code} onClick={() => toggle('dress_code')} />
          </div>
          {form.dress_code && (
            <Field label="Dress Code Details">
              <input value={form.dress_code} onChange={e => set('dress_code', e.target.value)} placeholder="Casual, Smart Casual, Formal..." className={inputCls} />
            </Field>
          )}

          {/* Dietary Options */}
          <SectionTitle>Dietary Options</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Vegan Options" checked={form.has_vegan_options} onClick={() => toggle('has_vegan_options')} />
            <Toggle label="Gluten-Free Options" checked={form.has_gluten_free_options} onClick={() => toggle('has_gluten_free_options')} />
            <Toggle label="Vegetarian Options" checked={form.has_vegetarian_options} onClick={() => toggle('has_vegetarian_options')} />
          </div>

          {/* Services */}
          <SectionTitle>Services</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Takeout" checked={form.offers_takeout} onClick={() => toggle('offers_takeout')} />
            <Toggle label="Delivery" checked={form.offers_delivery} onClick={() => toggle('offers_delivery')} />
            <Toggle label="Catering" checked={form.offers_catering} onClick={() => toggle('offers_catering')} />
            <Toggle label="Private Events" checked={form.supports_private_events} onClick={() => toggle('supports_private_events')} />
          </div>

          {/* Badges */}
          <SectionTitle>Partner Badges</SectionTitle>
          <div className="grid grid-cols-1 gap-2">
            <Toggle label="Featured Partner" checked={form.is_featured_partner} onClick={() => toggle('is_featured_partner')} />
            <Toggle label="Birdie Trusted Partner" checked={form.is_birdie_trusted_partner} onClick={() => toggle('is_birdie_trusted_partner')} />
            <Toggle label="Concierge Recommended" checked={form.is_concierge_recommended} onClick={() => toggle('is_concierge_recommended')} />
          </div>

          {/* Notes */}
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

function SectionTitle({ children }) {
  return <p className="text-[11px] font-bold text-foreground/80 uppercase tracking-luxe-sm pt-2">{children}</p>;
}