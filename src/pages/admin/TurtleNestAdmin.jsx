import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import {
  Loader2, Plus, Send, Eye, EyeOff, Trash2, Edit3, X, MapPin, Bell, Check
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'protected', label: 'Protected' },
  { value: 'hatching_soon', label: 'Hatching Soon' },
  { value: 'hatched', label: 'Hatched' },
  { value: 'inactive', label: 'Inactive' },
];

const SPECIES_OPTIONS = [
  { value: 'loggerhead', label: 'Loggerhead' },
  { value: 'green', label: 'Green Turtle' },
  { value: 'leatherback', label: 'Leatherback' },
  { value: 'kemps_ridley', label: "Kemp's Ridley" },
  { value: 'unknown', label: 'Unknown' },
];

const STATUS_COLORS = {
  active: 'bg-accent/10 text-accent',
  protected: 'bg-ocean/10 text-ocean',
  hatching_soon: 'bg-amber-50 text-amber-700',
  hatched: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-muted text-muted-foreground',
};

export default function TurtleNestAdmin() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingNest, setEditingNest] = useState(null);
  const [alertNest, setAlertNest] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  const [sending, setSending] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: nests = [], isLoading } = useQuery({
    queryKey: ['adminTurtleNests'],
    queryFn: () => base44.entities.TurtleNest.filter({}, '-created_date', 100),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['adminTurtleNests'] });
    queryClient.invalidateQueries({ queryKey: ['turtleNestsPublic'] });
  };

  const handleSendAlert = async () => {
    if (!alertNest) return;
    setSending(true);
    try {
      const response = await base44.functions.invoke('sendTurtleHatchingAlert', {
        nest_id: alertNest.nest_id,
        approximate_location: alertNest.approximate_location,
        custom_message: alertMsg,
      });
      const result = response.data;
      if (result.success) {
        setAlertNest(null);
        setAlertMsg(null);
        queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
        refresh();
      }
    } finally {
      setSending(false);
    }
  };

  if (!user) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (user.role !== 'admin') {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-sm font-semibold text-foreground">Admin Access Required</p>
        <p className="text-xs text-muted-foreground mt-1">Only conservancy admins can manage turtle nests.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-8">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-heading text-xl text-foreground">Turtle Nest Management</h2>
        <button
          onClick={() => { setEditingNest(null); setShowForm(true); }}
          className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full px-3.5 py-2 hover:bg-ocean-deep transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2} /> Add Nest
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-5">{nests.length} nests tracked</p>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : nests.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm font-medium text-foreground">No nests yet</p>
          <p className="text-xs mt-1">Add the first turtle nest to start tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {nests.map(nest => (
            <AdminNestCard
              key={nest.id}
              nest={nest}
              onEdit={() => { setEditingNest(nest); setShowForm(true); }}
              onAlert={() => { setAlertNest(nest); setAlertMsg(null); }}
              onToggleVisibility={() => {
                base44.entities.TurtleNest.update(nest.id, { is_public: !nest.is_public });
                refresh();
              }}
              onDelete={() => {
                base44.entities.TurtleNest.delete(nest.id);
                refresh();
              }}
            />
          ))}
        </div>
      )}

      {showForm && (
        <NestForm
          nest={editingNest}
          onClose={() => { setShowForm(false); setEditingNest(null); }}
          onSaved={() => { setShowForm(false); setEditingNest(null); refresh(); }}
        />
      )}

      {alertNest && (
        <AlertModal
          nest={alertNest}
          message={alertMsg}
          setMessage={setAlertMsg}
          onClose={() => { setAlertNest(null); setAlertMsg(null); }}
          onSend={handleSendAlert}
          sending={sending}
        />
      )}
    </div>
  );
}

