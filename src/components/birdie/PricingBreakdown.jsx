import React from 'react';

export default function PricingBreakdown({ pricing }) {
  if (!pricing) return null;

  const rows = [
    { label: 'Merchandise (est.)', value: pricing.merchandiseCost },
    { label: 'Shopping Fee', value: pricing.shoppingFee },
    { label: 'Mileage', value: pricing.mileageFee },
    { label: 'Ferry Freight', value: pricing.ferryFee },
    { label: 'Service Fee', value: pricing.serviceFee },
    { label: 'Delivery', value: pricing.deliveryFee },
    ...(pricing.tip > 0 ? [{ label: 'Shopper Tip', value: pricing.tip }] : []),
  ];

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4">
      <h4 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-3">Cost Breakdown</h4>
      <div className="space-y-2">
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className="text-xs font-medium text-foreground">${row.value?.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        <span className="text-sm font-heading text-foreground">Estimated Total</span>
        <span className="text-lg font-bold text-ocean">${pricing.total?.toFixed(2)}</span>
      </div>
    </div>
  );
}