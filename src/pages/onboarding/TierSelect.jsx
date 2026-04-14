import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const TIERS = [
  {
    value: 'short_term_guest',
    emoji: '🏖️',
    label: 'Short-Term Guest',
    description: 'Visiting for a vacation or weekend getaway',
    color: 'border-sky-300 bg-sky-50',
    activeColor: 'border-sky-500 ring-2 ring-sky-300 bg-sky-50',
  },
  {
    value: 'long_term_renter',
    emoji: '🏠',
    label: 'Long-Term Renter',
    description: 'Renting a property on Bald Head Island',
    color: 'border-violet-300 bg-violet-50',
    activeColor: 'border-violet-500 ring-2 ring-violet-300 bg-violet-50',
  },
  {
    value: 'homeowner',
    emoji: '🏡',
    label: 'Homeowner',
    description: 'I own property on Bald Head Island',
    color: 'border-emerald-300 bg-emerald-50',
    activeColor: 'border-emerald-500 ring-2 ring-emerald-300 bg-emerald-50',
  },
  {
    value: 'contractor',
    emoji: '🔧',
    label: 'Contractor',
    description: 'Working on the island professionally',
    color: 'border-amber-300 bg-amber-50',
    activeColor: 'border-amber-500 ring-2 ring-amber-300 bg-amber-50',
  },
];

export default function TierSelect() {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    await base44.auth.updateMe({ tier: selected, onboarding_complete: true });
    navigate('/ferry');
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-4xl mb-3">⛴️</p>
          <h1 className="text-2xl font-bold text-foreground">Welcome to BHI Ferry</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Tell us how you use Bald Head Island so we can tailor your experience.
          </p>
        </div>

        {/* Tier cards */}
        <div className="space-y-3 mb-8">
          {TIERS.map(tier => (
            <button
              key={tier.value}
              onClick={() => setSelected(tier.value)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                selected === tier.value ? tier.activeColor : `${tier.color} hover:opacity-90`
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tier.emoji}</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">{tier.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tier.description}</p>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selected === tier.value ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {selected === tier.value && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selected || saving}
          className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue →'}
        </Button>
      </div>
    </div>
  );
}