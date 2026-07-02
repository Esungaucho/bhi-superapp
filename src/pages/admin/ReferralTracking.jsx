import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, GitBranch, CheckCircle2, Clock, XCircle } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';

const STATUS_META = {
  pending: { label: 'Pending', Icon: Clock, className: 'text-amber-600 bg-amber-50' },
  responded: { label: 'Responded', Icon: CheckCircle2, className: 'text-ocean bg-ocean/10' },
  scheduled: { label: 'Scheduled', Icon: CheckCircle2, className: 'text-accent bg-accent/10' },
  closed: { label: 'Closed', Icon: CheckCircle2, className: 'text-emerald-600 bg-emerald-50' },
  expired: { label: 'Expired', Icon: XCircle, className: 'text-muted-foreground bg-sand' },
};

export default function ReferralTracking() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState(null);

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['referralInquiries'],
    queryFn: () => base44.entities.ReferralInquiry.list('-inquiry_date', 200),
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return inquiries;
    return inquiries.filter(i => i.inquiry_status === statusFilter);
  }, [inquiries, statusFilter]);

  const total = inquiries.length;
  const closed = inquiries.filter(i => i.is_closed).length;
  const pending = inquiries.filter(i => i.inquiry_status === 'pending').length;
  const withCode = inquiries.filter(i => i.partner_code).length;

  const toggleClosed = async (i) => {
    await base44.entities.ReferralInquiry.update(i.id, { is_closed: !i.is_closed, inquiry_status: !i.is_closed ? 'closed' : 'pending' });
    queryClient.invalidateQueries(['referralInquiries']);
  };

  return (
    <div className="p-4 pb-8">
      <div className="mb-4">
        <h2 className="font-heading text-lg text-foreground">Referral Tracking</h2>
        <p className="text-xs text-muted-foreground">Track partner referrals & inquiries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard icon={<GitBranch className="w-4 h-4 text-ocean" />} label="Total Inquiries" value={total} />
        <StatCard icon={<Clock className="w-4 h-4 text-amber-500" />} label="Pending" value={pending} />
        <StatCard icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} label="Closed" value={closed} />
        <StatCard icon={<GitBranch className="w-4 h-4 text-accent" />} label="With Code" value={withCode} />
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        <button onClick={() => setStatusFilter(null)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${!statusFilter ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}>All</button>
        {Object.entries(STATUS_META).map(([key, { label }]) => (
          <button key={key} onClick={() => setStatusFilter(statusFilter === key ? null : key)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${statusFilter === key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}>{label}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1} />
          <p className="text-sm">No referral inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(i => {
            const statusMeta = STATUS_META[i.inquiry_status] || STATUS_META.pending;
            return (
              <div key={i.id} className="bg-card border border-border/50 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{i.business_contacted}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{i.business_type?.replace(/_/g, ' ')}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${statusMeta.className}`}>{statusMeta.label}</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-muted-foreground">
                  {i.inquiry_date && <span>{new Date(i.inquiry_date).toLocaleDateString()}</span>}
                  {i.referral_source && <span>Source: {i.referral_source}</span>}
                  {i.partner_code && <span className="font-mono text-accent">Code: {i.partner_code}</span>}
                </div>

                {i.user_name && <p className="text-[10px] text-muted-foreground mt-1">From: {i.user_name}</p>}
                {i.notes && <p className="text-[11px] text-muted-foreground mt-1 italic line-clamp-2">{i.notes}</p>}

                <button onClick={() => toggleClosed(i)} className={`mt-2 text-[11px] font-medium px-2 py-1 rounded ${i.is_closed ? 'text-emerald-600 bg-emerald-50' : 'text-muted-foreground bg-sand'}`}>
                  {i.is_closed ? 'Closed' : 'Mark Closed'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}