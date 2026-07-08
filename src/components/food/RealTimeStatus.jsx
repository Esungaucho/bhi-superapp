import React from 'react';
import { parseHoursStatus } from '@/lib/diningConstants';
import { Clock } from 'lucide-react';

export default function RealTimeStatus({ hours, is_open }) {
  const status = parseHoursStatus(hours);

  if (!status.isOpen && status.isOpen !== false) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
        <Clock className="w-3 h-3" strokeWidth={1.5} />
        {hours || 'Hours not available'}
      </div>
    );
  }

  const open = status.isOpen && is_open !== false;

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
        open ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
      }`}>
        <span className={`w-2 h-2 rounded-full ${open ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
        {open ? 'Open Now' : 'Closed'}
      </span>
      {status.nextEvent && (
        <span className="text-xs text-muted-foreground">{status.nextEvent}</span>
      )}
    </div>
  );
}