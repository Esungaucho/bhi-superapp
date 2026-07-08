import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { Users, MessageCircle, ChevronRight, HelpCircle, Tag } from 'lucide-react';

const CATEGORY_META = {
  question: { icon: HelpCircle, label: 'Question', color: 'text-blue-600 bg-blue-50' },
  lost_found: { icon: Tag, label: 'Lost & Found', color: 'text-amber-600 bg-amber-50' },
  announcement: { icon: MessageCircle, label: 'Announcement', color: 'text-accent bg-accent/8' },
  recommendation: { icon: Users, label: 'Community', color: 'text-purple-600 bg-purple-50' },
};

export default function CommunityPreview() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['communityPostsDashboard'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 4),
  });

  if (isLoading || posts.length === 0) return null;

  return (
    <section className="px-5 mt-8">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-heading text-lg text-foreground">Island Community</h2>
        <Link to="/community" className="text-[11px] font-medium text-accent tracking-luxe-xs uppercase hover:underline">
          All Posts
        </Link>
      </div>
      <div className="bg-card border border-border/40 rounded-2xl divide-y divide-border/30 shadow-luxe-sm">
        {posts.map(post => {
          const cat = post.category ? CATEGORY_META[post.category] || CATEGORY_META.announcement : CATEGORY_META.announcement;
          const CatIcon = cat.icon;
          return (
            <Link key={post.id} to={`/community/${post.id}`} className="flex items-start gap-3 p-3.5 hover:bg-sand/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
              <span className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${cat.color}`}>
                <CatIcon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{post.title || post.content?.slice(0, 60)}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{post.content}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {post.author_name || 'Island neighbor'} · {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 mt-1" strokeWidth={1.5} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}