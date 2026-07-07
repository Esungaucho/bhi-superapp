import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import {
  Bell, Plus, Send, Trash2, Loader2, X, Check, Clock, Users,
  AlertTriangle, Megaphone, Calendar, Edit3, Ban
} from 'lucide-react';

const CATEGORIES = [
  { id: 'general', label: 'General', Icon: Bell, badge: 'bg-slate-500/10 text-slate-600' },
  { id: 'ferry', label: 'Ferry', Icon: Users, badge: 'bg-blue-500/10 text-blue-600' },
  { id: 'weather', label: 'Weather', Icon: AlertTriangle, badge: 'bg-amber-500/10 text-amber-600' },
  { id: 'event', label: 'Event', Icon: Calendar, badge: 'bg-purple-500/10 text-purple-600' },
  { id: 'deal', label: 'Deal', Icon: Megaphone, badge: 'bg-emerald-500/10 text-emerald-600' },
  { id: 'community', label: 'Community', Icon: Users, badge: 'bg-teal-500/10 text-teal-600' },
  { id: 'emergency', label: 'Emergency', Icon: AlertTriangle, badge: 'bg-red-500/10 text-red-600' },
  { id: 'island_tip', label: 'Island Tip', Icon: Bell, badge: 'bg-cyan-500/10 text-cyan-600' },
];

const AUDIENCES = [
  { id: 'all_users', label: 'All Users' },
  { id: 'homeowners', label: 'Homeowners' },
  { id: 'visitors', label: 'Visitors' },
  { id: 'newsletter_subscribers', label: 'Newsletter Subscribers' },
  { id: 'event_subscribers', label: 'Event Subscribers' },
];

const STATUS_META = {
  draft: { label: 'Draft', badge: 'bg-muted text-muted-foreground', Icon: Edit3 },
  scheduled: { label: 'Scheduled', badge: 'bg-blue-500/10 text-blue-600', Icon: Clock },
  sent: { label: 'Sent', badge: 'bg-emerald-500/10 text-emerald-600', Icon: Check },
  cancelled: { label: 'Cancelled', badge: 'bg-red-500/10 text-red-600', Icon: Ban },
};

