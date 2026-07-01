import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  ShieldCheck, Ban, CheckCircle2, XCircle, Loader2, Search, Star, AlertTriangle, FileText, Users
} from 'lucide-react';
import {
  APPROVAL_STATUS_META, BACKGROUND_CHECK_META, BOOKING_STATUS_META
} from '@/lib/babysittingConstants';

export default function BabysittingAdmin() {
  const [tab, setTab] = useState('sitters');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sitters = [], isLoading: sittersLoading } = useQuery({
    queryKey: ['allBabysitters'],
    queryFn: () => base44.asServiceRole.entities.Babysitter.list('-created_date', 100),
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['allBabysitterBookings'],
    queryFn: () => base44.asServiceRole.entities.BabysitterBooking.list('-created_date', 100),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['allBabysitterReviews'],
    queryFn: () => base44.asServiceRole.entities.BabysitterReview.filter({ ai_moderation_status: ['pending', 'flagged', 'escalated'] }),
  });

  const filteredSitters = useMemo(() => {
    return sitters.filter((s) => {
      if (statusFilter !== 'all' && s.approval_status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.first_name?.toLowerCase().includes(q) || s.owner_email?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [sitters, search, statusFilter]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return b.sitter_name?.toLowerCase().includes(q) || b.parent_name?.toLowerCase().includes(q) || b.parent_email?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [bookings, search, statusFilter]);

  const updateSitterStatus = async (sitterId, newStatus) => {
    try {
      await base44.asServiceRole.entities.Babysitter.update(sitterId, { approval_status: newStatus });
      queryClient.invalidateQueries(['allBabysitters']);
      toast({ title: `Sitter ${newStatus}` });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const updateBackgroundCheck = async (sitterId, status) => {
    try {
      await base44.asServiceRole.entities.Babysitter.update(sitterId, { background_check_status: status });
      queryClient.invalidateQueries(['allBabysitters']);
      toast({ title: 'Background check updated' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const updateReviewStatus = async (reviewId, moderationStatus, isVisible, adminStatus) => {
    try {
      await base44.asServiceRole.entities.BabysitterReview.update(reviewId, {
        ai_moderation_status: moderationStatus,
        is_visible: isVisible,
        admin_review_status: adminStatus,
      });
      queryClient.invalidateQueries(['allBabysitterReviews']);
      toast({ title: 'Review updated' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const flaggedReviews = reviews.filter((r) => r.ai_moderation_status === 'flagged' || r.ai_moderation_status === 'escalated');

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-navy" strokeWidth={1.5} />
        <h1 className="font-heading text-lg text-foreground">Babysitting Safety Admin</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{sitters.filter((s) => s.approval_status === 'pending').length}</p>
          <p className="text-[10px] text-muted-foreground">Pending Sitters</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{bookings.filter((b) => b.status === 'disputed').length}</p>
          <p className="text-[10px] text-muted-foreground">Disputed</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-destructive">{flaggedReviews.length}</p>
          <p className="text-[10px] text-muted-foreground">Flagged Reviews</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border/50">
        {[
          { key: 'sitters', label: 'Sitters', Icon: Users },
          { key: 'bookings', label: 'Bookings', Icon: FileText },
          { key: 'reviews', label: 'Reviews', Icon: Star },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setStatusFilter('all'); }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === key ? 'border-accent text-accent' : 'border-transparent text-muted-foreground'
            }`}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            {label}
            {key === 'reviews' && flaggedReviews.length > 0 && (
              <span className="bg-destructive text-white text-[9px] rounded-full px-1.5 py-0.5">{flaggedReviews.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search + filter */}
      {tab !== 'reviews' && (
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-card border border-border/50 rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-border/50 rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="all">All</option>
            {tab === 'sitters'
              ? ['pending', 'approved', 'rejected', 'suspended', 'banned'].map((s) => <option key={s} value={s}>{s}</option>)
              : ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'declined', 'disputed'].map((s) => <option key={s} value={s}>{s}</option>)
            }
          </select>
        </div>
      )}

      {/* Sitters tab */}
      {tab === 'sitters' && (
        <div className="space-y-2">
          {sittersLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
          ) : filteredSitters.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No sitters found.</p>
          ) : (
            filteredSitters.map((sitter) => {
              const meta = APPROVAL_STATUS_META[sitter.approval_status];
              return (
                <div key={sitter.id} className="bg-card border border-border/50 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    {sitter.profile_photo_url ? (
                      <img src={sitter.profile_photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center">
                        <span className="text-sm font-medium text-navy">{sitter.first_name?.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{sitter.first_name} {sitter.last_initial}</p>
                      <p className="text-xs text-muted-foreground">{sitter.owner_email || 'No email'}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${meta?.color}`}>{meta?.label}</span>
                  </div>

                  {/* Private verification status */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-sand/30 rounded-lg p-2">
                    <div className="text-muted-foreground">Legal: <span className="font-medium text-foreground">{sitter.full_legal_name ? 'On file' : 'Missing'}</span></div>
                    <div className="text-muted-foreground">ID: <span className="font-medium text-foreground">{sitter.government_id_url ? 'Uploaded' : 'Missing'}</span></div>
                    <div className="text-muted-foreground">License: <span className="font-medium text-foreground">{sitter.drivers_license_url ? 'Uploaded' : 'Missing'}</span></div>
                    <div className="text-muted-foreground">BG Check: <span className="font-medium text-foreground">{sitter.background_check_url ? 'Uploaded' : 'Missing'}</span></div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs text-muted-foreground">Background:</span>
                    <select
                      value={sitter.background_check_status}
                      onChange={(e) => updateBackgroundCheck(sitter.id, e.target.value)}
                      className={`text-xs border border-border/50 rounded px-2 py-1 outline-none ${BACKGROUND_CHECK_META[sitter.background_check_status]?.color}`}
                    >
                      {['pending', 'passed', 'failed', 'not_required'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5">
                    {sitter.approval_status !== 'approved' && (
                      <button onClick={() => updateSitterStatus(sitter.id, 'approved')} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 font-medium">
                        <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} /> Approve
                      </button>
                    )}
                    {sitter.approval_status !== 'rejected' && (
                      <button onClick={() => updateSitterStatus(sitter.id, 'rejected')} className="flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1 font-medium">
                        <XCircle className="w-3 h-3" strokeWidth={1.5} /> Reject
                      </button>
                    )}
                    {sitter.approval_status !== 'suspended' && (
                      <button onClick={() => updateSitterStatus(sitter.id, 'suspended')} className="flex items-center gap-1 text-xs bg-orange-50 text-orange-600 rounded-full px-2.5 py-1 font-medium">
                        Suspend
                      </button>
                    )}
                    {sitter.approval_status !== 'banned' && (
                      <button onClick={() => updateSitterStatus(sitter.id, 'banned')} className="flex items-center gap-1 text-xs bg-destructive/10 text-destructive rounded-full px-2.5 py-1 font-medium">
                        <Ban className="w-3 h-3" strokeWidth={1.5} /> Ban
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Bookings tab */}
      {tab === 'bookings' && (
        <div className="space-y-2">
          {bookingsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
          ) : filteredBookings.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No bookings found.</p>
          ) : (
            filteredBookings.map((booking) => {
              const meta = BOOKING_STATUS_META[booking.status];
              return (
                <div key={booking.id} className="bg-card border border-border/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{booking.sitter_name}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${meta?.color}`}>{meta?.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{booking.date} · {booking.start_time}–{booking.end_time}</p>
                  <p className="text-xs text-muted-foreground">Parent: {booking.parent_name}</p>
                  <p className="text-xs text-muted-foreground">Payment: {booking.payment_status}</p>
                  {booking.total_cost && <p className="text-xs font-medium text-foreground mt-1">${booking.total_cost.toFixed(2)}</p>}
                  {booking.status === 'disputed' && (
                    <button className="mt-2 text-xs text-destructive font-medium">Resolve Dispute →</button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Reviews tab */}
      {tab === 'reviews' && (
        <div className="space-y-2">
          {reviews.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No reviews pending moderation.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-card border border-border/50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">{review.reviewer_name} → {review.reviewee_name}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    review.ai_moderation_status === 'escalated' ? 'bg-destructive/10 text-destructive' :
                    review.ai_moderation_status === 'flagged' ? 'bg-amber-50 text-amber-600' : 'bg-muted text-muted-foreground'
                  }`}>{review.ai_moderation_status}</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`w-3 h-3 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                {review.written_review && <p className="text-xs text-muted-foreground mb-2">{review.written_review}</p>}
                {review.ai_flag_reason && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 mb-2">
                    <AlertTriangle className="w-3 h-3" strokeWidth={1.5} />
                    <span>{review.ai_flag_reason}</span>
                  </div>
                )}
                <div className="flex gap-1.5">
                  <button onClick={() => updateReviewStatus(review.id, 'approved', true, 'resolved_safe')} className="text-xs bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 font-medium">Approve</button>
                  <button onClick={() => updateReviewStatus(review.id, 'flagged', false, 'resolved_removed')} className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1 font-medium">Remove</button>
                  <button onClick={() => updateReviewStatus(review.id, 'escalated', false, 'under_review')} className="text-xs bg-destructive/10 text-destructive rounded-full px-2.5 py-1 font-medium">Escalate</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}