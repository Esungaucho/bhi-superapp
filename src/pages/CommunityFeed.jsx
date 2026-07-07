import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, ChevronDown, Check } from 'lucide-react';
import { CATEGORIES } from '@/lib/communityCategories';
import PostComposer from '@/components/community/PostComposer';
import PostCard from '@/components/community/PostCard';

export default function CommunityFeed() {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [catOpen, setCatOpen] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['communityPosts'],
    queryFn: () => base44.entities.CommunityPost.filter({}, '-created_date', 50),
  });

  const { data: blocks = [] } = useQuery({
    queryKey: ['userBlocks', user?.email],
    queryFn: () => base44.entities.UserBlock.filter({ blocker_email: user.email }),
    enabled: !!user?.email,
  });

  const blockedEmails = blocks.map(b => b.blocked_email);

  const { pinnedPosts, regularPosts } = useMemo(() => {
    let visible = posts.filter(p => !p.is_hidden);
    if (activeCat !== 'all') {
      visible = visible.filter(p => p.category === activeCat);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      visible = visible.filter(p =>
        p.body?.toLowerCase().includes(q) ||
        p.author_name?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return {
      pinnedPosts: visible.filter(p => p.is_pinned),
      regularPosts: visible.filter(p => !p.is_pinned),
    };
  }, [posts, activeCat, search]);

  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search posts, people, tags..."
          className="w-full bg-card border border-border rounded-full pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Category dropdown */}
      <div className="relative">
        <button
          onClick={() => setCatOpen(o => !o)}
          className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-sand/30"
        >
          <span className="flex items-center gap-2">
            {(() => {
              if (activeCat === 'all') return 'All Posts';
              const c = CATEGORIES.find(c => c.id === activeCat);
              return c ? c.label : 'All Posts';
            })()}
          </span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${catOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
        </button>

        {catOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setCatOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-luxe-lg z-50 max-h-72 overflow-y-auto no-scrollbar">
              <button
                onClick={() => { setActiveCat('all'); setCatOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-sand/40 ${activeCat === 'all' ? 'text-primary font-medium' : 'text-foreground'}`}
              >
                All Posts
                {activeCat === 'all' && <Check className="w-4 h-4" strokeWidth={1.5} />}
              </button>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setActiveCat(c.id); setCatOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-sand/40 ${activeCat === c.id ? 'text-primary font-medium' : 'text-foreground'}`}
                >
                  <span className="flex items-center gap-2">
                    <c.Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} /> {c.label}
                  </span>
                  {activeCat === c.id && <Check className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Composer */}
      <PostComposer />

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : pinnedPosts.length === 0 && regularPosts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-medium text-foreground">No posts yet</p>
          <p className="text-sm mt-1">Be the first to share something with the island</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pinnedPosts.map(post => <PostCard key={post.id} post={post} blockedEmails={blockedEmails} />)}
          {regularPosts.map(post => <PostCard key={post.id} post={post} blockedEmails={blockedEmails} />)}
        </div>
      )}
    </div>
  );
}