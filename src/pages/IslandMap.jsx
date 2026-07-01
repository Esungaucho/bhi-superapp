import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getTriggeredAds } from '@/components/weather/ContextualAd';

const BHI_CENTER = [33.8626, -77.9858];

const CATEGORY_META = {
  restaurant:   { color: '#3F6D80', label: 'Dining' },
  rental:       { color: '#8FAEA7', label: 'Rentals' },
  lodging:      { color: '#7B7B7B', label: 'Lodging' },
  activity:     { color: '#3F6D80', label: 'Activities' },
  shop:         { color: '#8FAEA7', label: 'Shops' },
  service:      { color: '#7B7B7B', label: 'Services' },
  beach_access: { color: '#8FAEA7', label: 'Beach' },
};

const ALL_CATEGORIES = ['all', ...Object.keys(CATEGORY_META)];

function makeIcon(color, sponsored = false) {
  const size = sponsored ? 16 : 13;
  const ring = sponsored ? `<div style="position:absolute;inset:-5px;border:2px solid ${color};border-radius:50%;opacity:0.3;"></div>` : '';
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid white;">${ring}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function IslandMap() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPin, setSelectedPin] = useState(null);

  const { data: pins = [], isLoading: loadingPins } = useQuery({
    queryKey: ['businessPins'],
    queryFn: () => base44.entities.BusinessPin.filter({ is_active: true }),
  });

  const { data: conditionsAll = [] } = useQuery({
    queryKey: ['islandConditions'],
    queryFn: () => base44.entities.IslandConditions.list('-recorded_at', 1),
  });

  const conditions = conditionsAll[0];
  const triggeredAdIds = useMemo(
    () => new Set(getTriggeredAds(pins, conditions).map(p => p.id)),
    [pins, conditions]
  );

  const filtered = useMemo(() =>
    pins.filter(p => activeCategory === 'all' || p.category === activeCategory),
    [pins, activeCategory]
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Category filter */}
      <div className="bg-primary px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {ALL_CATEGORIES.map(cat => {
            const meta = CATEGORY_META[cat];
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all border ${
                  activeCategory === cat
                    ? 'bg-white text-ocean border-white'
                    : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/20'
                }`}>
                {meta ? meta.label : 'All'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        {loadingPins && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/60">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        )}
        <MapContainer center={BHI_CENTER} zoom={14} className="h-full w-full" zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.map(pin => {
            const meta = CATEGORY_META[pin.category] || { color: '#7B7B7B', label: pin.category };
            const isAd = triggeredAdIds.has(pin.id);
            return (
              <Marker key={pin.id}
                position={[pin.lat, pin.lng]}
                icon={makeIcon(meta.color, isAd)}
                eventHandlers={{ click: () => setSelectedPin(pin) }}>
                <Popup>
                  <div className="text-sm min-w-[160px]">
                    <p className="font-bold">{pin.name}</p>
                    {pin.address && <p className="text-muted-foreground text-xs mt-0.5">{pin.address}</p>}
                    {pin.hours && <p className="text-xs mt-0.5">🕐 {pin.hours}</p>}
                    {isAd && pin.sponsor_ad_text && (
                      <p className="text-xs text-amber-700 mt-1 bg-amber-50 rounded px-1.5 py-1">🏷️ {pin.sponsor_ad_text}</p>
                    )}
                    {pin.deep_link && (
                      <Link to={pin.deep_link} className="text-accent text-xs font-semibold mt-1 block hover:underline">
                        View in app →
                      </Link>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Bottom conditions strip */}
      {conditions && (
        <div className="bg-card border-t border-border/30 px-4 py-2.5 flex items-center justify-between">
          <Link to="/weather" className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full" style={{
              background: conditions.condition === 'sunny' ? '#F3EEE7' :
               conditions.condition === 'partly_cloudy' ? '#8FAEA7' :
               conditions.condition === 'rain' ? '#3F6D80' : '#8FAEA7'
            }} />
            <span className="font-bold">{conditions.temp_f}°F</span>
            <span className="text-muted-foreground text-xs capitalize">{conditions.condition?.replace('_', ' ')}</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>💨 {conditions.wind_mph}mph</span>
            <span>UV {conditions.uv_index}</span>
            <div className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-full ${
                conditions.beach_flag === 'green' ? 'bg-emerald-500' :
                conditions.beach_flag === 'yellow' ? 'bg-yellow-400' :
                conditions.beach_flag === 'red' ? 'bg-red-500' : 'bg-purple-500'
              }`} />
              <span>Flag</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}