import React from 'react';
import { Bus, Info, ExternalLink, MapPin } from 'lucide-react';

const TRAM_URL = 'https://www.baldheadislandferry.com/tram/';

export default function TramInfo() {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Bus className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-luxe-sm">Tram Service</h3>
      </div>

      <div className="space-y-2.5">
        <InfoRow
          icon={<Info className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />}
          text="Tram service may be included with your ferry ticket, depending on ticket type and availability."
        />
        <InfoRow
          icon={<Info className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />}
          text="Book tram reservations when purchasing ferry tickets for the smoothest arrival experience."
        />
        <InfoRow
          icon={<Info className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />}
          text="One-way and round-trip tram reservations may be available."
        />
        <InfoRow
          icon={<MapPin className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />}
          text="Tram pickup and drop-off locations are determined by the official ferry service."
        />
      </div>

      <a
        href={TRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/15 transition-colors"
      >
        <Bus className="w-4 h-4" strokeWidth={1.5} />
        Book Tram Reservation
        <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
      </a>
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}