import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ConciergeBell, Send, Loader2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { CONCIERGE_HELP_TYPES, URGENCY_LEVELS } from '@/lib/eventConstants';
import GlobalMenu from '@/components/GlobalMenu';

export default function EventConciergeHelp() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    help_type: '',
    description: '',
    urgency: 'medium',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['eventConciergeReqs', id],
    queryFn: () => base44.entities.EventConciergeRequest.filter(id ? { event_plan_id: id } : { user_email: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const handleSubmit = async () => {
    if (!form.help_type || !form.description) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.EventConciergeRequest.create({
        ...form,
        event_plan_id: id || undefined,
        user_email: user.email,
        user_name: user.full_name || user.email,
        status: 'open',
      });
      queryClient.invalidateQueries(['eventConciergeReqs', id]);
      toast({ title: 'Request sent', description: 'A Compass Concierge team member will reach out shortly.' });
      setForm({ help_type: '', description: '', urgency: 'medium' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button onClick={() => navigate(id ? `/events/dashboard/${id}` : '/events')} className="p-1 -ml-1 rounded-full hover:bg-sand/60">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="font-heading text-sm text-foreground">Concierge Help</h1>
        <GlobalMenu />
      </div>

      <div className="px-4 py-4 space-y-5 pb-8">
        {/* Hero */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3">
            <ConciergeBell className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <p className="font-heading text-base">How can we help?</p>
          <p className="text-[11px] text-primary-foreground/70 mt-1">Our team is here to reduce complexity and coordinate every detail.</p>
        </div>

        {/* Request form */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-4">
          <div>
            <label className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 block">What do you need help with? *</label>
            <div className="space-y-1.5">
              {CONCIERGE_HELP_TYPES.map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => set('help_type', id)}
                  className={`w-full flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${form.help_type === id ? 'border-accent bg-accent/5' : 'border-border bg-card'}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${form.help_type === id ? 'border-accent bg-accent' : 'border-border'}`}>
                    {form.help_type === id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tell us more *</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              placeholder="Describe what you need help with..."
              className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Urgency</label>
            <div className="grid grid-cols-4 gap-1.5">
              {URGENCY_LEVELS.map(({ id, label, color }) => (
                <button
                  key={id}
                  onClick={() => set('urgency', id)}
                  className={`text-[10px] font-medium py-1.5 rounded-full transition-all ${form.urgency === id ? color + ' ring-1 ring-accent' : 'bg-sand/40 text-muted-foreground'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-primary/90"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={1.5} />} Send to Concierge
          </button>
        </div>

        {/* Previous requests */}
        {requests.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Your Requests</p>
            <div className="space-y-2">
              {requests.map(req => {
                const urgency = URGENCY_LEVELS.find(u => u.id === req.urgency);
                return (
                  <div key={req.id} className="bg-card border border-border/50 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{CONCIERGE_HELP_TYPES.find(t => t.id === req.help_type)?.label || req.help_type}</p>
                      <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${urgency?.color}`}>{urgency?.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{req.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {req.status === 'open' && <span className="flex items-center gap-1 text-[10px] text-amber-600"><Clock className="w-3 h-3" strokeWidth={1.5} /> Open</span>}
                      {req.status === 'in_progress' && <span className="flex items-center gap-1 text-[10px] text-blue-600"><Loader2 className="w-3 h-3" strokeWidth={1.5} /> In Progress</span>}
                      {req.status === 'resolved' && <span className="flex items-center gap-1 text-[10px] text-emerald-600"><CheckCircle2 className="w-3 h-3" strokeWidth={1.5} /> Resolved</span>}
                      <span className="text-[10px] text-muted-foreground ml-auto">{new Date(req.created_date).toLocaleDateString()}</span>
                    </div>
                    {req.admin_response && (
                      <div className="mt-2 bg-accent/5 rounded-lg p-2">
                        <p className="text-[10px] font-medium text-accent">Concierge Response:</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{req.admin_response}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}