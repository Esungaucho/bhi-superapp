import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { EVENT_VENDOR_CATEGORIES } from '@/lib/rentalPropertyConstants';
import { ChevronRight } from 'lucide-react';

export default function EventVendorRecommendations({ propertyId }) {
  const { data: vendors = [] } = useQuery({
    queryKey: ['eventVendors'],
    queryFn: () => base44.entities.EventVendor.list('-is_featured', 200),
  });

  const approvedVendors = vendors.filter(v => v.approval_status === 'approved');

  // Group vendors by category
  const vendorsByCategory = EVENT_VENDOR_CATEGORIES.map(({ id, label, Icon, entityCategory }) => {
    const matched = approvedVendors.filter(v => v.category === entityCategory);
    return { id, label, Icon, count: matched.length };
  }).filter(g => g.count > 0);

  if (vendorsByCategory.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1 px-1">
        Recommended Vendors for This Property
      </p>
      <p className="text-xs text-muted-foreground mb-3 px-1">
        Trusted local professionals curated for events at this venue.
      </p>
      <div className="space-y-2">
        {vendorsByCategory.map(({ id, label, Icon, count }) => (
          <Link
            key={id}
            to="/events/vendors"
            className="flex items-center gap-3 bg-card border border-border/50 rounded-xl p-3 hover:border-accent/40 hover:shadow-luxe-sm transition-all group"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/8 text-accent flex-shrink-0">
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground">{count} available</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors" strokeWidth={1.5} />
          </Link>
        ))}
      </div>
    </div>
  );
}