import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Search, Loader2, Store, Package, Clock, DollarSign, Calendar, Check, Sparkles } from 'lucide-react';
import CategoryGrid from '@/components/birdie/CategoryGrid';
import StoreOptionCard from '@/components/birdie/StoreOptionCard';
import PricingBreakdown from '@/components/birdie/PricingBreakdown';
import { BIRDIE_CATEGORIES, DELIVERY_OPTIONS, SCHEDULE_OPTIONS, calculatePricing, getCategory } from '@/lib/birdieConstants';

export default function BirdieNewRequest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [brandPreference, setBrandPreference] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searching, setSearching] = useState(false);
  const [storeOptions, setStoreOptions] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState('ferry_terminal');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [scheduleType, setScheduleType] = useState('asap');
  const [scheduledFor, setScheduledFor] = useState('');
  const [tip, setTip] = useState(5);
  const [userPhone, setUserPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pricing = selectedStore
    ? calculatePricing(selectedStore.estimated_merchandise_cost, selectedStore.distance_miles, deliveryOption, tip)
    : null;

  const searchStores = async () => {
    if (!itemDescription.trim()) return;
    setSearching(true);
    try {
      const catLabel = getCategory(category)?.label || 'general';
      const prompt = `A user on Bald Head Island needs to purchase: "${itemDescription}" (category: ${catLabel}).
The BHI ferry departs from 1301 Ferry Road, Southport, NC 28461.
Find 3-5 nearby stores in the Southport/Oak Island/Wilmington NC area that would carry this item.
For each store, provide realistic estimates for: store_name, address, distance_miles from the ferry terminal, drive_time (e.g. "8 min"), hours (e.g. "8am-10pm"), price_range (e.g. "$15-$25"), shopping_fee (number, typically 15), ferry_timing (e.g. "30 min ferry"), estimated_arrival (a time string like "2:30 PM today"), estimated_merchandise_cost (number), and estimated_total (number including $15 shopping fee, $0.65/mile mileage, $23 ferry freight, $5 service fee, and delivery fee).
Return realistic, helpful results. If the item is unusual, suggest the closest alternatives.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            stores: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  store_name: { type: 'string' },
                  address: { type: 'string' },
                  distance_miles: { type: 'number' },
                  drive_time: { type: 'string' },
                  hours: { type: 'string' },
                  price_range: { type: 'string' },
                  shopping_fee: { type: 'number' },
                  ferry_timing: { type: 'string' },
                  estimated_arrival: { type: 'string' },
                  estimated_merchandise_cost: { type: 'number' },
                  estimated_total: { type: 'number' },
                },
              },
            },
          },
        },
      });

      setStoreOptions(result.stores || []);
      setStep(3);
    } catch (err) {
      console.error('Search failed:', err);
      setStoreOptions([]);
      setStep(3);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStore) return;
    setSubmitting(true);
    try {
      const user = await base44.auth.me();
      const req = await base44.entities.BirdieRequest.create({
        user_email: user.email,
        user_name: user.full_name || user.email,
        user_phone: userPhone,
        item_description: itemDescription,
        category,
        quantity,
        brand_preference: brandPreference,
        selected_store: selectedStore.store_name,
        store_address: selectedStore.address,
        store_distance_miles: selectedStore.distance_miles,
        delivery_option: deliveryOption,
        delivery_address: deliveryOption === 'home_delivery' ? deliveryAddress : undefined,
        schedule_type: scheduleType,
        scheduled_for: scheduledFor || undefined,
        merchandise_cost: pricing.merchandiseCost,
        shopping_fee: pricing.shoppingFee,
        mileage_fee: pricing.mileageFee,
        ferry_fee: pricing.ferryFee,
        service_fee: pricing.serviceFee,
        delivery_fee: pricing.deliveryFee,
        tip,
        total_cost: pricing.total,
        notes,
        status: 'request_received',
      });

      await base44.entities.BirdieTrackingEvent.create({
        request_id: req.id,
        stage: 'request_received',
        note: 'Your request has been received. We are matching you with a shopper.',
        actor: 'system',
      });

      queryClient.invalidateQueries(['birdieRequests']);
      navigate(`/birdie/request/${req.id}`);
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
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/birdie')} className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-base text-foreground">New Request</h1>
          <p className="text-[10px] text-muted-foreground">Step {step} of 5</p>
        </div>
        <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-border/30">
        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
      </div>

      <div className="p-4">
        {/* Step 1: Category + Item */}
        {step === 1 && (
          <div className="animate-fade-in space-y-4">
            <div>
              <label className={labelClass}>What do you need?</label>
              <input
                type="text"
                value={itemDescription}
                onChange={e => setItemDescription(e.target.value)}
                placeholder="e.g. Easter basket, sunscreen, phone charger…"
                className={inputClass}
                autoFocus
              />
            </div>
            <div>
              <label className={labelClass}>Brand / Details (optional)</label>
              <input
                type="text"
                value={brandPreference}
                onChange={e => setBrandPreference(e.target.value)}
                placeholder="e.g. SPF 50, specific brand, size…"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <CategoryGrid selected={category} onSelect={setCategory} />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!itemDescription.trim()}
              className="w-full h-11 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-40"
            >
              Find Stores
            </button>
          </div>
        )}

        {/* Step 2: Searching */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center py-16">
            {searching ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
                <p className="text-sm font-medium text-foreground">Finding nearby stores…</p>
                <p className="text-xs text-muted-foreground mt-1">Comparing prices, distances, and ferry timing</p>
              </>
            ) : (
              <>
                <Store className="w-8 h-8 text-muted-foreground/30 mb-4" strokeWidth={1} />
                <p className="text-sm text-foreground mb-4">Ready to search for stores near the ferry terminal.</p>
                <button onClick={searchStores} className="flex items-center gap-2 h-11 px-6 rounded-xl bg-accent text-white text-sm font-medium">
                  <Search className="w-4 h-4" /> Search Stores
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 3: Store Options */}
        {step === 3 && (
          <div className="animate-fade-in space-y-3">
            <div>
              <h2 className="font-heading text-base text-foreground">Available Stores</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">For: {itemDescription}</p>
            </div>
            {storeOptions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No stores found. Try refining your search.</p>
                <button onClick={() => setStep(1)} className="mt-3 text-sm text-accent font-medium">Go back</button>
              </div>
            ) : (
              <>
                {storeOptions.map((store, i) => (
                  <StoreOptionCard
                    key={i}
                    option={store}
                    isSelected={selectedStore?.store_name === store.store_name}
                    onSelect={() => { setSelectedStore(store); }}
                  />
                ))}
                {selectedStore && (
                  <button
                    onClick={() => setStep(4)}
                    className="w-full h-11 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
                  >
                    Continue
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 4: Delivery + Schedule */}
        {step === 4 && (
          <div className="animate-fade-in space-y-4">
            <div>
              <label className={labelClass}>Delivery Method</label>
              <div className="space-y-2">
                {DELIVERY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setDeliveryOption(opt.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      deliveryOption === opt.id ? 'border-accent bg-accent/5' : 'border-border bg-card'
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

            {deliveryOption === 'home_delivery' && (
              <div>
                <label className={labelClass}>Island Delivery Address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. 123 Cape Fear Trail, BHI"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className={labelClass}>When do you need it?</label>
              <div className="grid grid-cols-2 gap-2">
                {SCHEDULE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setScheduleType(opt.id)}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      scheduleType === opt.id ? 'border-accent bg-accent/5' : 'border-border bg-card'
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {scheduleType === 'specific_date' && (
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
              <label className={labelClass}>Contact Phone</label>
              <input
                type="tel"
                value={userPhone}
                onChange={e => setUserPhone(e.target.value)}
                placeholder="(910) 555-0123"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Special Instructions (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Please text when shopping, leave at front door…"
                rows={2}
                className={inputClass + ' h-auto py-3 resize-none'}
              />
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full h-11 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Review & Confirm
            </button>
          </div>
        )}

        {/* Step 5: Review + Pricing */}
        {step === 5 && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2">Order Summary</h3>
              <p className="text-sm font-medium text-foreground">{itemDescription}</p>
              {brandPreference && <p className="text-[11px] text-muted-foreground mt-0.5">{brandPreference}</p>}
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Store className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[11px]">{selectedStore?.store_name} · {selectedStore?.distance_miles} mi</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[11px]">
                  {DELIVERY_OPTIONS.find(o => o.id === deliveryOption)?.label}
                  {deliveryAddress && ` — ${deliveryAddress}`}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[11px]">
                  {SCHEDULE_OPTIONS.find(o => o.id === scheduleType)?.label}
                  {scheduledFor && ` — ${new Date(scheduledFor).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`}
                </span>
              </div>
            </div>

            {/* Tip selector */}
            <div>
              <label className={labelClass}>Shopper Tip</label>
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

            {pricing && <PricingBreakdown pricing={pricing} />}

            <div className="bg-ocean/5 rounded-xl p-3 border border-ocean/10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-ocean" strokeWidth={1.5} />
                <p className="text-[11px] text-foreground font-medium">
                  Estimated arrival: {selectedStore?.estimated_arrival}
                </p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Submit Request</>}
            </button>
            <p className="text-[10px] text-muted-foreground text-center">
              You won't be charged until your shopper completes the purchase. Final cost may vary based on actual merchandise price.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}