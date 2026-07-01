import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Trash2, X, Camera, Fish } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CatchManager({ charter }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: catches = [], isLoading } = useQuery({
    queryKey: ['captainCatches', charter.id],
    queryFn: () => base44.entities.CaptainCatch.filter({ charter_id: charter.id }, '-catch_date'),
  });

  const [form, setForm] = useState({
    fish_type: '',
    weight_lbs: '',
    length_in: '',
    catch_date: new Date().toISOString().slice(0, 10),
    photo_url: '',
    description: '',
    location_name: charter.location_name || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set('photo_url', file_url);
    } catch (e) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.fish_type || !form.catch_date) {
      toast({ title: 'Fish type and date are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.CaptainCatch.create({
        ...form,
        weight_lbs: form.weight_lbs ? +form.weight_lbs : null,
        length_in: form.length_in ? +form.length_in : null,
        charter_id: charter.id,
        captain_name: charter.captain_name,
        owner_email: charter.owner_email,
      });
      toast({ title: 'Catch posted!' });
      setForm({ fish_type: '', weight_lbs: '', length_in: '', catch_date: new Date().toISOString().slice(0, 10), photo_url: '', description: '', location_name: charter.location_name || '' });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['captainCatches', charter.id] });
    } catch (e) {
      toast({ title: 'Failed to post catch', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.CaptainCatch.delete(id);
    queryClient.invalidateQueries({ queryKey: ['captainCatches', charter.id] });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base text-foreground">Recent Catches</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-xs font-medium text-accent">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Close' : 'Post Catch'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Fish Type</label>
            <input value={form.fish_type} onChange={e => set('fish_type', e.target.value)} placeholder="e.g. Red Drum"
              className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Weight (lbs)</label>
              <input type="number" value={form.weight_lbs} onChange={e => set('weight_lbs', e.target.value)}
                className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Length (in)</label>
              <input type="number" value={form.length_in} onChange={e => set('length_in', e.target.value)}
                className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Date</label>
              <input type="date" value={form.catch_date} onChange={e => set('catch_date', e.target.value)}
                className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Location</label>
            <input value={form.location_name} onChange={e => set('location_name', e.target.value)} placeholder="Where it was caught"
              className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Tell the story..."
              className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none" rows={2} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Photo</label>
            <div className="flex items-center gap-2 mt-1">
              <label className="flex items-center gap-1.5 text-xs font-medium border border-border rounded-lg px-3 py-2 cursor-pointer hover:bg-secondary">
                <Camera className="w-3.5 h-3.5" /> {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
              </label>
              {form.photo_url && <img src={form.photo_url} alt="catch" className="w-12 h-12 rounded-lg object-cover" />}
            </div>
          </div>
          <button onClick={handleCreate} disabled={saving}
            className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fish className="w-4 h-4" />} Post Catch
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
      ) : catches.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No catches posted yet. Share your latest haul!</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {catches.map(c => (
            <div key={c.id} className="bg-card rounded-xl border border-border overflow-hidden">
              {c.photo_url && <img src={c.photo_url} alt={c.fish_type} className="w-full h-28 object-cover" />}
              <div className="p-2.5">
                <p className="text-sm font-semibold text-foreground">{c.fish_type}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(c.catch_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                  {c.weight_lbs && <span>{c.weight_lbs} lbs</span>}
                  {c.length_in && <span>{c.length_in}"</span>}
                </div>
                {c.description && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{c.description}</p>}
                <button onClick={() => handleDelete(c.id)} className="text-red-400 mt-1.5 flex items-center gap-0.5 text-[10px]">
                  <Trash2 className="w-2.5 h-2.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}