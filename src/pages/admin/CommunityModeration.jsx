import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2, Pin, PinOff, EyeOff, Eye, Check, Trash2, Flag } from 'lucide-react';
import { CATEGORIES, getCategory } from '@/lib/communityCategories';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'reported', label: 'Reported' },
  { id: 'hidden', label: 'Hidden' },
  { id: 'pinned', label: 'Pinned' },
];

export default function CommunityModeration() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('all');

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['adminCommunityPosts'],
    queryFn: () => base44.entities.CommunityPost.filter({}, '-created_date', 100),
  });

  const filtered = useMemo(() => {
    if (tab === 'reported') return posts.filter(p => (p.report_count || 0) > 0 && !p.is_hidden);
    if (tab === 'hidden') return posts.filter(p => p.is_hidden);
    if (tab === 'pinned') return posts.filter(p => p.is_pinned);
    return posts;
  }, [posts, tab]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['adminCommunityPosts'] });
    queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
  };

  const handleAction = async (post, action) => {
    if (action === 'delete') {
      await base44.entities.CommunityPost.delete(post.id);
    } else if (action === 'pin') {
      await base44.entities.CommunityPost.update(post.id, { is_pinned: true });
    } else if (action === 'unpin') {
      await base44.entities.CommunityPost.update(post.id, { is_pinned: false });
    } else if (action === 'hide') {
      await base44.entities.CommunityPost.update(post.id, { is_hidden: true });
    } else if (action === 'show') {
      await base44.entities.CommunityPost.update(post.id, { is_hidden: false });
    } else if (action === 'approve') {
      await base44.entities.CommunityPost.update(post.id, { is_hidden: false, report_count: 0 });
    }
    refresh();
  };

  if (!user) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (user.role !== 'admin') {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-sm font-semibold text-foreground">Admin Access Required</p>
        <p className="text-xs text-muted-foreground mt-1">You need admin permissions to moderate community posts.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-8">
      <div className="flex items-center gap-2 mb-1">
        <Flag className="w-5 h-5 text-accent" />
        <h2 className="font-heading text-xl text-foreground">Community Moderation</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5">Review, pin, hide, or delete community posts</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${tab === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No posts in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <AdminPostCard key={post.id} post={post} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPostCard({ post, onAction }) {
  const cat = getCategory(post.category);
  const authorInitial = post.author_name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className={`bg-card rounded-2xl border border-border p-4 ${post.is_hidden ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-driftwood to-navy flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
          {authorInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{post.author_name}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="text-accent font-medium">{cat.emoji} {cat.label}</span>
            <span>·</span>
            <span>{format(new Date(post.created_date), 'MMM d · h:mm a')}</span>
          </div>
        </div>
        {/* Status badges */}
        <div className="flex gap-1 flex-shrink-0">
          {post.is_pinned && <span className="text-[9px] bg-accent/10 text-accent rounded-full px-2 py-0.5 font-semibold">PINNED</span>}
          {post.is_hidden && <span className="text-[9px] bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-semibold">HIDDEN</span>}
          {(post.report_count > 0) && <span className="text-[9px] bg-rose-50 text-rose-600 rounded-full px-2 py-0.5 font-semibold">{post.report_count} REPORTS</span>}
        </div>
      </div>

      {/* Body */}
      <p className="text-sm text-foreground leading-relaxed mb-2 line-clamp-3">{post.body}</p>
      {post.image_url && <img src={post.image_url} alt="" className="w-full max-h-40 object-cover rounded-lg mb-3" />}

      {/* Admin actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
        {post.is_pinned ? (
          <button onClick={() => onAction(post, 'unpin')} className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground bg-secondary/60 rounded-full px-2.5 py-1.5">
            <PinOff className="w-3.5 h-3.5" /> Unpin
          </button>
        ) : (
          <button onClick={() => onAction(post, 'pin')} className="flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent/80 bg-accent/10 rounded-full px-2.5 py-1.5">
            <Pin className="w-3.5 h-3.5" /> Pin
          </button>
        )}
        {post.is_hidden ? (
          <button onClick={() => onAction(post, 'show')} className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground bg-secondary/60 rounded-full px-2.5 py-1.5">
            <Eye className="w-3.5 h-3.5" /> Show
          </button>
        ) : (
          <button onClick={() => onAction(post, 'hide')} className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground bg-secondary/60 rounded-full px-2.5 py-1.5">
            <EyeOff className="w-3.5 h-3.5" /> Hide
          </button>
        )}
        {post.report_count > 0 && (
          <button onClick={() => onAction(post, 'approve')} className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1.5">
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
        )}
        <button onClick={() => onAction(post, 'delete')} className="flex items-center gap-1 text-[11px] font-medium text-destructive hover:text-destructive/80 bg-destructive/5 rounded-full px-2.5 py-1.5">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}