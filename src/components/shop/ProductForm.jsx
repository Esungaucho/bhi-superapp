import React, { useState } from 'react';
import { X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { COLLECTIONS, PRODUCT_CATEGORIES } from '@/lib/islandShopConstants';

export default function ProductForm({ form, setForm, onSave, onCancel, saving }) {
  const [uploading, setUploading] = useState(false);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleImageUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set('image_url', file_url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const inputClass = 'w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent';
  const labelClass = 'text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-card rounded-2xl w-full max-w-md p-5 animate-fade-in max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-lg text-foreground">Product Details</h3>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Image */}
          <div>
            <label className={labelClass}>Product Image</label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-xl bg-sand/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                {form.image_url ? (
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground/30" strokeWidth={1} />
                )}
              </div>
              <label className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground cursor-pointer hover:bg-sand/30 transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Upload Image</>}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0])} />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className={labelClass}>Product Name *</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Linen Beach Hat" className={inputClass} />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="A breezy, wide-brimmed hat perfect for sunny beach days…" rows={3} className={inputClass + ' h-auto py-3 resize-none'} />
          </div>

          {/* Collection + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Collection *</label>
              <select value={form.collection} onChange={e => set('collection', e.target.value)} className={inputClass}>
                {COLLECTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className={inputClass}>
                {PRODUCT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Price + Retailer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Price Range</label>
              <input type="text" value={form.price_range} onChange={e => set('price_range', e.target.value)} placeholder="$25-$50" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Retailer</label>
              <input type="text" value={form.retailer_name} onChange={e => set('retailer_name', e.target.value)} placeholder="Amazon" className={inputClass} />
            </div>
          </div>

          {/* Affiliate Link */}
          <div>
            <label className={labelClass}>Affiliate Link *</label>
            <input type="url" value={form.affiliate_link} onChange={e => set('affiliate_link', e.target.value)} placeholder="https://…" className={inputClass} />
          </div>

          {/* Tags */}
          <div>
            <label className={labelClass}>Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="sun protection, beach, unisex" className={inputClass} />
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-1">
            {[
              { key: 'is_featured', label: 'Featured in App' },
              { key: 'is_seasonal', label: 'Seasonal Product' },
              { key: 'is_featured_in_newsletter', label: 'Featured in Newsletter' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => set(key, !form[key])}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-background hover:bg-sand/20 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">{label}</span>
                <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form[key] ? 'bg-accent' : 'bg-border'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form[key] ? 'translate-x-5' : ''}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!form.name.trim() || !form.affiliate_link.trim() || saving}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}