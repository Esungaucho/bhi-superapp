import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Loader2, Info, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getTriggeredAds } from '@/components/weather/ContextualAd';

const BHI_CENTER = [33.8626, -77.9858];

// Color map: each category/sub-category gets a distinct color
const COLOR_MAP = {
  // Restaurant cuisines
  seafood:        { color: '#1B6B8C', label: 'Seafood', group: 'dining' },
  american:       { color: '#3F6D80', label: 'American', group: 'dining' },
  pizza:          { color: '#C2541C', label: 'Pizza', group: 'dining' },
  italian:        { color: '#8B3A2E', label: 'Italian', group: 'dining' },
  bakery:         { color: '#D4A03A', label: 'Bakery', group: 'dining' },
  coffee:         { color: '#6B4E2D', label: 'Coffee', group: 'dining' },
  breakfast:      { color: '#D4A03A', label: 'Breakfast', group: 'dining' },
  drinks:         { color: '#8B3A5E', label: 'Drinks', group: 'dining' },
  ice_cream:      { color: '#E088A8', label: 'Ice Cream', group: 'dining' },
  // Shop categories
  boutique:       { color: '#9B4F7E', label: 'Boutique', group: 'shops' },
  grocery:        { color: '#4A7C3A', label: 'Grocery', group: 'shops' },
  gear:           { color: '#5A6B8C', label: 'Gear', group: 'shops' },
  art:            { color: '#C9633E', label: 'Art Gallery', group: 'shops' },
  food_beverage:  { color: '#D4863A', label: 'Food & Beverage', group: 'shops' },
  wellness:       { color: '#7BA89B', label: 'Wellness', group: 'shops' },
  home_decor:     { color: '#8C7B5A', label: 'Home Decor', group: 'shops' },
  services:       { color: '#6B6B6B', label: 'Services', group: 'shops' },
  // BusinessPin categories
  rental:         { color: '#8FAEA7', label: 'Rentals', group: 'rentals' },
  lodging:        { color: '#7B7B7B', label: 'Lodging', group: 'lodging' },
  activity:       { color: '#2D9D8E', label: 'Activities', group: 'activities' },
  beach_access:   { color: '#7DB8E0', label: 'Beach Access', group: 'beach' },
  restaurant:     { color: '#3F6D80', label: 'Dining', group: 'dining' },
  shop:           { color: '#9B4F7E', label: 'Shops', group: 'shops' },
  service:        { color: '#6B6B6B', label: 'Services', group: 'services' },
};

const DEFAULT_COLOR = '#7B7B7B';

const FILTER_PILLS = [
  { key: 'all', label: 'All' },
  { key: 'dining', label: 'Dining' },
  { key: 'shops', label: 'Shops' },
  { key: 'rentals', label: 'Rentals' },
  { key: 'lodging', label: 'Lodging' },
  { key: 'activities', label: 'Activities' },
  { key: 'beach', label: 'Beach' },
  { key: 'services', label: 'Services' },
];