export default function NotificationAdmin() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['pushNotifications', filterStatus],
    queryFn: () => {
      const filter = filterStatus === 'all' ? {} : { status: filterStatus };
      return base44.entities.PushNotification.filter(filter, '-created_date', 50);
    },
  });

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const handleDelete = async (id) => {
    if (!confirm('Delete this notification?')) return;
    await base44.entities.PushNotification.delete(id);
    queryClient.invalidateQueries({ queryKey: ['pushNotifications'] });
  };

  const handleSend = async (notif) => {
    try {
      await base44.entities.PushNotification.update(notif.id, {
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['pushNotifications'] });
    } catch (err) {
      console.error('Failed to send:', err);
    }
  };

  const handleCancel = async (notif) => {
    await base44.entities.PushNotification.update(notif.id, { status: 'cancelled' });
    queryClient.invalidateQueries({ queryKey: ['pushNotifications'] });
  };

  return (
    <div className="px-4 pt-5 pb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl text-foreground">Notifications</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Create & manage custom push notifications</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-4">
        {['all', 'draft', 'scheduled', 'sent', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors capitalize ${
              filterStatus === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-14 text-muted-foreground">
          <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" strokeWidth={1} />
          <p className="text-sm font-medium">No notifications yet</p>
          <p className="text-xs mt-1">Create your first push notification</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map(n => {
            const cat = CATEGORIES.find(c => c.id === n.category) || CATEGORIES[0];
            const status = STATUS_META[n.status] || STATUS_META.draft;
            const StatusIcon = status.Icon;
            const CatIcon = cat.Icon;

            return (
              <div key={n.id} className="bg-card rounded-2xl border border-border p-3.5">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.badge}`}>
                    <CatIcon className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`inline-flex items-center gap-1 text-[9px] rounded-full px-2 py-0.5 font-semibold ${status.badge}`}>
                        <StatusIcon className="w-2.5 h-2.5" /> {status.label}
                      </span>
                      <span className={`text-[9px] rounded-full px-2 py-0.5 font-medium ${cat.badge}`}>{cat.label}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                      <span>{AUDIENCES.find(a => a.id === n.target_audience)?.label || 'All Users'}</span>
                      <span>·</span>
                      <span>{format(new Date(n.created_date), 'MMM d, h:mm a')}</span>
                      {n.sent_at && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600">Sent {format(new Date(n.sent_at), 'MMM d')}</span>
                        </>
                      )}
                      {n.scheduled_for && n.status === 'scheduled' && (
                        <>
                          <span>·</span>
                          <span className="text-blue-600">Sched {format(new Date(n.scheduled_for), 'MMM d, h:mm a')}</span>
                        </>
                      )}
                    </div>
                    {n.action_url && (
                      <p className="text-[10px] text-accent mt-1 truncate">→ {n.action_url}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-border/30">
                  {n.status === 'draft' && (
                    <button
                      onClick={() => handleSend(n)}
                      className="flex items-center gap-1 text-[10px] font-semibold rounded-full px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                    >
                      <Send className="w-3 h-3" /> Send Now
                    </button>
                  )}
                  {n.status === 'scheduled' && (
                    <button
                      onClick={() => handleSend(n)}
                      className="flex items-center gap-1 text-[10px] font-semibold rounded-full px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                    >
                      <Send className="w-3 h-3" /> Send Now
                    </button>
                  )}
                  {(n.status === 'draft' || n.status === 'scheduled') && (
                    <button
                      onClick={() => handleCancel(n)}
                      className="flex items-center gap-1 text-[10px] font-semibold rounded-full px-3 py-1.5 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors"
                    >
                      <Ban className="w-3 h-3" /> Cancel
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="flex items-center gap-1 text-[10px] font-semibold rounded-full px-3 py-1.5 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <NotificationForm
          user={user}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ['pushNotifications'] });
          }}
        />
      )}
    </div>
  );
}

function NotificationForm({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: '',
    body: '',
    category: 'general',
    target_audience: 'all_users',
    action_url: '',
    action_label: '',
    status: 'draft',
    scheduled_for: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and message are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await base44.entities.PushNotification.create({
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        target_audience: form.target_audience,
        action_url: form.action_url || null,
        action_label: form.action_label || null,
        status: form.status,
        scheduled_for: form.status === 'scheduled' && form.scheduled_for ? new Date(form.scheduled_for).toISOString() : null,
        created_by_name: user?.full_name || 'Admin',
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-luxe-lg max-h-[90vh] overflow-y-auto animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
          <h3 className="font-heading text-base text-foreground">New Notification</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-sand/40">
            <X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {error && (
            <div className="bg-destructive/5 text-destructive text-xs rounded-lg px-3 py-2">{error}</div>
          )}

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-luxe-sm text-muted-foreground mb-1.5 block">Title</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              maxLength={100}
              placeholder="e.g. Ferry Delay Alert"
              className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-luxe-sm text-muted-foreground mb-1.5 block">Message</label>
            <textarea
              value={form.body}
              onChange={e => set('body', e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Write your notification message..."
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5 text-right">{form.body.length}/500</p>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-luxe-sm text-muted-foreground mb-1.5 block">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => set('category', c.id)}
                  className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    form.category === c.id
                      ? 'bg-primary text-primary-foreground'
                      : `bg-card border border-border ${c.badge}`
                  }`}
                >
                  <c.Icon className="w-3 h-3" strokeWidth={1.5} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-luxe-sm text-muted-foreground mb-1.5 block">Target Audience</label>
            <select
              value={form.target_audience}
              onChange={e => set('target_audience', e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
            >
              {AUDIENCES.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-luxe-sm text-muted-foreground mb-1.5 block">Action URL (optional)</label>
            <input
              value={form.action_url}
              onChange={e => set('action_url', e.target.value)}
              placeholder="/calendar or https://..."
              className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-luxe-sm text-muted-foreground mb-1.5 block">Action Button Label (optional)</label>
            <input
              value={form.action_label}
              onChange={e => set('action_label', e.target.value)}
              placeholder="e.g. View Event"
              className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-luxe-sm text-muted-foreground mb-1.5 block">Delivery</label>
            <div className="flex gap-2">
              <button
                onClick={() => set('status', 'draft')}
                className={`flex-1 h-10 rounded-xl text-xs font-medium transition-colors ${
                  form.status === 'draft' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                Save as Draft
              </button>
              <button
                onClick={() => set('status', 'scheduled')}
                className={`flex-1 h-10 rounded-xl text-xs font-medium transition-colors ${
                  form.status === 'scheduled' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                Schedule
              </button>
            </div>
          </div>

          {form.status === 'scheduled' && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-luxe-sm text-muted-foreground mb-1.5 block">Send At</label>
              <input
                type="datetime-local"
                value={form.scheduled_for}
                onChange={e => set('scheduled_for', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-accent"
              />
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border/30 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-sand/40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 h-11 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {form.status === 'scheduled' ? 'Schedule' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}