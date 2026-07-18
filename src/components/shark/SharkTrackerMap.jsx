import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STATUS_META, BHI_CENTER, isSightingActive } from '@/lib/sharkConstants';

function makeIcon(color, expired = false) {
  const opacity = expired ? 0.35 : 1;
  const size = expired ? 10 : 13;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};opacity:${opacity};box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid white;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function SharkTrackerMap({ sightings = [] }) {
  const mappedSightings = sightings.filter(s => s.latitude != null && s.longitude != null);

  return (
    <div className="relative h-[320px] rounded-2xl overflow-hidden border border-border/40 shadow-luxe-sm">
      <MapContainer center={BHI_CENTER} zoom={11} className="h-full w-full" zoomControl={false} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {mappedSightings.map(s => {
          const meta = STATUS_META[s.status] || STATUS_META.unconfirmed;
          const expired = !isSightingActive(s);
          return (
            <Marker
              key={s.id}
              position={[s.latitude, s.longitude]}
              icon={makeIcon(meta.dot, expired)}
            >
              <Popup>
                <div className="text-sm min-w-[140px]">
                  <p className="font-bold">{s.location_name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{meta.label}</p>
                  {s.distance_from_shore && <p className="text-xs mt-0.5">{s.distance_from_shore}</p>}
                  {s.description && <p className="text-xs mt-1 text-muted-foreground">{s.description}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}