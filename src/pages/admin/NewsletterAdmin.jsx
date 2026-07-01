import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Download, Send, Loader2, Mail, Users, Filter, X, Calendar } from 'lucide-react';

const INTEREST_FILTERS = [
  'ferry', 'weather', 'restaurants', 'live_music', 'kids_activities',
  'fishing', 'golf', 'nature', 'wildlife', 'turtle_season',
  'events', 'community', 'emergency', 'shopping', 'lodging_deals',
];

const METHOD_FILTERS = [
  { key: 'notif_email', label: 'Email' },
  { key: 'notif_sms', label: 'SMS' },
  { key: 'notif_push', label: 'Push' },
];

export default function NewsletterAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [interestFilter, setInterestFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [draft, setDraft] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const { data: subs = [], isLoading } = useQuery({
    queryKey: ['newsletterSubscriptions'],
    queryFn: () => base44.entities.NewsletterSubscription.list('-created_date', 500),
  });

  const filtered = useMemo(() => {
    return subs.filter(s => {
      if (s.unsubscribed_at) return false;
      if (search && !s.name?.toLowerCase().includes(search.toLowerCase()) && !s.user_email?.toLowerCase().includes(search.toLowerCase())) return false;
      if (interestFilter && !(s.interests || []).includes(interestFilter)) return false;
      if (methodFilter && !s[methodFilter]) return false;
      return true;
    });
  }, [subs, search, interestFilter, methodFilter]);

  const activeCount = subs.filter(s => !s.unsubscribed_at && s.is_subscribed_to_newsletter).length;
  const emailCount = filtered.filter(s => s.notif_email).length;

  const handleExportCSV = () => {
    const rows = [['Name', 'Email', 'Phone', 'Newsletter', 'Email Notif', 'SMS Notif', 'Push Notif', 'Interests', 'Frequency']];
    filtered.forEach(s => {
      rows.push([
        s.name || '',
        s.user_email || '',
        s.phone_number || '',
        s.is_subscribed_to_newsletter ? 'Yes' : 'No',
        s.notif_email ? 'Yes' : 'No',
        s.notif_sms ? 'Yes' : 'No',
        s.notif_push ? 'Yes' : 'No',
        (s.interests || []).join('; '),
        s.frequency || '',
      ]);
    });
    const csv = rows.map(r => r.map(f => `"${f}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = async () => {
    if (!draft.subject.trim() || !draft.body.trim()) return;
    setSending(true);
    try {
      const recipients = filtered.filter(s => s.notif_email && s.is_subscribed_to_newsletter);
      for (const r of recipients) {
        await base44.integrations.Core.SendEmail({
          to: r.user_email,
          subject: draft.subject,
          body: draft.body,
        });
      }
      setSent(true);
      setTimeout(() => { setSent(false); setShowComposer(false); setDraft({ subject: '', body: '' }); }, 2000);
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setInterestFilter('');
    setMethodFilter('');
  };

  const hasFilters = search || interestFilter || methodFilter;

  return (
    <div className="p-4 pb-8">
      <header className="mb-5">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Mail className="w-5 h-5" /> Newsletter
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Manage subscribers & send updates</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-card border border-border/50 rounded-xl p-3.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-[11px] font-medium uppercase tracking-wide">Subscribers</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{activeCount}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="text-[11px] font-medium uppercase tracking-wide">Email Reach</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{emailCount}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleExportCSV}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-sand/40 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
        <button
          onClick={() => setShowComposer(true)}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          <Send className="w-4 h-4" /> Compose
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={interestFilter}
            onChange={e => setInterestFilter(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-accent"
          >
            <option value="">All Interests</option>
            {INTEREST_FILTERS.map(i => (
              <option key={i} value={i}>{i.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-accent"
          >
            <option value="">All Methods</option>
            {METHOD_FILTERS.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-accent hover:underline">
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Showing {filtered.length} subscriber{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Subscriber list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No subscribers found.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <div key={s.id} className="bg-card border border-border/50 rounded-xl p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{s.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.user_email}</p>
                  {s.phone_number && <p className="text-xs text-muted-foreground">{s.phone_number}</p>}
                </div>
                {s.is_subscribed_to_newsletter ? (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex-shrink-0">Subscribed</span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 flex-shrink-0">Unsubscribed</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {s.notif_email && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">Email</span>}
                {s.notif_sms && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">SMS</span>}
                {s.notif_push && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">Push</span>}
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sand text-muted-foreground capitalize">{(s.frequency || 'immediate').replace('_', ' ')}</span>
              </div>
              {s.interests?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {s.interests.slice(0, 5).map(i => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-sand/60 text-muted-foreground">{i.replace('_', ' ')}</span>
                  ))}
                  {s.interests.length > 5 && <span className="text-[9px] text-muted-foreground">+{s.interests.length - 5}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4" onClick={() => setShowComposer(false)}>
          <div className="bg-card rounded-2xl w-full max-w-md p-5 animate-fade-in max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg text-foreground">Compose Newsletter</h3>
              <button onClick={() => setShowComposer(false)} className="p-1 rounded-lg hover:bg-secondary">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Will be sent to <strong>{emailCount}</strong> email subscribers matching current filters.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">Subject</label>
                <input
                  type="text"
                  value={draft.subject}
                  onChange={e => setDraft({ ...draft, subject: e.target.value })}
                  placeholder="Weekly Island Update"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">Body</label>
                <textarea
                  value={draft.body}
                  onChange={e => setDraft({ ...draft, body: e.target.value })}
                  placeholder="Upcoming events, restaurant specials, ferry updates…"
                  rows={8}
                  className="w-full p-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-accent resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowComposer(false)}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!draft.subject.trim() || !draft.body.trim() || sending || sent}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-40"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? '✓ Sent!' : <><Send className="w-4 h-4" /> Send Now</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}