import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import {
  Loader2, Pin, PinOff, EyeOff, Eye, Check, Trash2, Flag, Ban, ShieldOff,
  ShieldCheck, AlertCircle, FileText, Users as UsersIcon
} from 'lucide-react';
import { getCategory } from '@/lib/communityCategories';

const TABS = [
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'reports', label: 'Reports', icon: Flag },
  { id: 'users', label: 'Users', icon: UsersIcon },
];

const REPORT_REASONS = {
  harassment_bullying: 'Harassment or Bullying',
  hate_speech: 'Hate Speech',
  inappropriate_photo: 'Inappropriate Photo',
  spam_scam: 'Spam or Scam',
  misinformation: 'Misinformation',
  unsafe_behavior: 'Unsafe Behavior',
  offensive_language: 'Offensive Language',
  other: 'Other',
};

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700',
  reviewed: 'bg-blue-50 text-blue-700',
  resolved: 'bg-emerald-50 text-emerald-700',
  dismissed: 'bg-muted text-muted-foreground',
};

export default function CommunityModeration() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('posts');

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['adminCommunityPosts'],
    queryFn: () => base44.entities.CommunityPost.filter({}, '-created_date', 100),
  });
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['adminCommunityReports'],
    queryFn: () => base44.entities.CommunityReport.filter({ status: 'pending' }, '-created_date', 100),
  });
  const { data: userStatuses = [], isLoading: usersLoading } = useQuery({
    queryKey: ['adminUserStatuses'],
    queryFn: () => base44.entities.CommunityUserStatus.filter({}, '-created_date', 100),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['adminCommunityPosts'] });
    queryClient.invalidateQueries({ queryKey: ['adminCommunityReports'] });
    queryClient.invalidateQueries({ queryKey: ['adminUserStatuses'] });
    queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
  };

  const handlePostAction = async (post, action) => {
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

  const handleReportAction = async (report, action, adminNotes) => {
    const updates = {
      status: action === 'dismiss' ? 'dismissed' : 'resolved',
      admin_notes: adminNotes || '',
      admin_action_taken: action,
      reviewed_by: user?.email,
      reviewed_date: new Date().toISOString(),
    };
    await base44.entities.CommunityReport.update(report.id, updates);

    // Take action on the content if needed
    if (action === 'content_removed' && report.content_type === 'post') {
      await base44.entities.CommunityPost.update(report.content_id, { is_hidden: true });
    }

    // Take action on the user if needed
    if (['user_warned', 'user_restricted', 'user_banned'].includes(action)) {
      const existing = userStatuses.find(s => s.user_email === report.reported_user_email);
      if (existing) {
        const statusUpdate = {
          warning_count: action === 'user_warned' ? (existing.warning_count || 0) + 1 : existing.warning_count,
          status: action === 'user_warned' ? 'warned' : action === 'user_restricted' ? 'restricted' : 'banned',
          restriction_reason: report.reason_details || report.reason,
        };
        if (action === 'user_restricted') {
          const expires = new Date();
          expires.setDate(expires.getDate() + 7);
          statusUpdate.restriction_expires = expires.toISOString();
        }
        if (action === 'user_banned') {
          statusUpdate.banned_date = new Date().toISOString();
        }
        await base44.entities.CommunityUserStatus.update(existing.id, statusUpdate);
      } else {
        const newStatus = {
          user_email: report.reported_user_email,
          user_name: report.reported_user_name,
          status: action === 'user_warned' ? 'warned' : action === 'user_restricted' ? 'restricted' : 'banned',
          restriction_reason: report.reason_details || report.reason,
          warning_count: action === 'user_warned' ? 1 : 0,
        };
        if (action === 'user_restricted') {
          const expires = new Date();
          expires.setDate(expires.getDate() + 7);
          newStatus.restriction_expires = expires.toISOString();
        }
        if (action === 'user_banned') {
          newStatus.banned_date = new Date().toISOString();
        }
        await base44.entities.CommunityUserStatus.create(newStatus);
      }
    }

    refresh();
  };

  const handleUserAction = async (statusRecord, action) => {
    if (action === 'reinstate') {
      await base44.entities.CommunityUserStatus.update(statusRecord.id, {
        status: 'active',
        restriction_expires: null,
        reinstated_date: new Date().toISOString(),
      });
    } else if (action === 'restrict') {
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      await base44.entities.CommunityUserStatus.update(statusRecord.id, {
        status: 'restricted',
        restriction_expires: expires.toISOString(),
      });
    } else if (action === 'ban') {
      await base44.entities.CommunityUserStatus.update(statusRecord.id, {
        status: 'banned',
        banned_date: new Date().toISOString(),
      });
    } else if (action === 'activate') {
      await base44.entities.CommunityUserStatus.update(statusRecord.id, {
        status: 'active',
        restriction_expires: null,
      });
    }
    refresh();
  };

  if (!user) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  if (user.role !== 'admin') {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-sm font-semibold text-foreground">Admin Access Required</p>
        <p className="text-xs text-muted-foreground mt-1">You need admin permissions to moderate community content.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-8">
      <div className="flex items-center gap-2 mb-1">
        <Flag className="w-5 h-5 text-accent" strokeWidth={1.5} />
        <h2 className="font-heading text-xl text-foreground">Community Moderation</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5">Review posts, reports, and user activity</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                tab === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {t.label}
              {t.id === 'reports' && reports.length > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[9px] rounded-full px-1.5 py-0.5 font-bold">{reports.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Posts Tab */}
      {tab === 'posts' && (
        <PostsTab posts={posts} isLoading={postsLoading} onAction={handlePostAction} />
      )}

      {/* Reports Tab */}
      {tab === 'reports' && (
        <ReportsTab reports={reports} isLoading={reportsLoading} onAction={handleReportAction} />
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <UsersTab userStatuses={userStatuses} isLoading={usersLoading} onAction={handleUserAction} />
      )}
    </div>
  );
}

function PostsTab({ posts, isLoading, onAction }) {
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(() => {
    if (filter === 'reported') return posts.filter(p => (p.report_count || 0) > 0 && !p.is_hidden);
    if (filter === 'hidden') return posts.filter(p => p.is_hidden);
    if (filter === 'pinned') return posts.filter(p => p.is_pinned);
    return posts;
  }, [posts, filter]);

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  if (filtered.length === 0) return <div className="text-center py-16 text-muted-foreground text-sm">No posts in this category</div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {['all', 'reported', 'hidden', 'pinned'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors capitalize ${filter === f ? 'bg-accent text-accent-foreground border-accent' : 'bg-card text-muted-foreground border-border'}`}>
            {f}
          </button>
        ))}
      </div>
      {filtered.map(post => <AdminPostCard key={post.id} post={post} onAction={onAction} />)}
    </div>
  );
}

function ReportsTab({ reports, isLoading, onAction }) {
  const [expandedId, setExpandedId] = useState(null);
  const [notes, setNotes] = useState({});

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  if (reports.length === 0) return <div className="text-center py-16 text-muted-foreground text-sm">No pending reports</div>;

  return (
    <div className="space-y-3">
      {reports.map(report => (
        <div key={report.id} className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-semibold uppercase rounded-full px-2 py-0.5 ${STATUS_COLORS[report.status] || STATUS_COLORS.pending}`}>
                  {report.status}
                </span>
                <span className="text-[10px] text-muted-foreground">{format(new Date(report.created_date), 'MMM d · h:mm a')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{report.reporting_user_name}</span> reported
                <span className="font-semibold text-foreground"> {report.reported_user_name}</span>
              </p>
              <p className="text-[11px] text-accent font-medium mt-0.5">{REPORT_REASONS[report.reason] || report.reason}</p>
            </div>
          </div>

          <div className="bg-secondary/40 rounded-lg px-3 py-2 mb-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{report.content_type} content</p>
            <p className="text-xs text-foreground line-clamp-3">{report.content_snapshot}</p>
          </div>

          {report.reason_details && (
            <p className="text-xs text-muted-foreground mb-2">Details: {report.reason_details}</p>
          )}

          <button
            onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
            className="text-[11px] font-medium text-accent hover:text-accent/80"
          >
            {expandedId === report.id ? 'Hide actions' : 'Take action'}
          </button>

          {expandedId === report.id && (
            <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
              <textarea
                value={notes[report.id] || ''}
                onChange={e => setNotes({ ...notes, [report.id]: e.target.value })}
                placeholder="Admin notes..."
                rows={2}
                className="w-full bg-secondary/50 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              />
              <div className="flex flex-wrap gap-2">
                <button onClick={() => onAction(report, 'content_removed', notes[report.id])}
                  className="flex items-center gap-1 text-[11px] font-medium text-destructive bg-destructive/5 rounded-full px-2.5 py-1.5 hover:bg-destructive/10">
                  <EyeOff className="w-3.5 h-3.5" /> Remove Content
                </button>
                <button onClick={() => onAction(report, 'user_warned', notes[report.id])}
                  className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 rounded-full px-2.5 py-1.5 hover:bg-amber-100">
                  <AlertCircle className="w-3.5 h-3.5" /> Warn User
                </button>
                <button onClick={() => onAction(report, 'user_restricted', notes[report.id])}
                  className="flex items-center gap-1 text-[11px] font-medium text-orange-700 bg-orange-50 rounded-full px-2.5 py-1.5 hover:bg-orange-100">
                  <ShieldOff className="w-3.5 h-3.5" /> Restrict
                </button>
                <button onClick={() => onAction(report, 'user_banned', notes[report.id])}
                  className="flex items-center gap-1 text-[11px] font-medium text-destructive bg-destructive/5 rounded-full px-2.5 py-1.5 hover:bg-destructive/10">
                  <Ban className="w-3.5 h-3.5" /> Ban User
                </button>
                <button onClick={() => onAction(report, 'none', notes[report.id])}
                  className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-secondary/60 rounded-full px-2.5 py-1.5 hover:bg-secondary">
                  <Check className="w-3.5 h-3.5" /> Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function UsersTab({ userStatuses, isLoading, onAction }) {
  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  if (userStatuses.length === 0) return <div className="text-center py-16 text-muted-foreground text-sm">No user restrictions active</div>;

  const statusColors = {
    active: 'bg-emerald-50 text-emerald-700',
    warned: 'bg-amber-50 text-amber-700',
    restricted: 'bg-orange-50 text-orange-700',
    banned: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className="space-y-3">
      {userStatuses.map(s => (
        <div key={s.id} className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{s.user_name}</p>
              <p className="text-[11px] text-muted-foreground">{s.user_email}</p>
            </div>
            <span className={`text-[9px] font-semibold uppercase rounded-full px-2 py-1 ${statusColors[s.status]}`}>
              {s.status}
            </span>
          </div>
          {s.restriction_reason && <p className="text-xs text-muted-foreground mb-1">Reason: {s.restriction_reason}</p>}
          {s.restriction_expires && <p className="text-[11px] text-muted-foreground">Expires: {format(new Date(s.restriction_expires), 'MMM d, h:mm a')}</p>}
          {s.warning_count > 0 && <p className="text-[11px] text-muted-foreground">Warnings: {s.warning_count}</p>}
          {s.admin_notes && <p className="text-[11px] text-muted-foreground mt-1">Notes: {s.admin_notes}</p>}

          <div className="flex flex-wrap gap-2 pt-2 mt-2 border-t border-border/50">
            {s.status === 'banned' ? (
              <button onClick={() => onAction(s, 'reinstate')}
                className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1.5 hover:bg-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5" /> Reinstate
              </button>
            ) : s.status === 'restricted' ? (
              <>
                <button onClick={() => onAction(s, 'activate')}
                  className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1.5 hover:bg-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5" /> Activate
                </button>
                <button onClick={() => onAction(s, 'ban')}
                  className="flex items-center gap-1 text-[11px] font-medium text-destructive bg-destructive/5 rounded-full px-2.5 py-1.5 hover:bg-destructive/10">
                  <Ban className="w-3.5 h-3.5" /> Ban Permanently
                </button>
              </>
            ) : (
              <>
                <button onClick={() => onAction(s, 'restrict')}
                  className="flex items-center gap-1 text-[11px] font-medium text-orange-700 bg-orange-50 rounded-full px-2.5 py-1.5 hover:bg-orange-100">
                  <ShieldOff className="w-3.5 h-3.5" /> Restrict
                </button>
                <button onClick={() => onAction(s, 'ban')}
                  className="flex items-center gap-1 text-[11px] font-medium text-destructive bg-destructive/5 rounded-full px-2.5 py-1.5 hover:bg-destructive/10">
                  <Ban className="w-3.5 h-3.5" /> Ban
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminPostCard({ post, onAction }) {
  const cat = getCategory(post.category);
  const authorInitial = post.author_name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className={`bg-card rounded-2xl border border-border p-4 ${post.is_hidden ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-driftwood to-navy flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
          {authorInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{post.author_name}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="text-accent font-medium">
              {cat.Icon && <cat.Icon className="w-3 h-3 inline" strokeWidth={1.5} />} {cat.label}
            </span>
            <span>·</span>
            <span>{format(new Date(post.created_date), 'MMM d · h:mm a')}</span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {post.is_pinned && <span className="text-[9px] bg-accent/10 text-accent rounded-full px-2 py-0.5 font-semibold">PINNED</span>}
          {post.is_hidden && <span className="text-[9px] bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-semibold">HIDDEN</span>}
          {(post.report_count > 0) && <span className="text-[9px] bg-rose-50 text-rose-600 rounded-full px-2 py-0.5 font-semibold">{post.report_count} REPORTS</span>}
        </div>
      </div>

      <p className="text-sm text-foreground leading-relaxed mb-2 line-clamp-3">{post.body}</p>
      {post.image_url && <img src={post.image_url} alt="" className="w-full max-h-40 object-cover rounded-lg mb-3" />}

      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
        {post.is_pinned ? (
          <button onClick={() => onAction(post, 'unpin')} className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-secondary/60 rounded-full px-2.5 py-1.5">
            <PinOff className="w-3.5 h-3.5" /> Unpin
          </button>
        ) : (
          <button onClick={() => onAction(post, 'pin')} className="flex items-center gap-1 text-[11px] font-medium text-accent bg-accent/10 rounded-full px-2.5 py-1.5">
            <Pin className="w-3.5 h-3.5" /> Pin
          </button>
        )}
        {post.is_hidden ? (
          <button onClick={() => onAction(post, 'show')} className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-secondary/60 rounded-full px-2.5 py-1.5">
            <Eye className="w-3.5 h-3.5" /> Show
          </button>
        ) : (
          <button onClick={() => onAction(post, 'hide')} className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-secondary/60 rounded-full px-2.5 py-1.5">
            <EyeOff className="w-3.5 h-3.5" /> Hide
          </button>
        )}
        {post.report_count > 0 && (
          <button onClick={() => onAction(post, 'approve')} className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1.5">
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
        )}
        <button onClick={() => onAction(post, 'delete')} className="flex items-center gap-1 text-[11px] font-medium text-destructive bg-destructive/5 rounded-full px-2.5 py-1.5">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}