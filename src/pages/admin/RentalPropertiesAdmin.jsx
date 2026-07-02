import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, X, Loader2, Search, Home as HomeIcon, CheckCircle2 } from 'lucide-react';
import { RENTAL_TYPES } from '@/lib/rentalPropertyConstants';

export default function RentalPropertiesAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['rentalPropertiesAdmin'],
    queryFn: () => base44.entities.RentalProperty.list('-created_date', 200),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return properties;
    const q = search.toLowerCase();
    return properties.filter(p =>
      p.property_name?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q)
    );
  }, [properties, search]);

  const handleDelete = async (id) => {
    await base44.entities.RentalProperty.delete(id);
    queryClient.invalidateQueries(['rentalPropertiesAdmin']);
  };

  const toggleApproval = async (p) => {
    const newStatus = p.approval_status === 'approved' ? 'pending' : 'approved';
    await base44.entities.RentalProperty.update(p.id, { approval_status: newStatus });
    queryClient.invalidateQueries(['rentalPropertiesAdmin']);
  };

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-lg text-foreground">Rental Properties</h2>
          <p className="text-xs text-muted-foreground">Shared database for all rental listings</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium">
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Add
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" strokeWidth={1.5} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search properties..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-accent"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <HomeIcon className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1} />
          <p className="text-sm">No properties yet</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(p => {
            const typeMeta = RENTAL_TYPES.find(t => t.id === p.rental_type);
            return (
              <div key={p.id} className="bg-card border border-border/50 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{p.property_name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.location} · {typeMeta?.label}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {p.is_event_friendly && <span className="text-[9px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">Event</span>}
                      {p.is_wedding_friendly && <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Wedding</span>}
                      {p.is_private_event_friendly && <span className="text-[9px] font-bold text-ocean bg-ocean/10 px-1.5 py-0.5 rounded">Private</span>}
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    p.approval_status === 'approved' ? 'text-emerald-600 bg-emerald-50' :
                    p.approval_status === 'pending' ? 'text-amber-600 bg-amber-50' : 'text-muted-foreground bg-sand'
                  }`}>
                    {p.approval_status}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/30">
                  <button onClick={() => toggleApproval(p)} className="text-[11px] font-medium text-accent px-2 py-1">
                    {p.approval_status === 'approved' ? 'Unpublish' : 'Approve'}
                  </button>
                  <button onClick={() => { setEditing(p); setShowForm(true); }} className="text-[11px] font-medium text-muted-foreground px-2 py-1">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="ml-auto p-1 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <PropertyForm property={editing} onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); queryClient.invalidateQueries(['rentalPropertiesAdmin']); }} />}
    </div>
  );
}

function PropertyForm({ property, onClose, onSave }) {
  const [form, setForm] = useState({
    property_name: property?.property_name || '',
    rental_type: property?.rental_type || 'luxury_vacation_rental',
    location: property?.location || '',
    address: property?.address || '',
    description: property?.description || '',
    bedrooms: property?.bedrooms || 2,
    bathrooms: property?.bathrooms || 1,
    sleeps: property?.sleeps || 4,
    nightly_rate: property?.nightly_rate || 0,
    booking_link: property?.booking_link || '',
    property_manager: property?.property_manager || '',
    property_manager_phone: property?.property_manager_phone || '',
    property_manager_email: property?.property_manager_email || '',
    real_estate_agent_name: property?.real_estate_agent_name || '',
    is_event_friendly: property?.is_event_friendly || false,
    is_wedding_friendly: property?.is_wedding_friendly || false,
    is_private_event_friendly: property?.is_private_event_friendly || false,
    max_event_guest_count: property?.max_event_guest_count || 0,
    indoor_event_space: property?.indoor_event_space || false,
    outdoor_event_space: property?.outdoor_event_space || false,
    parking_ferry_golf_cart_notes: property?.parking_ferry_golf_cart_notes || '',
    rules_restrictions: property?.rules_restrictions || '',
    preferred_vendor_notes: property?.preferred_vendor_notes || '',
    amenities: property?.amenities || [],
    is_featured: property?.is_featured || false,
    approval_status: property?.approval_status || 'pending',
  });
  const [photoUrl, setPhotoUrl] = useState('');
  const [photos, setPhotos] = useState(property?.photos || []);
  const [amenityInput, setAmenityInput] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, photos };
      if (property?.id) {
        await base44.entities.RentalProperty.update(property.id, payload);
      } else {
        await base44.entities.RentalProperty.create(payload);
      }
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-base">{property ? 'Edit Property' : 'New Rental Property'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <F label="Property Name"><input value={form.property_name} onChange={e => set('property_name', e.target.value)} className={inp} /></F>
          <F label="Rental Type">
            <select value={form.rental_type} onChange={e => set('rental_type', e.target.value)} className={inp}>
              {RENTAL_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </F>
          <F label="Location"><input value={form.location} onChange={e => set('location', e.target.value)} className={inp} placeholder="Bald Head Island, Southport..." /></F>
          <F label="Address"><input value={form.address} onChange={e => set('address', e.target.value)} className={inp} /></F>
          <F label="Description"><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={inp} /></F>
          <div className="grid grid-cols-3 gap-3">
            <F label="Beds"><input type="number" value={form.bedrooms} onChange={e => set('bedrooms', Number(e.target.value))} className={inp} /></F>
            <F label="Baths"><input type="number" value={form.bathrooms} onChange={e => set('bathrooms', Number(e.target.value))} className={inp} /></F>
            <F label="Sleeps"><input type="number" value={form.sleeps} onChange={e => set('sleeps', Number(e.target.value))} className={inp} /></F>
          </div>
          <F label="Nightly Rate ($)"><input type="number" value={form.nightly_rate} onChange={e => set('nightly_rate', Number(e.target.value))} className={inp} /></F>
          <F label="Booking Link"><input value={form.booking_link} onChange={e => set('booking_link', e.target.value)} className={inp} /></F>

          {/* Photos */}
          <div>
            <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">Photos</label>
            <div className="flex gap-2 mb-2">
              <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className={inp} placeholder="Paste image URL..." />
              <button onClick={() => { if (photoUrl) { setPhotos([...photos, photoUrl]); setPhotoUrl(''); } }} className="px-3 rounded-lg bg-sand text-xs font-medium">Add</button>
            </div>
            {photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {photos.map((url, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center text-[8px]">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Property Manager */}
          <F label="Property Manager"><input value={form.property_manager} onChange={e => set('property_manager', e.target.value)} className={inp} /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Manager Phone"><input value={form.property_manager_phone} onChange={e => set('property_manager_phone', e.target.value)} className={inp} /></F>
            <F label="Manager Email"><input value={form.property_manager_email} onChange={e => set('property_manager_email', e.target.value)} className={inp} /></F>
          </div>
          <F label="Real Estate Agent (if applicable)"><input value={form.real_estate_agent_name} onChange={e => set('real_estate_agent_name', e.target.value)} className={inp} /></F>

          {/* Event fields */}
          <div className="bg-accent/5 rounded-xl p-3 space-y-2">
            <p className="text-[10px] font-bold tracking-luxe-sm uppercase text-accent">Event Venue Options</p>
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.is_event_friendly} onChange={e => set('is_event_friendly', e.target.checked)} /> Event Friendly</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.is_wedding_friendly} onChange={e => set('is_wedding_friendly', e.target.checked)} /> Wedding Friendly</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.is_private_event_friendly} onChange={e => set('is_private_event_friendly', e.target.checked)} /> Private Event Friendly</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.indoor_event_space} onChange={e => set('indoor_event_space', e.target.checked)} /> Indoor Event Space</label>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.outdoor_event_space} onChange={e => set('outdoor_event_space', e.target.checked)} /> Outdoor Event Space</label>
            </div>
            <F label="Max Event Guests"><input type="number" value={form.max_event_guest_count} onChange={e => set('max_event_guest_count', Number(e.target.value))} className={inp} /></F>
          </div>

          <F label="Parking / Ferry / Golf Cart Notes"><textarea value={form.parking_ferry_golf_cart_notes} onChange={e => set('parking_ferry_golf_cart_notes', e.target.value)} rows={2} className={inp} /></F>
          <F label="Rules & Restrictions"><textarea value={form.rules_restrictions} onChange={e => set('rules_restrictions', e.target.value)} rows={2} className={inp} /></F>
          <F label="Preferred Vendor Notes"><textarea value={form.preferred_vendor_notes} onChange={e => set('preferred_vendor_notes', e.target.value)} rows={2} className={inp} /></F>

          {/* Amenities */}
          <div>
            <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">Amenities</label>
            <div className="flex gap-2 mb-2">
              <input value={amenityInput} onChange={e => setAmenityInput(e.target.value)} className={inp} placeholder="e.g. Pool, Ocean View..." />
              <button onClick={() => { if (amenityInput) { set('amenities', [...form.amenities, amenityInput]); setAmenityInput(''); } }} className="px-3 rounded-lg bg-sand text-xs font-medium">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.amenities.map((a, i) => (
                <span key={i} className="text-[11px] px-2 py-1 rounded-full bg-sand text-muted-foreground flex items-center gap-1">
                  {a}
                  <button onClick={() => set('amenities', form.amenities.filter((_, idx) => idx !== i))}><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} /> Featured Listing</label>

          <F label="Approval Status">
            <select value={form.approval_status} onChange={e => set('approval_status', e.target.value)} className={inp}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="hidden">Hidden</option>
              <option value="suspended">Suspended</option>
            </select>
          </F>

          <button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium mt-2 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Property
          </button>
        </div>
      </div>
    </div>
  );
}

const inp = 'w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent';
function F({ label, children }) {
  return <div><label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">{label}</label>{children}</div>;
}