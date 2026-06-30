import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2, MapPin, Plus } from 'lucide-react';
import { CATEGORIES } from '@/lib/communityCategories';

export default function CommunityFeed() {
  const [activeCat, setActiveCat] = useState('all');

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['communityFeed', activeCat],
    queryFn: () => base44.entities.CommunitySubmission.filter(
      activeCat === 'all' ? { status: 'approved' } : { status: 'approved', category: activeCat },
      '-created_date', 50
    ),
  });

  const featured = submissions.filter(s => s.is_featured).slice(0, 1);
  const rest = featured.length > 0 ? submissions.filter(s => !s.is_featured) : submissions;

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl text-foreground">Local Insights</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Community-curated island knowledge</p>
        </div>
        <Link to="/community/submit" className="flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 rounded-full px-3 py-1.5">
          <Plus className="w-3.5 h-3.5" /> Share
        </Link>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4">
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

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-2">🏝️</p>
          <p className="font-medium">No stories yet</p>
          <p className="text-sm mt-1">Be the first to share island knowledge</p>
        </div>
      ) : (
        <div className="space-y-3 mt-3">
          {featured.map(s => <FeaturedCard key={s.id} sub={s} />)}
          {rest.map(s => <FeedCard key={s.id} sub={s} />)}
        </div>
      )}
    </div>
  );
}

function FeaturedCard({ sub }) {
  const cat = CATEGORIES.find(c => c.id === sub.category);
  return (
    <Link to={`/community/${sub.id}`} className="block">
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        {sub.image_url ? (
          <img src={sub.image_url} alt={sub.title} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-sea-glass/30 to-navy/20 flex items-center justify-center">
            <span className="text-5xl">{cat?.emoji || '📋'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent" />
        <div className="absolute bottom-0 p-4 text-white">
          <span className="inline-block text-[10px] font-bold uppercase tracking-luxe-sm bg-accent/80 rounded-full px-2 py-0.5 mb-2">⭐ Featured</span>
          <p className="text-[10px] uppercase tracking-wide text-white/70">{cat?.emoji} {cat?.label}</p>
          <h3 className="font-heading text-lg leading-tight mt-1">{sub.title}</h3>
          <p className="text-xs text-white/70 mt-1 line-clamp-2">{sub.body}</p>
        </div>
      </div>
    </Link>
  );
}

function FeedCard({ sub }) {
  const cat = CATEGORIES.find(c => c.id === sub.category);
  return (
    <Link to={`/community/${sub.id}`} className="block bg-card rounded-xl border p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        {sub.image_url ? (
          <img src={sub.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{cat?.emoji || '📋'}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-accent">{cat?.emoji} {cat?.label}</p>
          <h3 className="text-sm font-semibold text-foreground mt-0.5 line-clamp-1">{sub.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{sub.body}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
            {sub.location_name && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {sub.location_name}</span>}
            <span>by {sub.author_name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}