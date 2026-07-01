import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ImagePlus, Send, X, Heart } from 'lucide-react';
import { CATEGORIES } from '@/lib/communityCategories';
import CommunityGuidelines from './CommunityGuidelines';

const GUIDELINES_KEY = 'bhi_community_guidelines_accepted';

export default function PostComposer() {
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('general_chat');
  const [tagsInput, setTagsInput] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [moderationMsg, setModerationMsg] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  useEffect(() => {
    if (!localStorage.getItem(GUIDELINES_KEY)) {
      setShowGuidelines(true);
    }
  }, []);

  const acceptGuidelines = () => {
    localStorage.setItem(GUIDELINES_KEY, 'true');
    setShowGuidelines(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!body.trim() || !user) return;
    if (!localStorage.getItem(GUIDELINES_KEY)) {
      setShowGuidelines(true);
      return;
    }
    setPosting(true);
    setModerationMsg(null);
    try {
      const tags = tagsInput.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);

      const response = await base44.functions.invoke('moderateCommunityPost', { body: body.trim(), tags });
      const result = response.data;

      if (!result.approved) {
        setModerationMsg(result.reason || 'Your post may not align with our community guidelines.');
        return;
      }

      await base44.entities.CommunityPost.create({
        author_name: user.full_name || 'Anonymous',
        author_email: user.email,
        body: body.trim(),
        category,
        tags,
        image_url: imageUrl,
      });
      setBody('');
      setTagsInput('');
      setImageUrl(null);
      setCategory('general_chat');
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    } finally {
      setPosting(false);
    }
  };

  const authorInitial = user?.full_name?.charAt(0)?.toUpperCase() || '?';
  const firstName = user?.full_name?.split(' ')[0] || '';

  return (
    <>
      {showGuidelines && <CommunityGuidelines onAccept={acceptGuidelines} onClose={() => setShowGuidelines(false)} />}

      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sea-glass to-navy flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {authorInitial}
          </div>
          <div className="flex-1 space-y-3">
            <textarea
              value={body}
              onChange={e => { setBody(e.target.value); setModerationMsg(null); }}
              placeholder={`Share something with the island${firstName ? ', ' + firstName : ''}...`}
              rows={3}
              className="w-full bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />

            {/* Category chips */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`flex-shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${category === c.id ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border'}`}
                >
                  <c.Icon className="w-3 h-3" strokeWidth={1.5} /> {c.label}
                </button>
              ))}
            </div>

            {/* Tags input */}
            <input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Tags (comma separated): turtle, sunset, south beach"
              className="w-full bg-secondary/50 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />

            {/* Image preview */}
            {imageUrl && (
              <div className="relative rounded-xl overflow-hidden">
                <img src={imageUrl} alt="" className="w-full max-h-48 object-cover" />
                <button onClick={() => setImageUrl(null)} className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Moderation message */}
            {moderationMsg && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 flex gap-2 items-start">
                <Heart className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">Let's keep our island helpful and kind.</p>
                  <p className="text-xs text-amber-700 mt-0.5">Please rephrase your post before sharing — {moderationMsg}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <label className="cursor-pointer flex items-center gap-1.5 text-xs font-medium text-accent">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                <span>{uploading ? 'Uploading...' : 'Photo'}</span>
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
              <button
                onClick={handleSubmit}
                disabled={!body.trim() || posting}
                className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full px-4 py-2 disabled:opacity-40 transition-opacity"
              >
                {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}