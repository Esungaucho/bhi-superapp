import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { X, Loader2, CalendarPlus, ShieldCheck } from 'lucide-react';

const CATEGORIES = [
  { value: 'community', label: 'Community' },
  { value: 'family', label: 'Family' },
  { value: 'kids', label: 'Kids' },
  { value: 'nature', label: 'Nature' },
  { value: 'conservancy', label: 'Conservancy' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'arts_culture', label: 'Arts & Culture' },
  { value: 'music', label: 'Music' },
  { value: 'dining', label: 'Dining' },
  { value: 'government', label: 'Government' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'club_events', label: 'Club Events' },
  { value: 'member_only', label: 'Member Only' },
  { value: 'seasonal', label: 'Seasonal' },
];

export default function ManualEventForm({ source, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: source.key === 'bhi_conservancy' ? 'conservancy' : source.key === 'bhi_club' ? 'club_events' : 'community',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    all_day: false,
    location_name: '',
    address: '',
    price_note: '',
    registration_required: false,
    registration_url: '',
    tags: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError('Event title is required');
      return;
    }
    if (!form.start_date) {
      setError('Start date is required');
      return;
    }

    setSaving(true);
    try {
      const startDateTime = form.all_day
        ? new Date(`${form.start_date}T10:00:00`)
        : new Date(`${form.start_date}T${form.start_time || '10:00'}:00`);

      let endDateTime = null;
      if (form.end_date) {
        endDateTime = form.all_day
          ? new Date(`${form.end_date}T10:00:00`)
          : new Date(`${form.end_date}T${form.end_time || '10:00'}:00`);
      }

      const normalizedTitle = form.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
      const syncHash = `${normalizedTitle}_${startDateTime.toISOString().slice(0, 10)}`;

      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);

      await base44.entities.IslandEvent.create({
        title: form.title.trim(),
        description: form.description.trim(),
        short_description: form.description.trim().slice(0, 120),
        category: form.category,
        start_date: form.start_date,
        end_date: form.end_date || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime ? endDateTime.toISOString() : null,
        all_day: form.all_day,
        is_all_day: form.all_day,
        location_name: form.location_name.trim(),
        address: form.address.trim(),
        organization: source.name,
        source: source.key,
        source_url: source.url,
        source_name: source.name,
        price_note: form.price_note.trim(),
        registration_required: form.registration_required,
        registration_url: form.registration_url.trim(),
        tags,
        featured: false,
        is_featured: false,
        status: 'approved',
        sync_hash: syncHash,
        admin_override: true,
        last_synced: new Date().toISOString(),
      });

      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/40 z-[9998] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-[9999] bg-card rounded-t-3xl shadow-luxe-lg max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-card border-b border-border/50 px-5 py-3.5 flex items-center justify-between rounded-t-3xl">
          <div>
            <h3 className="font-heading text-sm text-foreground flex items-center gap-1.5">
              <CalendarPlus className="w-4 h-4" /> Add Verified Event
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{source.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-sand/50">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
            <ShieldCheck className="w-3 h-3" />
            This event will be marked as admin-verified and won't be overwritten by sync.
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Event Title *</label>
            <input
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. Sunset Yoga at the Beach"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={3}
              className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Event description from the source..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Category</label>
              <select
                value={form.category}
                onChange={e => handleChange('category', e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Price Note</label>
              <input
                value={form.price_note}
                onChange={e => handleChange('price_note', e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Free, $25/person"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Start Date *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => handleChange('start_date', e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Start Time</label>
              <input
                type="time"
                value={form.start_time}
                onChange={e => handleChange('start_time', e.target.value)}
                disabled={form.all_day}
                className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground">End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => handleChange('end_date', e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">End Time</label>
              <input
                type="time"
                value={form.end_time}
                onChange={e => handleChange('end_time', e.target.value)}
                disabled={form.all_day}
                className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-40"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={form.all_day}
              onChange={e => handleChange('all_day', e.target.checked)}
              className="w-4 h-4 rounded accent-primary"
            />
            All-day event
          </label>

          <div>
            <label className="text-xs font-semibold text-foreground">Location Name</label>
            <input
              value={form.location_name}
              onChange={e => handleChange('location_name', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. BHI Conservancy"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Address</label>
            <input
              value={form.address}
              onChange={e => handleChange('address', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Street address"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Tags (comma-separated)</label>
            <input
              value={form.tags}
              onChange={e => handleChange('tags', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="family, outdoor, free"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.registration_required}
                onChange={e => handleChange('registration_required', e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
              Registration required
            </label>
          </div>

          {form.registration_required && (
            <div>
              <label className="text-xs font-semibold text-foreground">Registration URL</label>
              <input
                value={form.registration_url}
                onChange={e => handleChange('registration_url', e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://..."
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive bg-destructive/5 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Verified Event'}
          </button>
        </form>
      </div>
    </>,
    document.body
  );
}