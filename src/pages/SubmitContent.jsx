import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ImagePlus, CheckCircle2, Send } from 'lucide-react';
import { CATEGORIES } from '@/lib/communityCategories';

export default function SubmitContent() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const [form, setForm] = useState({ title: '', body: '', category: 'local_guide', location_name: '', image_url: '' });
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunitySubmission.create(data),
    onSuccess: () => {
      setSubmitted(true);
      qc.invalidateQueries({ queryKey: ['communityFeed'] });
    },
  });

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, image_url: file_url }));
    } catch (err) {
      console.error('Upload failed', err);
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    createMutation.mutate({
      ...form,
      author_name: user?.full_name || 'Anonymous',
      author_email: user?.email || '',
    });
  };

  if (submitted) {
    return (
      <div className="px-6 pt-20 text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="font-heading text-xl text-foreground">Submission Received!</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
          Thank you for sharing. Your content will be reviewed for helpfulness and positivity before publishing.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ title: '', body: '', category: 'local_guide', location_name: '', image_url: '' }); }}
          className="mt-6 text-sm font-semibold text-accent bg-accent/10 rounded-full px-5 py-2"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-4 pb-6 space-y-4">
      <div>
        <h2 className="font-heading text-xl text-foreground">Share Island Knowledge</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Guides, hidden gems, wildlife sightings & more</p>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Category</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setForm(f => ({ ...f, category: c.id }))}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-colors ${form.category === c.id ? 'border-accent bg-accent/10' : 'border-border bg-card'}`}
            >
              <span className="text-xl">{c.emoji}</span>
              <span className="text-[10px] font-medium text-foreground">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Title</label>
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Best shelling spot after a storm"
          className="w-full mt-1.5 rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          required
        />
      </div>

      {/* Location */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Location (optional)</label>
        <input
          value={form.location_name}
          onChange={e => setForm(f => ({ ...f, location_name: e.target.value }))}
          placeholder="e.g. South Beach access #42"
          className="w-full mt-1.5 rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Body */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Your Story</label>
        <textarea
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          placeholder="Share your tips, directions, or experience..."
          rows={6}
          className="w-full mt-1.5 rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          required
        />
      </div>

      {/* Image */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Photo (optional)</label>
        {form.image_url ? (
          <div className="relative mt-1.5">
            <img src={form.image_url} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
            <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))} className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs">✕</button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 mt-1.5 border-2 border-dashed border-border rounded-xl py-6 cursor-pointer hover:bg-accent/5 transition-colors">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <ImagePlus className="w-5 h-5 text-muted-foreground" />}
            <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Add a photo'}</span>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={createMutation.isPending || !form.title.trim() || !form.body.trim()}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
      >
        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Submit for Review
      </button>

      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
        Submissions are reviewed by AI and island staff. Only helpful, positive content is published.
      </p>
    </form>
  );
}