function AdminNestCard({ nest, onEdit, onAlert, onToggleVisibility, onDelete }) {
  return (
    <div className={`bg-card rounded-2xl border border-border p-4 ${!nest.is_public ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{nest.nest_id}</p>
            <span className={`text-[9px] font-semibold uppercase rounded-full px-2 py-0.5 ${STATUS_COLORS[nest.status]}`}>
              {nest.status?.replace('_', ' ')}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-2.5 h-2.5" /> {nest.approximate_location}
          </p>
        </div>
        <span className={`text-[9px] font-semibold uppercase rounded-full px-2 py-0.5 ${nest.is_public ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
          {nest.is_public ? 'Public' : 'Hidden'}
        </span>
      </div>

      {nest.estimated_hatch_window_start && (
        <p className="text-[11px] text-muted-foreground mb-2">
          Hatch window: {format(parseISO(nest.estimated_hatch_window_start), 'MMM d')}
          {nest.estimated_hatch_window_end && ` - ${format(parseISO(nest.estimated_hatch_window_end), 'MMM d')}`}
        </p>
      )}

      {nest.safety_notes && (
        <p className="text-xs text-foreground line-clamp-2 mb-2">{nest.safety_notes}</p>
      )}

      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
        <button onClick={onEdit} className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-secondary/60 rounded-full px-2.5 py-1.5 hover:bg-secondary">
          <Edit3 className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={onAlert} className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 rounded-full px-2.5 py-1.5 hover:bg-amber-100">
          <Bell className="w-3.5 h-3.5" /> Send Alert
        </button>
        <button onClick={onToggleVisibility} className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-secondary/60 rounded-full px-2.5 py-1.5 hover:bg-secondary">
          {nest.is_public ? <><EyeOff className="w-3.5 h-3.5" /> Hide</> : <><Eye className="w-3.5 h-3.5" /> Show</>}
        </button>
        <button onClick={onDelete} className="flex items-center gap-1 text-[11px] font-medium text-destructive bg-destructive/5 rounded-full px-2.5 py-1.5 hover:bg-destructive/10">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}

function NestForm({ nest, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [photoUrls, setPhotoUrls] = useState(nest?.photos || []);
  const [uploading, setUploading] = useState(false);
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const [form, setForm] = useState({
    nest_id: nest?.nest_id || '',
    species: nest?.species || 'loggerhead',
    approximate_location: nest?.approximate_location || '',
    beach_zone: nest?.beach_zone || '',
    lat: nest?.lat || '',
    lng: nest?.lng || '',
    date_marked: nest?.date_marked || new Date().toISOString().split('T')[0],
    estimated_hatch_window_start: nest?.estimated_hatch_window_start || '',
    estimated_hatch_window_end: nest?.estimated_hatch_window_end || '',
    status: nest?.status || 'active',
    safety_notes: nest?.safety_notes || '',
    volunteer_notes: nest?.volunteer_notes || '',
    is_public: nest?.is_public ?? true,
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploaded.push(file_url);
      }
      setPhotoUrls(prev => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.nest_id || !form.approximate_location) return;
    setSaving(true);
    try {
      const data = {
        ...form,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        photos: photoUrls,
        created_by_name: user?.full_name || 'Admin',
        created_by_email: user?.email,
      };
      if (nest) {
        await base44.entities.TurtleNest.update(nest.id, data);
      } else {
        await base44.entities.TurtleNest.create(data);
      }
      queryClient.invalidateQueries({ queryKey: ['adminTurtleNests'] });
      queryClient.invalidateQueries({ queryKey: ['turtleNestsPublic'] });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-navy-deep/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-t-3xl sm:rounded-3xl shadow-luxe-lg max-w-sm w-full max-h-[90vh] overflow-y-auto no-scrollbar animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-card px-6 pt-5 pb-3 border-b border-border/40 flex items-center justify-between z-10">
          <h2 className="font-heading text-lg text-foreground">{nest ? 'Edit Nest' : 'Add Turtle Nest'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary/60"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <Field label="Nest ID" required>
            <input value={form.nest_id} onChange={e => set('nest_id', e.target.value)}
              placeholder="e.g. BHI-2026-015"
              className="w-full bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
          </Field>

          <Field label="Species">
            <select value={form.species} onChange={e => set('species', e.target.value)}
              className="w-full bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent">
              {SPECIES_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>

          <Field label="Approximate Beach Location" required>
            <input value={form.approximate_location} onChange={e => set('approximate_location', e.target.value)}
              placeholder="e.g. South Beach, near access #3"
              className="w-full bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
          </Field>

          <Field label="Beach Zone">
            <input value={form.beach_zone} onChange={e => set('beach_zone', e.target.value)}
              placeholder="South Beach / East Beach / West Beach"
              className="w-full bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <input type="number" step="0.0001" value={form.lat} onChange={e => set('lat', e.target.value)}
                placeholder="33.8626"
                className="w-full bg-secondary/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
            </Field>
            <Field label="Longitude">
              <input type="number" step="0.0001" value={form.lng} onChange={e => set('lng', e.target.value)}
                placeholder="-77.9858"
                className="w-full bg-secondary/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
            </Field>
          </div>

          <Field label="Date Marked">
            <input type="date" value={form.date_marked} onChange={e => set('date_marked', e.target.value)}
              className="w-full bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Hatch Window Start">
              <input type="date" value={form.estimated_hatch_window_start} onChange={e => set('estimated_hatch_window_start', e.target.value)}
                className="w-full bg-secondary/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
            </Field>
            <Field label="Hatch Window End">
              <input type="date" value={form.estimated_hatch_window_end} onChange={e => set('estimated_hatch_window_end', e.target.value)}
                className="w-full bg-secondary/50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
            </Field>
          </div>

          <Field label="Status">
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent">
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>

          <Field label="Safety Notes (Public)">
            <textarea value={form.safety_notes} onChange={e => set('safety_notes', e.target.value)} rows={2}
              placeholder="Public safety guidance for this nest"
              className="w-full bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none" />
          </Field>

          <Field label="Volunteer Notes (Internal)">
            <textarea value={form.volunteer_notes} onChange={e => set('volunteer_notes', e.target.value)} rows={2}
              placeholder="Internal notes for conservancy team"
              className="w-full bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none" />
          </Field>

          {/* Photos */}
          <Field label="Photos (if allowed to share)">
            {photoUrls.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {photoUrls.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <button
                      onClick={() => setPhotoUrls(photoUrls.filter((_, idx) => idx !== i))}
                      className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="cursor-pointer flex items-center gap-1.5 text-xs font-medium text-accent">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Add Photos'}
              <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
            </label>
          </Field>

          {/* Visibility */}
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => set('is_public', !form.is_public)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.is_public ? 'bg-accent' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_public ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm font-medium text-foreground">Visible to public</span>
          </label>
        </div>

        <div className="sticky bottom-0 bg-card px-6 pb-6 pt-3 border-t border-border/40 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-secondary text-secondary-foreground rounded-full py-3 text-sm font-semibold hover:bg-secondary/80">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !form.nest_id || !form.approximate_location}
            className="flex-1 bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {nest ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertModal({ nest, message, setMessage, onClose, onSend, sending }) {
  const defaultMsg = `A turtle nest may hatch tonight. Please respect all turtle safety guidelines and join the community in helping the hatchlings safely reach the ocean.`;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-navy-deep/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-t-3xl sm:rounded-3xl shadow-luxe-lg max-w-sm w-full animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-border/40 flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-amber-600">
            <Bell className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div>
            <h2 className="font-heading text-lg text-foreground">Send Hatching Alert</h2>
            <p className="text-xs text-muted-foreground">Nest {nest.nest_id} · {nest.approximate_location}</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-full hover:bg-secondary/60"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="px-6 py-5">
          <p className="text-xs text-muted-foreground mb-2">Alert message (sent as email + pinned community post):</p>
          <textarea
            value={message ?? defaultMsg}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            className="w-full bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          />
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-secondary text-secondary-foreground rounded-full py-3 text-sm font-semibold hover:bg-secondary/80">
            Cancel
          </button>
          <button onClick={onSend} disabled={sending}
            className="flex-1 bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-1.5">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Alert
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}