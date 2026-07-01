import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, FileText, DollarSign, CalendarHeart, Users, Paperclip, Link2, Loader2 } from 'lucide-react';
import { QUOTE_STATUS_META, VENDOR_CATEGORY_LABELS, BUDGET_LABELS } from '@/lib/eventConstants';
import GlobalMenu from '@/components/GlobalMenu';

export default function EventRequests() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['eventQuotes', id],
    queryFn: () => base44.entities.EventQuoteRequest.filter({ event_plan_id: id }, '-created_date', 100),
    enabled: !!id,
  });

  const updateStatus = async (quoteId, newStatus) => {
    try {
      await base44.entities.EventQuoteRequest.update(quoteId, { status: newStatus });
      queryClient.invalidateQueries(['eventQuotes', id]);
      toast({ title: 'Status updated' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const updatePayment = async (quoteId, newStatus) => {
    try {
      await base44.entities.EventQuoteRequest.update(quoteId, { payment_status: newStatus });
      queryClient.invalidateQueries(['eventQuotes', id]);
      toast({ title: 'Payment status updated' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const pending = quotes.filter(q => q.status === 'pending');
  const quoted = quotes.filter(q => q.status === 'quoted');
  const confirmed = quotes.filter(q => q.status === 'accepted' || q.status === 'booked');

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <button onClick={() => navigate(`/events/dashboard/${id}`)} className="p-1 -ml-1 rounded-full hover:bg-sand/60">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="font-heading text-sm text-foreground">Requests & Quotes</h1>
        <GlobalMenu />
      </div>

      <div className="px-4 py-3">
        <Link to="/events/vendors" className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90">
          <Link2 className="w-4 h-4" strokeWidth={1.5} /> Browse Vendors & Request Quotes
        </Link>
      </div>

      {/* Summary */}
      <div className="px-4 grid grid-cols-3 gap-2 mb-4">
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-amber-500">{pending.length}</p>
          <p className="text-[10px] text-muted-foreground">Awaiting</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-blue-500">{quoted.length}</p>
          <p className="text-[10px] text-muted-foreground">Quoted</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-600">{confirmed.length}</p>
          <p className="text-[10px] text-muted-foreground">Confirmed</p>
        </div>
      </div>

      {/* Quote list */}
      <div className="px-4 pb-8 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">No quote requests yet</p>
            <p className="text-xs text-muted-foreground mt-1">Browse vendors and request quotes for your event</p>
          </div>
        ) : (
          quotes.map(quote => {
            const meta = QUOTE_STATUS_META[quote.status] || QUOTE_STATUS_META.pending;
            return (
              <div key={quote.id} className="bg-card border border-border/50 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{quote.vendor_name}</p>
                    <p className="text-[11px] text-muted-foreground">{VENDOR_CATEGORY_LABELS[quote.vendor_category] || quote.vendor_category}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                </div>

                <div className="space-y-1 text-[11px] text-muted-foreground">
                  {quote.event_date && <div className="flex items-center gap-1.5"><CalendarHeart className="w-3 h-3" strokeWidth={1.5} /> {new Date(quote.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>}
                  {quote.guest_count && <div className="flex items-center gap-1.5"><Users className="w-3 h-3" strokeWidth={1.5} /> {quote.guest_count} guests</div>}
                  {quote.budget && <div className="flex items-center gap-1.5"><DollarSign className="w-3 h-3" strokeWidth={1.5} /> {BUDGET_LABELS[quote.budget]}</div>}
                </div>

                {quote.service_details && <p className="text-xs text-foreground mt-2 bg-sand/30 rounded-lg p-2">{quote.service_details}</p>}

                {quote.special_requests && <p className="text-[11px] text-muted-foreground mt-1 italic">Special: {quote.special_requests}</p>}

                {/* Inspiration photos */}
                {quote.inspiration_photo_urls?.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {quote.inspiration_photo_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-lg overflow-hidden">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Quoted price */}
                {quote.quoted_price && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 mt-2">
                    <p className="text-xs font-medium text-emerald-700">Quoted: ${quote.quoted_price.toLocaleString()}</p>
                    {quote.quoted_details && <p className="text-[11px] text-emerald-600 mt-0.5">{quote.quoted_details}</p>}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-1.5 mt-3">
                  {quote.status === 'quoted' && (
                    <>
                      <button onClick={() => updateStatus(quote.id, 'accepted')} className="flex-1 text-xs bg-emerald-50 text-emerald-700 rounded-full py-1.5 font-medium">Accept Quote</button>
                      <button onClick={() => updateStatus(quote.id, 'declined')} className="flex-1 text-xs bg-muted text-muted-foreground rounded-full py-1.5 font-medium">Decline</button>
                    </>
                  )}
                  {quote.status === 'accepted' && (
                    <>
                      <button onClick={() => updateStatus(quote.id, 'booked')} className="flex-1 text-xs bg-primary text-primary-foreground rounded-full py-1.5 font-medium">Mark as Booked</button>
                      <select
                        value={quote.payment_status || 'not_applicable'}
                        onChange={e => updatePayment(quote.id, e.target.value)}
                        className="text-xs bg-sand/60 rounded-full px-2 py-1.5 outline-none border-0"
                      >
                        {['not_applicable', 'pending', 'deposit_paid', 'paid', 'refunded'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </>
                  )}
                  {quote.status === 'booked' && (
                    <select
                      value={quote.payment_status || 'not_applicable'}
                      onChange={e => updatePayment(quote.id, e.target.value)}
                      className="text-xs bg-sand/60 rounded-full px-2 py-1.5 outline-none border-0"
                    >
                      {['not_applicable', 'pending', 'deposit_paid', 'paid', 'refunded'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}