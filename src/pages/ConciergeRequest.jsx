import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Loader2, Upload, Image as ImageIcon, Camera, Check, Sparkles, X } from 'lucide-react';
import { CONCIERGE_CATEGORIES, TIMING_OPTIONS, DELIVERY_OPTIONS, BUDGET_OPTIONS, calculatePricing, getCategory } from '@/lib/conciergeConstants';
import ConciergePricing from '@/components/concierge/ConciergePricing';
import { trackActionAsync } from '@/lib/behaviorTracking';

export default function ConciergeRequest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(params.get('category') || '');
  const [subcategory, setSubcategory] = useState('');
  const [itemRequested, setItemRequested] = useState('');
  const [storePreference, setStorePreference] = useState('');
  const [budgetRange, setBudgetRange] = useState('flexible');
  const [timing, setTiming] = useState('asap');
  const [scheduledFor, setScheduledFor] = useState('');
  const [deliveryPreference, setDeliveryPreference] = useState('ferry_pickup');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // User info
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [islandAddress, setIslandAddress] = useState('');
  const [tip, setTip] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const cat = useMemo(() => getCategory(category), [category]);

  const budgetToCost = (b) => {
    const map = { under_25: 20, '25_50': 37, '50_100': 75, '100_250': 175, '250_plus': 300, flexible: 50 };
    return map[b] || 50;
  };

  const pricing = calculatePricing(budgetToCost(budgetRange), deliveryPreference, tip);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(file_url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setUserName(user.full_name || '');
      setUserEmail(user.email || '');
    } catch {}
  };

  useEffect(() => { loadUser(); }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const req = await base44.entities.ConciergeRequest.create({
        user_name: userName,
        user_email: userEmail,
        user_phone: userPhone,
        island_address: islandAddress,
        category,
        subcategory,
        item_requested: itemRequested,
        store_preference: storePreference,
        budget_range: budgetRange,
        timing,
        scheduled_for: scheduledFor || undefined,
        delivery_preference: deliveryPreference,
        notes,
        photo_url: photoUrl || undefined,
        status: 'request_submitted',
        item_cost: pricing.itemCost,
        service_fee: pricing.serviceFee,
        mileage_fee: pricing.mileageFee,
        ferry_fee: pricing.ferryFee,
        app_fee: pricing.appFee,
        tip,
        total_cost: pricing.total,
      });

      trackActionAsync({
        action_type: 'concierge_request',
        action_category: category,
        action_label: itemRequested,
        entity_id: req.id,
        session_context: 'concierge_request',
        metadata: { subcategory, timing, delivery_preference: deliveryPreference, total_cost: pricing.total },
      });

      queryClient.invalidateQueries(['conciergeRequests']);
      navigate(`/concierge/track/${req.id}`);
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent';
  const labelClass = 'text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block';

  return (
    <div className="animate-fade-in pb-8">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/concierge')} className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-base text-foreground">{cat?.label || 'Concierge Request'}</h1>
          <p className="text-[10px] text-muted-foreground">Step {step} of 4</p>
        </div>
        <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
      </header>

      <div className="h-0.5 bg-border/30">
        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      <div className="p-4">
        {/* Step 1: Category + Item */}
        {step === 1 && (
          <div className="animate-fade-in space-y-4">
            {!category && (
              <div>
                <label className={labelClass}>Select a Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {CONCIERGE_CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center ${
                        category === c.id ? 'border-accent bg-accent/5' : 'border-border bg-card hover:border-accent/30'
                      }`}
                    >
                      <c.Icon className={`w-5 h-5 ${c.iconColor || 'text-ocean'}`} strokeWidth={1.5} />
                      <span className="text-[10px] font-medium text-foreground leading-tight">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {category && (
              <>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/5 border border-accent/15">
                  {cat && <cat.Icon className="w-4 h-4 text-accent" strokeWidth={1.5} />}
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                  <button onClick={() => { setCategory(''); setSubcategory(''); }} className="ml-auto">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {cat?.subcategories?.length > 0 && (
                  <div>
                    <label className={labelClass}>Specific Service</label>
                    <div className="flex flex-wrap gap-2">
                      {cat.subcategories.map(sc => (
                        <button
                          key={sc.id}
                          onClick={() => setSubcategory(sc.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            subcategory === sc.id ? 'border-accent bg-accent/5 text-accent' : 'border-border bg-card text-muted-foreground'
                          }`}
                        >
                          {sc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className={labelClass}>What do you need? *</label>
                  <textarea
                    value={itemRequested}
                    onChange={e => setItemRequested(e.target.value)}
                    placeholder={category === 'special_requests' ? 'Tell us what you need…' : 'e.g. SPF 50 sunscreen, a birthday gift for a 6-year-old, groceries for a family of 5…'}
                    rows={3}
                    className={inputClass + ' h-auto py-3 resize-none'}
                    autoFocus
                  />
                </div>

                <div>
                  <label className={labelClass}>Store / Vendor Preference (optional)</label>
                  <input
                    type="text"
                    value={storePreference}
                    onChange={e => setStorePreference(e.target.value)}
                    placeholder="e.g. Harris Teeter, Target, no preference"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Budget Range</label>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_OPTIONS.map(b => (
                      <button
                        key={b.id}
                        onClick={() => setBudgetRange(b.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          budgetRange === b.id ? 'border-accent bg-accent/5 text-accent' : 'border-border bg-card text-muted-foreground'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!category || !itemRequested.trim()}
              className="w-full h-11 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Timing + Delivery */}
        {step === 2 && (
          <div className="animate-fade-in space-y-4">
            <div>
              <label className={labelClass}>When do you need it?</label>
              <div className="grid grid-cols-2 gap-2">
                {TIMING_OPTIONS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTiming(t.id)}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      timing === t.id ? 'border-accent bg-accent/5' : 'border-border bg-card'
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{t.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {timing === 'scheduled' && (
              <div>
                <label className={labelClass}>Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={e => setScheduledFor(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className={labelClass}>Delivery Preference</label>
              <div className="space-y-2">
                {DELIVERY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setDeliveryPreference(opt.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      deliveryPreference === opt.id ? 'border-accent bg-accent/5' : 'border-border bg-card'
                    }`}
                  >
                    <opt.Icon className="w-5 h-5 text-ocean flex-shrink-0" strokeWidth={1.5} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground">{opt.description}</p>
                    </div>
                    <span className="text-xs font-medium text-ocean">{opt.fee === 0 ? 'Free' : `$${opt.fee}`}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Island Address / Rental Address</label>
              <input
                type="text"
                value={islandAddress}
                onChange={e => setIslandAddress(e.target.value)}
                placeholder="e.g. 123 Cape Fear Trail, BHI"
                className={inputClass}
              />
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full h-11 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3: Contact + Photo + Notes */}
        {step === 3 && (
          <div className="animate-fade-in space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Name *</label>
                <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone *</label>
                <input type="tel" value={userPhone} onChange={e => setUserPhone(e.target.value)} placeholder="(910) 555-0123" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Photo (optional)</label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-xl bg-sand/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Upload" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground/30" strokeWidth={1} />
                  )}
                </div>
                <label className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground cursor-pointer hover:bg-sand/30 transition-colors">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Upload Photo</>}
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div>
              <label className={labelClass}>Notes / Special Instructions</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Please text when shopping, leave at front door, brand preference details…"
                rows={3}
                className={inputClass + ' h-auto py-3 resize-none'}
              />
            </div>

            <button
              onClick={() => setStep(4)}
              disabled={!userName.trim() || !userPhone.trim() || !userEmail.trim()}
              className="w-full h-11 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-40"
            >
              Review & Confirm
            </button>
          </div>
        )}

        {/* Step 4: Review + Pricing */}
        {step === 4 && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Request Summary</h3>
              <p className="text-sm font-medium text-foreground">{itemRequested}</p>
              {cat && <p className="text-[11px] text-muted-foreground mt-0.5">{cat.label}{subcategory ? ` · ${cat.subcategories.find(s => s.id === subcategory)?.label || ''}` : ''}</p>}
              {storePreference && <p className="text-[11px] text-muted-foreground mt-0.5">Store: {storePreference}</p>}
              {islandAddress && <p className="text-[11px] text-muted-foreground mt-0.5">Address: {islandAddress}</p>}
              {notes && <p className="text-[11px] text-muted-foreground mt-0.5">Notes: {notes}</p>}
              {photoUrl && <img src={photoUrl} alt="Reference" className="w-full h-32 rounded-xl object-cover mt-2" />}
            </div>

            {/* Tip */}
            <div>
              <label className={labelClass}>Tip Your Concierge</label>
              <div className="flex gap-2">
                {[0, 5, 10, 15].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTip(amount)}
                    className={`flex-1 h-10 rounded-xl border text-sm font-medium transition-all ${
                      tip === amount ? 'border-accent bg-accent/5 text-accent' : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    {amount === 0 ? 'None' : `$${amount}`}
                  </button>
                ))}
              </div>
            </div>

            <ConciergePricing pricing={pricing} />

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Submit Request</>}
            </button>
            <p className="text-[10px] text-muted-foreground text-center">
              Final pricing may vary based on actual costs. You'll approve before any charges are finalized.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}