import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  ShieldCheck, Search, BadgeCheck, Star, X, Loader2, Plus, Trash2,
  ExternalLink, Eye, MousePointerClick, Globe, FileText, TrendingUp,
  DollarSign, Mail, Megaphone
} from 'lucide-react';
import {
  PARTNER_CATEGORIES, PARTNER_CATEGORY_LABELS, PARTNER_SUBCATEGORY_LABELS,
  LISTING_TYPES, LISTING_TYPE_LABELS, PARTNER_STATUS_META,
  REFERRAL_EVENT_TYPES, REFERRAL_EVENT_LABELS,
  WEDDING_INQUIRY_STATUS_META, WEDDING_BUDGET_RANGES
} from '@/lib/conciergeMarketplaceConstants';

export default function PartnersAdmin() {
  const [tab, setTab] = useState('partners');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingPartner, setEditingPartner] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['allPreferredPartners'],
    queryFn: () => base44.asServiceRole.entities.PreferredPartner.list('-created_date', 200),
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['allReferralEvents'],
    queryFn: () => base44.asServiceRole.entities.PartnerReferralEvent.list('-created_date', 200),
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['allWeddingInquiries'],
    queryFn: () => base44.asServiceRole.entities.WeddingInquiry.list('-created_date', 100),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['allPartnerReviews'],
    queryFn: () => base44.asServiceRole.entities.PartnerReview.filter({ ai_moderation_status: 'pending' }),
  });

  const filtered = useMemo(() => {
    return partners.filter(p => {
      if (statusFilter !== 'all' && p.approval_status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.subcategory?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [partners, search, statusFilter]);

  const updatePartner = async (id, data) => {
    try {
      await base44.asServiceRole.entities.PreferredPartner.update(id, data);
      queryClient.invalidateQueries(['allPreferredPartners']);
      toast({ title: 'Partner updated' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const updateInquiry = async (id, data) => {
    try {
      await base44.asServiceRole.entities.WeddingInquiry.update(id, data);
      queryClient.invalidateQueries(['allWeddingInquiries']);
      toast({ title: 'Inquiry updated' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const updateReview = async (id, data) => {
    try {
      await base44.asServiceRole.entities.PartnerReview.update(id, data);
      queryClient.invalidateQueries(['allPartnerReviews']);
      toast({ title: 'Review updated' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const pendingPartners = partners.filter(p => p.approval_status === 'pending');
  const totalCommission = referrals.reduce((sum, r) => sum + (r.estimated_commission || 0), 0);
  const openInquiries = inquiries.filter(i => i.status === 'submitted' || i.status === 'reviewing');

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-navy" strokeWidth={1.5} />
        <h1 className="font-heading text-lg text-foreground">Concierge Marketplace</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{partners.length}</p>
          <p className="text-[10px] text-muted-foreground">Partners</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-amber-500">{pendingPartners.length}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-blue-500">{openInquiries.length}</p>
          <p className="text-[10px] text-muted-foreground">Inquiries</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-600">${totalCommission.toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground">Est. Comm.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border/50 overflow-x-auto no-scrollbar">
        {[
          { key: 'partners', label: 'Partners' },
          { key: 'referrals', label: 'Referrals' },
          { key: 'inquiries', label: 'Inquiries', badge: openInquiries.length },
          { key: 'reviews', label: 'Reviews', badge: reviews.length },
        ].map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setStatusFilter('all'); }}
            className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${tab === key ? 'border-accent text-accent' : 'border-transparent text-muted-foreground'}`}
          >
            {label}
            {badge > 0 && <span className="ml-1 bg-destructive text-white text-[9px] rounded-full px-1.5">{badge}</span>}
          </button>
        ))}
      </div>

      {/* Partners tab */}
      {tab === 'partners' && (
        <>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partners..." className="w-full bg-card border border-border/50 rounded-lg pl-9 pr-3 py-2 text-sm outline-none" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-card border border-border/50 rounded-lg px-3 py-2 text-sm outline-none">
              <option value="all">All</option>
              {['pending', 'approved', 'hidden', 'suspended'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => setShowAddForm(true)} className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 mb-3">
            <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Partner
          </button>

          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No partners found.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(partner => {
                const meta = PARTNER_STATUS_META[partner.approval_status] || PARTNER_STATUS_META.pending;
                const partnerReferrals = referrals.filter(r => r.partner_id === partner.id);
                return (
                  <div key={partner.id} className="bg-card border border-border/50 rounded-xl p-3">
                    <div className="flex items-start gap-3 mb-2">
                      {partner.logo_url ? (
                        <img src={partner.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center">
                          <Star className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground flex items-center gap-1">
                          {partner.name}
                          {partner.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-accent" strokeWidth={2} />}
                          {partner.is_featured && <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">Featured</span>}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{PARTNER_SUBCATEGORY_LABELS[partner.subcategory] || PARTNER_CATEGORY_LABELS[partner.category]}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                    </div>

                    {/* Listing type */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] text-muted-foreground">Listing:</span>
                      <select
                        value={partner.listing_type}
                        onChange={e => updatePartner(partner.id, { listing_type: e.target.value })}
                        className="text-[10px] bg-sand/60 rounded-full px-2 py-0.5 outline-none border-0"
                      >
                        {LISTING_TYPES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                      </select>
                      <label className="flex items-center gap-1 text-[10px] text-muted-foreground ml-2">
                        <input type="checkbox" checked={partner.is_bookable_through_app} onChange={e => updatePartner(partner.id, { is_bookable_through_app: e.target.checked })} className="w-3 h-3 accent-primary" />
                        Bookable
                      </label>
                      <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <input type="checkbox" checked={partner.featured_in_newsletter} onChange={e => updatePartner(partner.id, { featured_in_newsletter: e.target.checked })} className="w-3 h-3 accent-primary" />
                        Newsletter
                      </label>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" strokeWidth={1.5} /> {partner.profile_views || 0} views</span>
                      <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" strokeWidth={1.5} /> {partner.button_clicks || 0} clicks</span>
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" strokeWidth={1.5} /> {partner.website_clicks || 0} web</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" strokeWidth={1.5} /> {partner.quote_requests_count || 0} quotes</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5">
                      <button onClick={() => updatePartner(partner.id, { approval_status: 'approved', is_verified: true })} className="text-xs bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 font-medium">Approve</button>
                      <button onClick={() => updatePartner(partner.id, { approval_status: 'hidden' })} className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1 font-medium">Hide</button>
                      <button onClick={() => updatePartner(partner.id, { is_featured: !partner.is_featured })} className={`text-xs rounded-full px-2.5 py-1 font-medium ${partner.is_featured ? 'bg-amber-100 text-amber-700' : 'bg-sand text-muted-foreground'}`}>Featured</button>
                      <button onClick={() => setEditingPartner(partner)} className="text-xs bg-sand text-foreground rounded-full px-2.5 py-1 font-medium">Edit</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Referrals tab */}
      {tab === 'referrals' && (
        <div className="space-y-2">
          {referrals.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No referral events yet.</p>
          ) : (
            referrals.slice(0, 50).map(r => (
              <div key={r.id} className="bg-card border border-border/50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">{r.partner_name || 'Partner'}</p>
                  <p className="text-[10px] text-muted-foreground">{REFERRAL_EVENT_LABELS[r.event_type] || r.event_type} · {new Date(r.created_date).toLocaleDateString()}</p>
                  {r.referral_source && <p className="text-[10px] text-muted-foreground">From: {r.referral_source}</p>}
                  {r.promo_code_used && <p className="text-[10px] text-accent">Code: {r.promo_code_used}</p>}
                </div>
                {r.estimated_commission > 0 && (
                  <span className="text-xs font-medium text-emerald-600">${r.estimated_commission.toFixed(2)}</span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Inquiries tab */}
      {tab === 'inquiries' && (
        <div className="space-y-2">
          {inquiries.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No wedding inquiries yet.</p>
          ) : (
            inquiries.map(inquiry => {
              const meta = WEDDING_INQUIRY_STATUS_META[inquiry.status] || WEDDING_INQUIRY_STATUS_META.submitted;
              return (
                <div key={inquiry.id} className="bg-card border border-border/50 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-foreground">{inquiry.user_name}</p>
                      <p className="text-[11px] text-muted-foreground">{inquiry.user_email}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground mt-2">
                    <span>Date: {new Date(inquiry.wedding_date).toLocaleDateString()}</span>
                    <span>Guests: {inquiry.guest_count}</span>
                    {inquiry.venue_location && <span className="col-span-2">Venue: {inquiry.venue_location}</span>}
                    {inquiry.budget_range && <span>Budget: {WEDDING_BUDGET_RANGES.find(b => b.id === inquiry.budget_range)?.label}</span>}
                    {inquiry.style_vibe && <span>Style: {inquiry.style_vibe}</span>}
                  </div>
                  {inquiry.services_needed?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {inquiry.services_needed.map(s => <span key={s} className="text-[9px] bg-sand/60 text-muted-foreground rounded-full px-1.5 py-0.5">{s}</span>)}
                    </div>
                  )}
                  {inquiry.notes && <p className="text-[11px] text-muted-foreground mt-2 italic">{inquiry.notes}</p>}
                  <div className="flex gap-1.5 mt-2">
                    <select
                      value={inquiry.status}
                      onChange={e => updateInquiry(inquiry.id, { status: e.target.value })}
                      className="text-xs bg-sand/60 rounded-full px-2 py-1 outline-none border-0"
                    >
                      {['submitted', 'reviewing', 'matched', 'consultation_scheduled', 'quoted', 'booked', 'archived'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="Assign concierge..."
                      defaultValue={inquiry.assigned_concierge || ''}
                      onBlur={e => e.target.value !== (inquiry.assigned_concierge || '') && updateInquiry(inquiry.id, { assigned_concierge: e.target.value })}
                      className="text-xs bg-sand/60 rounded-full px-2 py-1 outline-none border-0 flex-1"
                    />
                  </div>
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
            reviews.map(review => (
              <div key={review.id} className="bg-card border border-border/50 rounded-xl p-3">
                <p className="text-sm font-medium text-foreground">{review.reviewer_name}</p>
                <div className="flex gap-0.5 my-1">
                  {[1,2,3,4,5].map(n => <Star key={n} className={`w-3 h-3 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />)}
                </div>
                {review.written_review && <p className="text-xs text-muted-foreground">{review.written_review}</p>}
                <div className="flex gap-1.5 mt-2">
                  <button onClick={() => updateReview(review.id, { ai_moderation_status: 'approved', is_visible: true })} className="text-xs bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 font-medium">Approve</button>
                  <button onClick={() => updateReview(review.id, { ai_moderation_status: 'flagged', is_visible: false })} className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1 font-medium">Hide</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Edit/Add partner modal */}
      {(editingPartner || showAddForm) && (
        <PartnerFormModal
          partner={editingPartner}
          onClose={() => { setEditingPartner(null); setShowAddForm(false); }}
          onSaved={() => {
            queryClient.invalidateQueries(['allPreferredPartners']);
            setEditingPartner(null);
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
}

function PartnerFormModal({ partner, onClose, onSaved }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!partner;

  const [form, setForm] = useState({
    name: partner?.name || '',
    category: partner?.category || 'photography_media',
    subcategory: partner?.subcategory || '',
    description: partner?.description || '',
    cover_image_url: partner?.cover_image_url || '',
    logo_url: partner?.logo_url || '',
    service_area: partner?.service_area || '',
    website: partner?.website || '',
    email: partner?.email || '',
    phone: partner?.phone || '',
    booking_link: partner?.booking_link || '',
    referral_link: partner?.referral_link || '',
    affiliate_link: partner?.affiliate_link || '',
    promo_code: partner?.promo_code || '',
    pricing_guide: partner?.pricing_guide || '',
    listing_type: partner?.listing_type || 'free',
    commission_rate: partner?.commission_rate || 0,
    is_verified: partner?.is_verified ?? false,
    is_featured: partner?.is_featured ?? false,
    is_bookable_through_app: partner?.is_bookable_through_app ?? false,
    featured_in_newsletter: partner?.featured_in_newsletter ?? false,
    approval_status: partner?.approval_status || 'pending',
    admin_notes: partner?.admin_notes || '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      if (isEdit) {
        await base44.asServiceRole.entities.PreferredPartner.update(partner.id, form);
      } else {
        await base44.asServiceRole.entities.PreferredPartner.create(form);
      }
      toast({ title: isEdit ? 'Partner updated' : 'Partner created' });
      onSaved();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const subcats = PARTNER_CATEGORIES.find(c => c.id === form.category)?.subcategories || [];

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-background w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b border-border/50 px-4 py-3 flex items-center justify-between z-10">
          <h3 className="font-heading text-base text-foreground">{isEdit ? 'Edit Partner' : 'Add Partner'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-sand/60"><X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Business Name *</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent">
                {PARTNER_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Subcategory</label>
              <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent">
                <option value="">Select...</option>
                {subcats.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Cover Image URL</label>
            <input type="text" value={form.cover_image_url} onChange={e => set('cover_image_url', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Logo URL</label>
            <input type="text" value={form.logo_url} onChange={e => set('logo_url', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Website</label>
            <input type="text" value={form.website} onChange={e => set('website', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Booking Link</label>
            <input type="text" value={form.booking_link} onChange={e => set('booking_link', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Referral Link</label>
            <input type="text" value={form.referral_link} onChange={e => set('referral_link', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Affiliate Link</label>
            <input type="text" value={form.affiliate_link} onChange={e => set('affiliate_link', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Promo Code</label>
            <input type="text" value={form.promo_code} onChange={e => set('promo_code', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Pricing Guide</label>
            <input type="text" value={form.pricing_guide} onChange={e => set('pricing_guide', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Listing Type</label>
              <select value={form.listing_type} onChange={e => set('listing_type', e.target.value)} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent">
                {LISTING_TYPES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Commission %</label>
              <input type="number" min="0" max="100" value={form.commission_rate} onChange={e => set('commission_rate', Number(e.target.value))} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_verified} onChange={e => set('is_verified', e.target.checked)} className="w-4 h-4 accent-primary" /><span className="text-xs text-muted-foreground">Verified partner badge</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="w-4 h-4 accent-primary" /><span className="text-xs text-muted-foreground">Featured listing</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_bookable_through_app} onChange={e => set('is_bookable_through_app', e.target.checked)} className="w-4 h-4 accent-primary" /><span className="text-xs text-muted-foreground">Bookable through app</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured_in_newsletter} onChange={e => set('featured_in_newsletter', e.target.checked)} className="w-4 h-4 accent-primary" /><span className="text-xs text-muted-foreground">Feature in newsletter</span></label>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Admin Notes</label>
            <textarea value={form.admin_notes} onChange={e => set('admin_notes', e.target.value)} rows={2} className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none" />
          </div>
          <button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Create Partner'}
          </button>
        </div>
      </div>
    </div>
  );
}