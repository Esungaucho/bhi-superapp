import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
      <p className="text-[11px] text-amber-900 leading-relaxed">
        This tracker only displays certain tagged animals and submitted sightings. Locations may be delayed, approximate or unverified. The absence of a marker does not mean sharks are absent. Always follow official beach and emergency guidance.
      </p>
    </div>
  );
}