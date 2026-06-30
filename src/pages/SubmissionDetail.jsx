import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2, MapPin, Calendar, User } from 'lucide-react';
import { getCategory } from '@/lib/communityCategories';

export default function SubmissionDetail() {
  const { id } = useParams();
  const { data: sub, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => base44.entities.CommunitySubmission.get(id),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  if (!sub || sub.status !== 'approved') {
    return (
      <div className="px-6 py-20 text-center text-muted-foreground">
        <p className="text-4xl mb-2">🔍</p>
        <p className="font-medium">Content not available</p>
        <Link to="/community" className="inline-block mt-4 text-sm font-semibold text-accent">← Back to feed</Link>
      </div>
    );
  }

  const cat = getCategory(sub.category);

  return (
    <div className="pb-6">
      {/* Hero image */}
      {sub.image_url ? (
        <div className="relative h-56 mx-4 mt-3 rounded-2xl overflow-hidden">
          <img src={sub.image_url} alt={sub.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/60 to-transparent" />
        </div>
      ) : (
        <div className="mx-4 mt-3 h-32 rounded-2xl bg-gradient-to-br from-accent/20 to-navy/10 flex items-center justify-center">
          <span className="text-5xl">{cat.emoji}</span>
        </div>
      )}

      <div className="px-4 mt-4">
        <span className="inline-block text-xs font-bold uppercase tracking-luxe-sm text-accent">{cat.emoji} {cat.label}</span>
        <h1 className="font-heading text-2xl text-foreground mt-1 leading-tight text-balance">{sub.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {sub.author_name}</span>
          {sub.location_name && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {sub.location_name}</span>}
          {sub.created_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(new Date(sub.created_date), 'MMM d, yyyy')}</span>}
        </div>

        {/* Body */}
        <div className="mt-5 prose prose-sm max-w-none">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{sub.body}</p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-border text-center">
          <Link to="/community" className="text-sm font-semibold text-accent">← Back to Community</Link>
        </div>
      </div>
    </div>
  );
}