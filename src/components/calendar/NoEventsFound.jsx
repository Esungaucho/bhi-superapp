import React from 'react';
import { CalendarX } from 'lucide-react';

export default function NoEventsFound({ message = 'No verified events found' }) {
  return (
    <div className="text-center py-16 px-4">
      <CalendarX className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" strokeWidth={1} />
      <p className="text-sm font-medium text-foreground">{message}</p>
      <p className="text-xs text-muted-foreground mt-1">Events are imported from official Bald Head Island sources.</p>
    </div>
  );
}