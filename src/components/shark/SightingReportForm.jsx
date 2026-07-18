import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2, Upload, Fish } from 'lucide-react';
import { OBSERVER_TYPES } from '@/lib/sharkConstants';

export default function SightingReportForm({ onClose, user }) {
  const [form, setForm] = useState({
    location_name: '',
    latitude: '',
    longitude: '',
    sighting_date: '',
    distance_from_shore: '',
    description: '',
    observer_type: 'beachgoer',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.location_name || !form.sighting_date) {
      setError('Please provide a location and date/time.');
      return;
    }

    setSubmitting(true);
    try {
      let photo_url = null;
      if (photoFile) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file: photoFile });
        photo_url = uploadRes.file_url;
      }

      await base44.entities.SharkSighting.create({
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        sighting_date: new Date(form.sighting_date).toISOString(),
        photo_url,
        status: 'community_report',
        reporter_email: user?.email || '',
        reporter_name: user?.full_name || '',
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit sighting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
      <header className="flex items-center justify-between px-5 h-14 border-b border-border/30 flex-shrink-0">
        <h2 className="font-heading text-base text-foreground">Report a Shark Sighting</h2>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-sand/50 transition-colors">
          <X className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-4">
        <div>
          <label className="text-[11px] font-medium tracking-luxe-xs uppercase text-muted-foreground mb-1.5 block">Location *</label>
          <input className="input-base" placeholder="e.g. South Beach, near Cape Fear" value={form.location_name} onChange={set('location_name')} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium tracking-luxe-xs uppercase text-muted-foreground mb-1.5 block">Latitude (optional)</label>
            <input className="input-base" type="number" step="any" placeholder="33.86" value={form.latitude} onChange={set('latitude')} />
          </div>
          <div>
            <label className="text-[11px] font-medium tracking-luxe-xs uppercase text-muted-foreground mb-1.5 block">Longitude (optional)</label>
            <input className="input-base" type="number" step="any" placeholder="-77.98" value={form.longitude} onChange={set('longitude')} />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium tracking-luxe-xs uppercase text-muted-foreground mb-1.5 block">Date &amp; Time *</label>
          <input className="input-base" type="datetime-local" value={form.sighting_date} onChange={set('sighting_date')} required />
        </div>

        <div>
          <label className="text-[11px] font-medium tracking-luxe-xs uppercase text-muted-foreground mb-1.5 block">Estimated Distance from Shore</label>
          <input className="input-base" placeholder="e.g. 50 yards, 1 mile offshore" value={form.distance_from_shore} onChange={set('distance_from_shore')} />
        </div>

        <div>
          <label className="text-[11px] font-medium tracking-luxe-xs uppercase text-muted-foreground mb-1.5 block">Observer Type</label>
          <select className="input-base" value={form.observer_type} onChange={set('observer_type')}>
            {OBSERVER_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-medium tracking-luxe-xs uppercase text-muted-foreground mb-1.5 block">Description</label>
          <textarea className="input-base min-h-[100px] resize-none" placeholder="Species, estimated size, behavior, direction of travel..." value={form.description} onChange={set('description')} />
        </div>

        <div>
          <label className="text-[11px] font-medium tracking-luxe-xs uppercase text-muted-foreground mb-1.5 block">Photo or Video</label>
          <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-xl px-4 py-3.5 hover:bg-sand/30 transition-colors">
            <Upload className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground truncate">{photoFile ? photoFile.name : 'Tap to upload a photo or video'}</span>
            <input type="file" accept="image/*,video/*" className="hidden" onChange={e => setPhotoFile(e.target.files[0])} />
          </label>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm text-destructive">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-medium text-sm tracking-luxe-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : <Fish className="w-4 h-4" strokeWidth={1.5} />}
          {submitting ? 'Submitting...' : 'Submit Sighting'}
        </button>
      </form>
    </div>
  );
}