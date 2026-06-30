import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2, Check, X, Clock, Sparkles } from 'lucide-react';
import { getCategory } from '@/lib/communityCategories';

const STATUS_TABS = [
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'approved', label: 'Approved', icon: Check },
  { id: 'rejected', label: 'Rejected', icon: X },
];

export default function SubmissionReview() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('pending');

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['adminSubmissions', tab],
    queryFn: () => base44.entities.CommunitySubmission.filter({ status: tab }, '-created_date', 50),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CommunitySubmission.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminSubmissions'] }),
  });

  const handleApprove = (id) => updateMutation.mutate({ id, data: { status: 'approved', reviewed_date: new Date().toISOString() } });
  const handleReject = (id) => updateMutation.mutate({ id, data: { status: 'rejected', reviewed_date: new Date().toISOString() } });

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-accent" />
        <h2 className="font-heading text-xl text-foreground">Submission Review</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {STATUS_TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${tab === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm font-medium">No {tab} submissions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(s => {
            const cat = getCategory(s.category);
            const scoreColor = s.ai_score >= 70 ? 'text-emerald-600 bg-emerald-50' : s.ai_score >= 40 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
            return (
              <div key={s.id} className="bg-card rounded-xl border p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-accent">{cat.emoji} {cat.label}</p>
                    <h3 className="text-sm font-semibold text-foreground mt-0.5">{s.title}</h3>
                  </div>
                  {s.ai_score != null && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${scoreColor}`}>
                      AI: {s.ai_score}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{s.body}</p>

                {s.location_name && <p className="text-[11px] text-muted-foreground mb-1">📍 {s.location_name}</p>}
                <p className="text-[11px] text-muted-foreground mb-2">by {s.author_name} · {s.created_date ? format(new Date(s.created_date), 'MMM d') : ''}</p>

                {s.ai_summary && (
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-2 mb-3">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">🤖 {s.ai_summary}</p>
                  </div>
                )}

                {tab === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(s.id)}
                      disabled={updateMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg py-2 hover:bg-emerald-100 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(s.id)}
                      disabled={updateMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg py-2 hover:bg-red-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}