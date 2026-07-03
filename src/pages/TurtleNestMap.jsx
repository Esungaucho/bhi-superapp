import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Info, Shield, Clock, CheckCircle2, AlertCircle, Turtle, Calendar } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format, isWithinInterval, parseISO, differenceInDays } from 'date-fns';

const BHI_CENTER = [33.8626, -77.9858];

const STATUS_META = {
  active: { color: '#8FAEA7', label: 'Active', icon: Turtle },
  protected: { color: '#3F6D80', label: 'Protected', icon: Shield },
  hatching_soon: { color: '#D97706', label: 'Hatching Soon', icon: Clock },
  hatched: { color: '#16a34a', label: 'Hatched', icon: CheckCircle2 },
  inactive: { color: '#9ca3af', label: 'Inactive', icon: AlertCircle },
};

const SPECIES_LABELS = {
  loggerhead: 'Loggerhead',
  green: 'Green Turtle',
  leatherback: 'Leatherback',
  kemps_ridley: "Kemp's Ridley",
  unknown: 'Unknown Species',
};

function makeIcon(color, isFeatured = false) {
  const size = isFeatured ? 18 : 14;
  const ring = isFeatured ? `<div style="position:absolute;inset:-6px;border:2px solid ${color};border-radius:50%;opacity:0.25;"></div>` : '';
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid white;">${ring}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function TurtleNestMap() {
  const [selectedNest, setSelectedNest] = useState(null);

  const { data: nests = [], isLoading } = useQuery({
    queryKey: ['turtleNestsPublic'],
    queryFn: () => base44.entities.TurtleNest.filter({ is_public: true, approval_status: 'approved' }, '-created_date', 100),
  });

  const sortedNests = useMemo(() => {
    const statusOrder = { hatching_soon: 0, active: 1, protected: 2, hatched: 3, inactive: 4 };
    return [...nests].sort((a, b) => (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5));
  }, [nests]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header strip */}
      <div className="bg-primary text-primary-foreground px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-base">Turtle Nest Tracker</h1>
            <p className="text-[11px] text-white/70">{nests.length} active nests tracked</p>
          </div>
          <Link to="/turtles" className="flex items-center gap-1.5 text-xs font-medium bg-white/10 rounded-full px-3 py-1.5 hover:bg-white/20 transition-colors">
            <Info className="w-3.5 h-3.5" strokeWidth={1.5} /> Guidelines
          </Link>
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/60">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        )}
        <MapContainer center={BHI_CENTER} zoom={14} className="h-full w-full" zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {sortedNests.map(nest => {
            const meta = STATUS_META[nest.status] || STATUS_META.active;
            if (!nest.lat || !nest.lng) return null;
            return (
              <Marker
                key={nest.id}
                position={[nest.lat, nest.lng]}
                icon={makeIcon(meta.color, nest.is_featured)}
                eventHandlers={{ click: () => setSelectedNest(nest) }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                      <span className="font-bold text-sm">{nest.nest_id}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{SPECIES_LABELS[nest.species] || nest.species}</p>
                    <p className="text-xs mt-1">{nest.approximate_location}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase rounded-full px-2 py-0.5" style={{ background: meta.color + '20', color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                    {nest.estimated_hatch_window_start && (
                      <p className="text-[11px] mt-1.5 text-muted-foreground">
                        Hatch window: {format(parseISO(nest.estimated_hatch_window_start), 'MMM d')} - {nest.estimated_hatch_window_end ? format(parseISO(nest.estimated_hatch_window_end), 'MMM d') : ''}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Selected nest detail / list */}
      <div className="bg-card border-t border-border/30 max-h-[45vh] overflow-y-auto">
        {selectedNest ? (
          <SelectedNestDetail nest={selectedNest} onClose={() => setSelectedNest(null)} />
        ) : (
          <NestList nests={sortedNests} onSelect={setSelectedNest} />
        )}
      </div>
    </div>
  );
}

function NestList({ nests, onSelect }) {
  if (nests.length === 0) {
    return (
      <div className="px-5 py-8 text-center">
        <Turtle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" strokeWidth={1.5} />
        <p className="text-sm font-medium text-foreground">No nests tracked yet</p>
        <p className="text-xs text-muted-foreground mt-1">Check back during nesting season</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <p className="text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-2">Tracked Nests</p>
      {nests.map(nest => {
        const meta = STATUS_META[nest.status] || STATUS_META.active;
        const Icon = meta.icon;
        const daysUntil = nest.estimated_hatch_window_start
          ? differenceInDays(parseISO(nest.estimated_hatch_window_start), new Date())
          : null;

        return (
          <button
            key={nest.id}
            onClick={() => onSelect(nest)}
            className="w-full flex items-center gap-3 bg-card border border-border/40 rounded-xl p-3 hover:border-accent/30 hover:shadow-luxe-sm transition-all text-left"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0" style={{ background: meta.color + '15' }}>
              <Icon className="w-5 h-5" style={{ color: meta.color }} strokeWidth={1.5} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{nest.nest_id}</p>
                <span className="text-[9px] font-semibold uppercase rounded-full px-1.5 py-0.5" style={{ background: meta.color + '20', color: meta.color }}>
                  {meta.label}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{nest.approximate_location}</p>
              {daysUntil !== null && daysUntil >= 0 && nest.status !== 'hatched' && (
                <p className="text-[10px] text-amber-600 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" /> Hatch window in ~{daysUntil} days
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SelectedNestDetail({ nest, onClose }) {
  const meta = STATUS_META[nest.status] || STATUS_META.active;
  const Icon = meta.icon;

  return (
    <div className="p-4 animate-fade-in">
      <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground mb-3">
        ← Back to list
      </button>

      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0" style={{ background: meta.color + '15' }}>
          <Icon className="w-6 h-6" style={{ color: meta.color }} strokeWidth={1.5} />
        </span>
        <div>
          <p className="font-heading text-lg text-foreground">{nest.nest_id}</p>
          <p className="text-xs text-muted-foreground">{SPECIES_LABELS[nest.species] || nest.species}</p>
        </div>
        <span className="ml-auto text-[10px] font-semibold uppercase rounded-full px-2 py-1" style={{ background:!nest.is_public ? '#9ca3af20' : meta.color + '20', color: !nest.is_public ? '#9ca3af' : meta.color }}>
          {meta.label}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex gap-2">
          <span className="text-muted-foreground w-20 flex-shrink-0">Location</span>
          <span className="text-foreground font-medium">{nest.approximate_location}</span>
        </div>
        {nest.beach_zone && (
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20 flex-shrink-0">Beach Zone</span>
            <span className="text-foreground font-medium">{nest.beach_zone}</span>
          </div>
        )}
        {nest.date_marked && (
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20 flex-shrink-0">Marked</span>
            <span className="text-foreground font-medium">{format(parseISO(nest.date_marked), 'MMM d, yyyy')}</span>
          </div>
        )}
        {nest.estimated_hatch_window_start && (
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20 flex-shrink-0">Hatch Window</span>
            <span className="text-foreground font-medium">
              {format(parseISO(nest.estimated_hatch_window_start), 'MMM d')}
              {nest.estimated_hatch_window_end && ` - ${format(parseISO(nest.estimated_hatch_window_end), 'MMM d')}`}
            </span>
          </div>
        )}
        {nest.hatch_count > 0 && (
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20 flex-shrink-0">Hatchlings</span>
            <span className="text-foreground font-medium">{nest.hatch_count} observed</span>
          </div>
        )}
      </div>

      {nest.safety_notes && (
        <div className="mt-3 bg-accent/5 border border-accent/20 rounded-xl p-3">
          <p className="text-[10px] tracking-luxe-sm uppercase text-accent font-semibold mb-1">Safety Notes</p>
          <p className="text-xs text-foreground leading-relaxed">{nest.safety_notes}</p>
        </div>
      )}

      {nest.photos?.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {nest.photos.map((url, i) => (
            <img key={i} src={url} alt="" className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
          ))}
        </div>
      )}

      <Link
        to="/turtles"
        className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 rounded-full py-2.5 hover:bg-accent/20 transition-colors"
      >
        <Shield className="w-4 h-4" strokeWidth={1.5} /> View Turtle Guidelines
      </Link>
    </div>
  );
}