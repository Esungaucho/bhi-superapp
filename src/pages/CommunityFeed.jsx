import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Search } from 'lucide-react';
import { CATEGORIES } from '@/lib/communityCategories';
import PostComposer from '@/components/community/PostComposer';
import PostCard from '@/components/community/PostCard';

export default function CommunityFeed() {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['communityPosts'],
    queryFn: () => base44.entities.CommunityPost.filter({}, '-created_date', 50),
  });

  const filteredPosts = useMemo(() => {
    let result = posts.filter(p => !p.is_hidden);
    if (activeCat !== 'all') {
      result = result.filter(p => p.category === activeCat);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.body?.toLowerCase().includes(q) ||
        p.author_name?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [posts, activeCat, search]);

  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search posts, people, tags..."
          className="w-full bg-card border border-border rounded-full pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Composer */}
      <PostComposer />

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        <button
          onClick={() => setActiveCat('all')}
          className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${activeCat === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}
        >
          All
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${activeCat === c.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}
          >
            <span>{c.emoji}</span> {c.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-2">🏝️</p>
          <p className="font-medium">No posts yet</p>
          <p className="text-sm mt-1">Be the first to share something</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}