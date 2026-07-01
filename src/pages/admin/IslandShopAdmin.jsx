import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Pencil, Trash2, Star, Mail, Calendar, Search, ShoppingBag, ExternalLink } from 'lucide-react';
import ProductForm from '@/components/shop/ProductForm';
import { COLLECTIONS, getCollection } from '@/lib/islandShopConstants';

const EMPTY_FORM = {
  name: '', image_url: '', category: 'apparel', collection: 'beach_day_essentials',
  description: '', price_range: '', affiliate_link: '', retailer_name: '',
  tags: '', is_featured: false, is_seasonal: false, is_featured_in_newsletter: false,
};

export default function IslandShopAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['islandShopProducts'],
    queryFn: () => base44.entities.IslandShopProduct.list('-created_date', 500),
  });

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (search && !p.name?.toLowerCase().includes(search.toLowerCase()) && !p.retailer_name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (collectionFilter && p.collection !== collectionFilter) return false;
      return true;
    });
  }, [products, search, collectionFilter]);

  const stats = useMemo(() => ({
    total: products.length,
    featured: products.filter(p => p.is_featured).length,
    newsletter: products.filter(p => p.is_featured_in_newsletter).length,
    seasonal: products.filter(p => p.is_seasonal).length,
  }), [products]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };

  const openEdit = (p) => {
    setForm({
      name: p.name || '', image_url: p.image_url || '', category: p.category || 'apparel',
      collection: p.collection || 'beach_day_essentials', description: p.description || '',
      price_range: p.price_range || '', affiliate_link: p.affiliate_link || '',
      retailer_name: p.retailer_name || '', tags: (p.tags || []).join(', '),
      is_featured: p.is_featured || false, is_seasonal: p.is_seasonal || false,
      is_featured_in_newsletter: p.is_featured_in_newsletter || false,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.affiliate_link.trim()) return;
    setSaving(true);
    try {
      const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editingId) {
        await base44.entities.IslandShopProduct.update(editingId, data);
      } else {
        await base44.entities.IslandShopProduct.create(data);
      }
      queryClient.invalidateQueries(['islandShopProducts']);
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await base44.entities.IslandShopProduct.delete(id);
    queryClient.invalidateQueries(['islandShopProducts']);
  };

  const toggleFlag = async (product, field) => {
    await base44.entities.IslandShopProduct.update(product.id, { [field]: !product[field] });
    queryClient.invalidateQueries(['islandShopProducts']);
  };

  const StatCard = ({ icon: Icon, label, value }) => (
    <div className="bg-card border border-border/50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground mt-0.5">{value}</p>
    </div>
  );

  return (
    <div className="p-4 pb-8">
      <header className="mb-5">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" /> Island Shop
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Manage products, collections & affiliate links</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        <StatCard icon={ShoppingBag} label="Total" value={stats.total} />
        <StatCard icon={Star} label="Featured" value={stats.featured} />
        <StatCard icon={Mail} label="Newsletter" value={stats.newsletter} />
        <StatCard icon={Calendar} label="Seasonal" value={stats.seasonal} />
      </div>

      {/* Add Button */}
      <button
        onClick={openAdd}
        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors mb-4"
      >
        <Plus className="w-4 h-4" /> Add Product
      </button>

      {/* Filters */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={collectionFilter}
          onChange={e => setCollectionFilter(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-accent"
        >
          <option value="">All Collections</option>
          {COLLECTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>

      {/* Product List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No products found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => {
            const col = getCollection(p.collection);
            return (
              <div key={p.id} className="bg-card border border-border/50 rounded-xl p-3">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-sand/40 overflow-hidden flex-shrink-0">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-muted-foreground/30" strokeWidth={1} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{col.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.price_range && <span className="text-xs font-medium text-foreground">{p.price_range}</span>}
                      {p.retailer_name && <span className="text-[10px] text-muted-foreground">{p.retailer_name}</span>}
                    </div>
                    {p.affiliate_link && (
                      <a href={p.affiliate_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline mt-0.5">
                        <ExternalLink className="w-2.5 h-2.5" /> View link
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-sand/40 transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-1.5 mt-2 pt-2 border-t border-border/30">
                  {[
                    { key: 'is_featured', label: 'Featured', icon: Star },
                    { key: 'is_seasonal', label: 'Seasonal', icon: Calendar },
                    { key: 'is_featured_in_newsletter', label: 'Newsletter', icon: Mail },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => toggleFlag(p, key)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
                        p[key] ? 'bg-accent/15 text-accent' : 'bg-sand/40 text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-2.5 h-2.5" /> {label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ProductForm
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setForm(EMPTY_FORM); setEditingId(null); }}
          saving={saving}
        />
      )}
    </div>
  );
}