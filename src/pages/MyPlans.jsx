import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { format, parseISO, isSameDay } from 'date-fns';
import { Plus, Trash2, X, ExternalLink, Bell, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'ferry', label: 'Ferry', color: 'bg-ocean/10 text-ocean' },
  { value: 'dining', label: 'Dining', color: 'bg-amber-50 text-amber-700' },
  { value: 'event', label: 'Event', color: 'bg-purple-50 text-purple-700' },
  { value: 'babysitting', label: 'Babysitting', color: 'bg-pink-50 text-pink-700' },
  { value: 'shopping', label: 'Shopping', color: 'bg-blue-50 text-blue-700' },
  { value: 'delivery', label: 'Delivery', color: 'bg-teal-50 text-teal-700' },
  { value: 'rental', label: 'Rental', color: 'bg-indigo-50 text-indigo-700' },
  { value: 'transportation', label: 'Transportation', color: 'bg-cyan-50 text-cyan-700' },
  { value: 'beach', label: 'Beach', color: 'bg-yellow-50 text-yellow-700' },
  { value: 'concierge', label: 'Concierge', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'other', label: 'Other', color: 'bg-secondary text-muted-foreground' },
];

const catMeta = (val) => CATEGORIES.find(c => c.value === val) || CATEGORIES[CATEGORIES.length - 1];

export default function MyPlans() {
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['planItems'],
    queryFn: () => base44.entities.PlanItem.list('-date'),
  });

  const { data: savedEvents = [] } = useQuery({
    queryKey: ['savedEventsForPlans'],
    queryFn: async () => {
      try { return await base44.entities.SavedEvent.list(); } catch { return []; }
    },
  });

  const { data: conciergeReqs = [] } = useQuery({
    queryKey: ['conciergeReqsForPlans'],
    queryFn: async () => {
      try { return await base44.entities.ConciergeRequest.list('-created_date', 5); } catch { return []; }
    },
  });

  const filtered = filterDate
    ? plans.filter(p => p.date && isSameDay(parseISO(p.date), parseISO(filterDate)))
    : plans;

  const grouped = {};
  for (const p of filtered) {
    const key = p.date || 'No date';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  const sortedDates = Object.keys(grouped).sort((a, b) => {
    if (a === 'No date') return 1;
    if (b === 'No date') return -1;
    return new Date(a) - new Date(b);
  });

  const handleDelete = async (id) => {
    await base44.entities.PlanItem.delete(id);
    queryClient.invalidateQueries({ queryKey: ['planItems'] });
  };

  return (
    <div className="px-4 pt-5 pb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-heading text-xl text-foreground">My Plans</h1>
          <p className="text-xs text-muted-foreground">Your complete trip itinerary</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-4 py-2.5 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Plan
        </button>
      </div>

      <div className="mb-5">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {filterDate && (
          <button onClick={() => setFilterDate('')} className="text-[10px] text-muted-foreground mt-1.5 ml-1">Clear filter</button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">No plans yet. Tap "Add Plan" to start building your itinerary.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(dateKey => (
            <div key={dateKey}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-2.5">
                {dateKey === 'No date' ? 'No Date' : format(parseISO(dateKey), 'EEEE, MMM d')}
              </p>
              <div className="space-y-2">
                {grouped[dateKey].map(item => (
                  <PlanCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {conciergeReqs.length > 0 && (
        <div className="mt-8">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-2.5">Concierge Requests</p>
          <div className="space-y-2">
            {conciergeReqs.map(req => (
              <div key={req.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{req.item_requested || req.category}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{req.status?.replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {savedEvents.length > 0 && (
        <div className="mt-8">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-2.5">Saved Events</p>
          <p className="text-xs text-muted-foreground">{savedEvents.length} saved event{savedEvents.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {showForm && <PlanForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function PlanCard({ item, onDelete }) {
  const meta = catMeta(item.category);
  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-luxe-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[9px] rounded-full px-2 py-0.5 font-semibold ${meta.color}`}>{meta.label}</span>
            {item.reminder_enabled && <Bell className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />}
          </div>
          <p className="text-sm font-semibold text-foreground">{item.title}</p>
          {item.time && (
            <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3" strokeWidth={1.5} /> {item.time}
            </div>
          )}
          {item.location && (
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
              <MapPin className="w-3 h-3" strokeWidth={1.5} /> {item.location}
            </div>
          )}
          {item.notes && <p className="text-[11px] text-muted-foreground mt-1.5">{item.notes}</p>}
          {item.confirmation_link && (
            <a href={item.confirmation_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary mt-1.5 hover:underline">
              <ExternalLink className="w-3 h-3" strokeWidth={1.5} /> Confirmation
            </a>
          )}
        </div>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive">
          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

function PlanForm({ onClose }) {
  const [form, setForm] = useState({ title: '', category: 'other', date: '', time: '', location: '', notes: '', confirmation_link: '', reminder_enabled: false });
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      await base44.entities.PlanItem.create({ user_email: '', ...form });
      queryClient.invalidateQueries({ queryKey: ['planItems'] });
      onClose();
    } catch {
      alert('Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-card rounded-t-2xl sm:rounded-2xl p-5 max-w-sm w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg text-foreground">Add Plan Item</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} /></button>
        </div>
        <div className="space-y-3">
          <Field label="Title">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Ferry to BHI" className="input-base" />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-base">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <div className="flex gap-3">
            <Field label="Date" className="flex-1">
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-base" />
            </Field>
            <Field label="Time" className="flex-1">
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="input-base" />
            </Field>
          </div>
          <Field label="Location">
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Deep Point Marina" className="input-base" />
          </Field>
          <Field label="Confirmation Number / Link">
            <input value={form.confirmation_link} onChange={e => setForm({ ...form, confirmation_link: e.target.value })} placeholder="Booking ref or URL" className="input-base" />
          </Field>
          <Field label="Notes">
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="input-base resize-none" />
          </Field>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.reminder_enabled} onChange={e => setForm({ ...form, reminder_enabled: e.target.checked })} className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm text-foreground">Send reminder</span>
          </label>
        </div>
        <button onClick={handleSubmit} disabled={saving || !form.title} className="w-full mt-5 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Plan'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}