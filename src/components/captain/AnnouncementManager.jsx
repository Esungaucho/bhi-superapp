import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Trash2, X, Camera, Megaphone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ANNOUNCEMENT_TYPES = [
  { id: 'special_trip', label: 'Special Trip', emoji: '🎯' },
  { id: 'seasonal_opportunity', label: 'Seasonal Opportunity', emoji: '🐟' },
  { id: 'last_minute_opening', label: 'Last-Minute Opening', emoji: '⚡' },
  { id: 'general', label: 'General', emoji: '📢' },
];

const TYPE_META = Object.fromEntries(ANNOUNCEMENT_TYPES.map(t => [t.id, t]));

export default function AnnouncementManager({ charter }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['captainAnnouncements', charter.id],
    queryFn: () => base44.entities.CaptainAnnouncement.filter({ charter_id: charter.id }, '-created_date'),
  });

  const [form, setForm] = useState({
    title: '',
    body: '',
    announcement_type: 'special_trip',
    image_url: '',
    valid_until: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set('image_url', file_url);
    } catch (e) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.CaptainAnnouncement.create({
        ...form,
        charter_id: charter.id,
        captain_name: charter.captain_name,
        owner_email: charter.owner_email,
        is_active: true,
      });
      toast({ title: 'Announcement posted!' });
      setForm({ title: '', body: '', announcement_type: 'special_trip', image_url: '', valid_until: '' });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['captainAnnouncements', charter.id] });
    } catch (e) {
      toast({ title: 'Failed to post announcement', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, current) => {
    await base44.entities.CaptainAnnouncement.update(id, { is_active: !current });
    queryClient.invalidateQueries({ queryKey: ['captainAnnouncements', charter.id] });
  };

  const handleDelete = async (id) => {
    await base44.entities.CaptainAnnouncement.delete(id);
    queryClient.invalidateQueries({ queryKey: ['captainAnnouncements', charter.id] });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base text-foreground">Announcements</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-xs font-medium text-accent">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Close' : 'New Post'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Type</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {ANNOUNCEMENT_TYPES.map(t => (
                <button key={t.id} onClick={() => set('announcement_type', t.id)}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-full border ${form.announcement_type === t.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Fall King Mackerel Run Starting!"
              className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Details</label>
            <textarea value={form.body} onChange={e => set('body', e.target.value)} placeholder="Share the details..."
              className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Valid Until</label>
              <input type="date" value={form.valid_until} onChange={e => set('valid_until', e.target.value)}
                className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Image</label>
              <label className="flex items-center gap-1.5 text-xs font-medium border border-border rounded-lg px-3 py-2 cursor-pointer hover:bg-secondary mt-1">
                <Camera className="w-3.5 h-3.5" /> {uploading ? '...' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
              </label>
            </div>
          </div>
          {form.image_url && <img src={form.image_url} alt="preview" className="w-full h-32 rounded-lg object-cover" />}
          <button onClick={handleCreate} disabled={saving}
            className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />} Post Announcement
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
      ) : announcements.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No announcements yet. Post a special trip or seasonal update!</p>
      ) : (
        <div className="space-y-2">
          {announcements.map(a => {
            const meta = TYPE_META[a.announcement_type] || TYPE_META.general;
            return (
              <div key={a.id} className={`bg-card rounded-xl border p-3 ${a.is_active ? 'border-border' : 'border-border opacity-50'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-accent">{meta.emoji} {meta.label}</span>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{a.title}</p>
                    {a.body && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.body}</p>}
                  </div>
                  {a.image_url && <img src={a.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
                </div>
                {a.valid_until && <p className="text-[10px] text-muted-foreground mt-1">Valid until {new Date(a.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>}
                <div className="flex gap-1.5 mt-2">
                  <button onClick={() => toggleActive(a.id, a.is_active)} className="text-[10px] font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {a.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="text-[10px] font-medium px-2 py-1 rounded-full bg-gray-100 text-red-500 flex items-center gap-0.5 ml-auto">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}