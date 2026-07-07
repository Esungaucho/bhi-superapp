import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Crown, Check, Loader2, Calendar, Zap, Bell, Heart, Map, Brain, Baby, ShoppingBag, ClipboardList } from 'lucide-react';
import PremiumUpgradePrompt from '@/components/PremiumUpgradePrompt';

const PREMIUM_FEATURES = [
  { Icon: Brain, label: 'AI Concierge' },
  { Icon: ClipboardList, label: 'My Plans Itinerary Builder' },
  { Icon: Zap, label: 'Priority Concierge Requests' },
  { Icon: ShoppingBag, label: 'Delivery Coordination' },
  { Icon: Baby, label: 'Babysitting Booking' },
  { Icon: Bell, label: 'Premium Notifications' },
  { Icon: Sparkles, label: 'Exclusive Recommendations' },
  { Icon: Heart, label: 'Saved Favorites' },
  { Icon: Map, label: 'Trip Planning Tools' },
];

export default function Membership() {
  const queryClient = useQueryClient();
  const [upgrading, setUpgrading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { data: membership } = useQuery({
    queryKey: ['membership'],
    queryFn: async () => {
      try {
        const records = await base44.entities.Membership.filter({}, '-created_date', 1);
        return records[0] || null;
      } catch { return null; }
    },
  });

  const now = new Date();
  const trialEnd = membership?.trial_end_date ? new Date(membership.trial_end_date) : null;
  const subEnd = membership?.subscription_end_date ? new Date(membership.subscription_end_date) : null;
  const isTrialActive = membership?.status === 'free_trial' && trialEnd && trialEnd > now;
  const isSubActive = membership?.status === 'active' && subEnd && subEnd > now;
  const isPremium = isTrialActive || isSubActive;
  const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))) : 0;

  const startTrial = async () => {
    setUpgrading(true);
    try {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 7);
      await base44.entities.Membership.create({
        user_email: '',
        status: 'free_trial',
        trial_start_date: start.toISOString(),
        trial_end_date: end.toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['membership'] });
    } catch {
      alert('Failed to start trial.');
    } finally {
      setUpgrading(false);
    }
  };

  const upgrade = async (type) => {
    setUpgrading(true);
    try {
      const res = await base44.functions.invoke('create-checkout', {
        product_name: type === 'monthly' ? 'BHI Concierge Monthly' : 'BHI Concierge Annual',
        amount: type === 'monthly' ? 19 : 199,
        currency: 'USD',
        success_url: `${window.location.origin}/membership?status=success`,
        cancel_url: `${window.location.origin}/membership`,
      });
      if (res.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch {
      alert('Failed to start checkout. Please try again.');
      setUpgrading(false);
    }
  };

  return (
    <div className="px-4 pt-5 pb-8">
      <h1 className="font-heading text-xl text-foreground mb-1">Concierge Membership</h1>
      <p className="text-xs text-muted-foreground mb-6">Unlock the full Bald Head Island concierge experience.</p>

      {isPremium && (
        <div className="bg-gradient-to-br from-ocean to-ocean-deep rounded-2xl p-5 text-primary-foreground mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-semibold uppercase tracking-luxe-xs">
              {isTrialActive ? 'Free Trial Active' : 'Premium Member'}
            </span>
          </div>
          {isTrialActive ? (
            <>
              <p className="font-heading text-2xl mb-1">{trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'} left</p>
              <p className="text-xs text-primary-foreground/80">Your free trial ends {trialEnd.toLocaleDateString()}.</p>
            </>
          ) : (
            <>
              <p className="font-heading text-lg mb-1">Premium Active</p>
              <p className="text-xs text-primary-foreground/80">Renews {subEnd?.toLocaleDateString()}</p>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        <PlanCard
          title="Monthly"
          price="$19"
          period="/month"
          highlighted={false}
          onSelect={() => upgrade('monthly')}
          disabled={upgrading}
        />
        <PlanCard
          title="Annual"
          price="$199"
          period="/year"
          highlighted={true}
          onSelect={() => upgrade('annual')}
          disabled={upgrading}
        />
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-3">Premium Features</p>
        <div className="space-y-3">
          {PREMIUM_FEATURES.map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
              </div>
              <span className="text-sm text-foreground flex-1">{label}</span>
              <Check className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-secondary/30 rounded-2xl p-5 text-center mb-4">
        <Calendar className="w-6 h-6 text-primary mx-auto mb-2" strokeWidth={1.5} />
        <p className="text-sm font-semibold text-foreground mb-1">7-Day Free Trial</p>
        <p className="text-xs text-muted-foreground mb-4">No commitment. Access premium features during your trial.</p>
        {!isPremium && !membership && (
          <button
            onClick={startTrial}
            disabled={upgrading}
            className="bg-foreground text-background rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {upgrading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Start Free Trial'}
          </button>
        )}
        {membership?.status === 'expired' && (
          <button onClick={() => upgrade('monthly')} disabled={upgrading} className="bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50">
            {upgrading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Upgrade Now'}
          </button>
        )}
      </div>

      {isPremium && (
        <button onClick={() => setShowUpgrade(true)} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
          Manage Membership
        </button>
      )}

      {showUpgrade && <PremiumUpgradePrompt onClose={() => setShowUpgrade(false)} feature="manage membership" />}
    </div>
  );
}

function PlanCard({ title, price, period, highlighted, onSelect, disabled }) {
  return (
    <div className={`rounded-2xl p-4 border-2 ${highlighted ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
      {highlighted && (
        <span className="text-[9px] font-semibold text-primary uppercase tracking-luxe-xs">Best Value</span>
      )}
      <p className="text-sm font-semibold text-foreground mt-1">{title}</p>
      <div className="flex items-baseline gap-0.5 mt-1">
        <span className="font-heading text-2xl text-foreground">{price}</span>
        <span className="text-[10px] text-muted-foreground">{period}</span>
      </div>
      <button
        onClick={onSelect}
        disabled={disabled}
        className={`w-full mt-3 rounded-full py-2 text-xs font-semibold disabled:opacity-50 ${highlighted ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}
      >
        {disabled ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : 'Upgrade'}
      </button>
    </div>
  );
}