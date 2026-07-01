import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, MapPin, Clock, Phone, Globe, Fish } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const BHI_CENTER = [33.8626, -77.9858];

export const SPOT_TYPES = [
  { id: 'marina', label: 'Marinas', emoji: '⚓', color: '#0077b6' },
  { id: 'bait_shop', label: 'Bait Shops', emoji: '🪱', color: '#2d6a4f' },
  { id: 'cleaning_station', label: 'Cleaning Stations', emoji: '🔪', color: '#6c757d' },
  { id: 'fishing_spot', label: 'Public Fishing', emoji: '🎣', color: '#e85d04' },
  { id: 'charter_departure', label: 'Charter Departures', emoji: '🚤', color: '#7b2d8b' },
];

const TYPE_META = Object.fromEntries(SPOT_TYPES.map(t => [t.id, t]));

function makeIcon(emoji, color) {
  return L.divIcon({
    className: '',
    html: `<div style="font-size:22px;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.4));">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export default function FishingMap() {
  const [activeType, setActiveType] = useState('all');

  const { data: spots = [], isLoading } = useQuery({
    queryKey: ['fishingSpots'],
    queryFn: () => base44.entities.FishingSpot.filter({ is_active: true }),
  });

  const filtered = useMemo(() =>
    spots.filter(s => activeType === 'all' || s.spot_type === activeType),
    [spots, activeType]
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Category filter */}
      <div className="bg-primary px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveType('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              activeType === 'all'
                ? 'bg-white text-primary border-white'
                : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
            }`}
          >
            🗺️ All Spots
          </button>
          {SPOT_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                activeType === t.id
                  ? 'bg-white text-primary border-white'
                  : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1 min-h-[280px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/60">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        )}
        <MapContainer center={BHI_CENTER} zoom={14} className="h-full w-full" zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.map(spot => {
            const meta = TYPE_META[spot.spot_type] || { emoji: '📍' };
            return (
              <Marker
                key={spot.id}
                position={[spot.lat, spot.lng]}
                icon={makeIcon(meta.emoji, meta.color)}
              >
                <Popup>
                  <div className="text-sm min-w-[170px]">
                    <div className="flex items-center gap-1.5">
                      <span>{meta.emoji}</span>
                      <p className="font-bold">{spot.name}</p>
                    </div>
                    {spot.address && (
                      <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {spot.address}
                      </p>
                    )}
                    {spot.description && (
                      <p className="text-xs mt-1 leading-relaxed">{spot.description}</p>
                    )}
                    {spot.hours && (
                      <p className="text-xs mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {spot.hours}
                      </p>
                    )}
                    {spot.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {spot.amenities.map((a, i) => (
                          <span key={i} className="text-[10px] bg-secondary rounded-full px-1.5 py-0.5">
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-1.5">
                      {spot.phone && (
                        <a href={`tel:${spot.phone}`} className="text-xs text-accent font-semibold flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      )}
                      {spot.website && (
                        <a href={spot.website} target="_blank" rel="noopener noreferrer" className="text-xs text-accent font-semibold flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Site
                        </a>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* List below map */}
      <div className="bg-card border-t border-border max-h-[35vh] overflow-y-auto">
        {filtered.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Fish className="w-8 h-8 mx-auto mb-2 text-accent/40" />
            <p className="text-sm">No fishing spots listed yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(spot => {
              const meta = TYPE_META[spot.spot_type] || { emoji: '📍', label: spot.spot_type };
              return (
                <div key={spot.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-lg flex-shrink-0">
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight">{spot.name}</p>
                    <p className="text-[10px] font-medium text-accent uppercase tracking-wide">{meta.label}</p>
                    {spot.address && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" /> {spot.address}
                      </p>
                    )}
                    {spot.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{spot.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}