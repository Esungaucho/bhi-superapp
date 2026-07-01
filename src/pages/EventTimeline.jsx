import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Plus, X, Check, Loader2, Trash2 } from 'lucide-react';
import { TIMELINE_PHASES, TIMELINE_ASSIGNMENTS } from '@/lib/eventConstants';
import GlobalMenu from '@/components/GlobalMenu';

export default function EventTimeline() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);

  const { data: timeline = [], isLoading } = useQuery({
    queryKey: ['eventTimeline', id],
    queryFn: () => base44.entities.EventTimelineItem.filter({ event_plan_id: id }, 'sort_order', 100),
    enabled: !!id,
  });

  const toggleComplete = async (item) => {
    try {
      await base44.entities.EventTimelineItem.update(item.id, { is_completed: !item.is_completed });
      queryClient.invalidateQueries(['eventTimeline', id]);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const updateAssignment = async (item, assignedTo) => {
    try {
      await base44.entities.EventTimelineItem.update(item.id, { assigned_to: assignedTo });
      queryClient.invalidateQueries(['eventTimeline', id]);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await base44.entities.EventTimelineItem.delete(itemId);
      queryClient.invalidateQueries(['eventTimeline', id]);
      toast({ title: 'Task removed' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const grouped = TIMELINE_PHASES.map(phase => ({
    ...phase,
    items: timeline.filter(t => t.phase === phase.id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
  })).filter(g => g.items.length > 0);

  const completedCount = timeline.filter(t => t.is_completed).length;
  const progress = timeline.length > 0 ? Math.round((completedCount / timeline.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button onClick={() => navigate(`/events/dashboard/${id}`)} className="p-1 -ml-1 rounded-full hover:bg-sand/60">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="font-heading text-sm text-foreground">Event Timeline</h1>
        <GlobalMenu />
      </div>

      {/* Progress bar */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-muted-foreground">Planning Progress</p>
          <p className="text-xs font-medium text-foreground">{completedCount}/{timeline.length} tasks</p>
        </div>
        <div className="h-2 bg-sand rounded-full overflow-hidden">
          <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Add button */}
      <div className="px-4 pb-3">
        <button onClick={() => setShowAdd(true)} className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90">
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Task
        </button>
      </div>

      {/* Timeline */}
      <div className="px-4 pb-8 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : grouped.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No timeline items</p>
        ) : (
          grouped.map(phase => {
            const PhaseIcon = phase.Icon;
            const phaseCompleted = phase.items.filter(i => i.is_completed).length;
            return (
              <div key={phase.id}>
                <div className="flex items-center gap-2 mb-2">
                  <PhaseIcon className="w-4 h-4 text-navy" strokeWidth={1.5} />
                  <p className="text-sm font-heading text-foreground">{phase.label}</p>
                  <span className="text-[10px] text-muted-foreground ml-auto">{phaseCompleted}/{phase.items.length}</span>
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-border/30 ml-2">
                  {phase.items.map(item => (
                    <div key={item.id} className={`bg-card border rounded-xl p-3 ml-3 transition-all ${item.is_completed ? 'border-emerald-200 bg-emerald-50/30' : 'border-border/50'}`}>
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => toggleComplete(item)}
                          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.is_completed ? 'border-emerald-500 bg-emerald-500' : 'border-border'}`}
                        >
                          {item.is_completed && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${item.is_completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{item.title}</p>
                          {item.description && <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>}
                          <div className="flex items-center gap-2 mt-1.5">
                            <select
                              value={item.assigned_to}
                              onChange={e => updateAssignment(item, e.target.value)}
                              className="text-[10px] bg-sand/60 rounded-full px-2 py-0.5 outline-none border-0"
                            >
                              {TIMELINE_ASSIGNMENTS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                            </select>
                            {item.assigned_name && <span className="text-[10px] text-muted-foreground">· {item.assigned_name}</span>}
                            {item.due_date && <span className="text-[10px] text-muted-foreground">· {new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                            <button onClick={() => deleteItem(item.id)} className="ml-auto p-0.5 rounded-full hover:bg-destructive/10">
                              <Trash2 className="w-3 h-3 text-destructive" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAdd && <AddTaskModal eventId={id} onClose={() => setShowAdd(false)} onSaved={() => { queryClient.invalidateQueries(['eventTimeline', id]); setShowAdd(false); }} />}
    </div>
  );
}

function AddTaskModal({ eventId, onClose, onSaved }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ phase: 'one_month', title: '', description: '', assigned_to: 'host', assigned_name: '', due_date: '' });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.title) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      await base44.entities.EventTimelineItem.create({ ...form, event_plan_id: eventId, sort_order: 99 });
      toast({ title: 'Task added' });
      onSaved();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-background w-full max-w-md rounded-t-3xl sm:rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="border-b border-border/50 px-4 py-3 flex items-center justify-between">
          <h3 className="font-heading text-base text-foreground">Add Timeline Task</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-sand/60"><X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Phase</label>
            <select value={form.phase} onChange={e => set('phase', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent">
              {TIMELINE_PHASES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Task Title *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Assigned To</label>
              <select value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent">
                {TIMELINE_ASSIGNMENTS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
              <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Assignee Name (optional)</label>
            <input type="text" value={form.assigned_name} onChange={e => set('assigned_name', e.target.value)} placeholder="e.g. Jane Smith, Acme Catering" className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  );
}