function getColorMeta(category) {
  if (!category) return { color: DEFAULT_COLOR, label: 'Other', group: 'other' };
  const key = category.toLowerCase().replace(/[\s-]/g, '_');
  return COLOR_MAP[key] || { color: DEFAULT_COLOR, label: category, group: 'other' };
}

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
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPin, setSelectedPin] = useState(null);
  const [showLegend, setShowLegend] = useState(false);

  const { data: businessPins = [], isLoading: loadingPins } = useQuery({
    queryKey: ['businessPins'],
    queryFn: () => base44.entities.BusinessPin.filter({ is_active: true }),
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['mapRestaurants'],
    queryFn: () => base44.entities.Restaurant.list('-created_date', 200),
  });

  const { data: shops = [] } = useQuery({
    queryKey: ['mapShops'],
    queryFn: () => base44.entities.Shop.filter({ is_active: true }),
  });

  const { data: conditionsAll = [] } = useQuery({
    queryKey: ['islandConditions'],
    queryFn: () => base44.entities.IslandConditions.list('-recorded_at', 1),
  });

  const conditions = conditionsAll[0];

  // Normalize all sources into a unified pin list
  const allPins = useMemo(() => {
    const pins = [];

    // Restaurants
    restaurants.forEach(r => {
      if (r.lat != null && r.lng != null) {
        const meta = getColorMeta(r.cuisine);
        pins.push({
          id: `rest-${r.id}`,
          name: r.name,
          lat: r.lat,
          lng: r.lng,
          category: r.cuisine,
          colorMeta: meta,
          group: meta.group,
          address: r.address,
          hours: r.hours,
          deep_link: `/food/${r.id}`,
          source: 'restaurant',
        });
      }
    });

    // Shops
    shops.forEach(s => {
      if (s.lat != null && s.lng != null) {
        const meta = getColorMeta(s.category);
        pins.push({
          id: `shop-${s.id}`,
          name: s.name,
          lat: s.lat,
          lng: s.lng,
          category: s.category,
          colorMeta: meta,
          group: meta.group,
          address: s.address,
          hours: s.hours,
          deep_link: `/shops/${s.id}`,
          source: 'shop',
        });
      }
    });

    // BusinessPins
    businessPins.forEach(p => {
      const meta = getColorMeta(p.category);
      pins.push({
        id: `bp-${p.id}`,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        category: p.category,
        colorMeta: meta,
        group: meta.group,
        address: p.address,
        hours: p.hours,
        deep_link: p.deep_link,
        source: 'businesspin',
        is_sponsored: p.is_sponsored,
        sponsor_ad_text: p.sponsor_ad_text,
      });
    });

    return pins;
  }, [restaurants, shops, businessPins]);

  const triggeredAdIds = useMemo(
    () => new Set(getTriggeredAds(businessPins, conditions).map(p => `bp-${p.id}`)),
    [businessPins, conditions]
  );

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return allPins;
    return allPins.filter(p => p.group === activeFilter);
  }, [allPins, activeFilter]);

  // Build legend entries from colors actually in use
  const legendEntries = useMemo(() => {
    const seen = new Map();
    filtered.forEach(p => {
      if (!seen.has(p.colorMeta.label)) {
        seen.set(p.colorMeta.label, p.colorMeta.color);
      }
    });
    return Array.from(seen.entries()).map(([label, color]) => ({ label, color }));
  }, [filtered]);

  return (
    <div className="flex flex-col h-[calc(100vh-128px)]">
      {/* Category filter */}
      <div className="bg-primary px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTER_PILLS.map(pill => (
            <button key={pill.key} onClick={() => setActiveFilter(pill.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all border ${
                activeFilter === pill.key
                  ? 'bg-white text-ocean border-white'
                  : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/20'
              }`}>
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        {loadingPins && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/60">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        )}

        {/* Legend toggle */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="absolute top-3 right-3 z-[500] bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-luxe-sm hover:bg-white transition-colors"
          aria-label="Toggle legend"
        >
          <Info className="w-4 h-4 text-foreground" strokeWidth={1.5} />
        </button>

        {/* Legend panel */}
        {showLegend && (
          <div className="absolute top-12 right-3 z-[500] bg-card rounded-xl shadow-luxe-lg p-4 max-w-[200px] animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground">Categories</span>
              <button onClick={() => setShowLegend(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="space-y-1.5">
              {legendEntries.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">No pins in current view</p>
              ) : legendEntries.map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, border: '1px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  <span className="text-[11px] text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <MapContainer center={BHI_CENTER} zoom={14} className="h-full w-full" zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.map(pin => {
            const isAd = triggeredAdIds.has(pin.id);
            return (
              <Marker key={pin.id}
                position={[pin.lat, pin.lng]}
                icon={makeIcon(pin.colorMeta.color, isAd)}
                eventHandlers={{ click: () => setSelectedPin(pin) }}>
                <Popup>
                  <div className="text-sm min-w-[160px]">
                    <p className="font-bold">{pin.name}</p>
                    {pin.colorMeta.label && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{pin.colorMeta.label}</p>
                    )}
                    {pin.address && <p className="text-muted-foreground text-xs mt-0.5">{pin.address}</p>}
                    {pin.hours && <p className="text-xs mt-0.5">{pin.hours}</p>}
                    {isAd && pin.sponsor_ad_text && (
                      <p className="text-xs text-amber-700 mt-1 bg-amber-50 rounded px-1.5 py-1">{pin.sponsor_ad_text}</p>
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
            <span className="!text-foreground font-bold">{conditions.temp_f}°F</span>
            <span className="text-muted-foreground text-xs capitalize">{conditions.condition?.replace('_', ' ')}</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{conditions.wind_mph}mph wind</span>
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