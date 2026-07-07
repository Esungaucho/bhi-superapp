import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Ship, MapPin, Info } from 'lucide-react';

// Terminal coordinates
const SOUTHPORT_TERMINAL = [33.9065, -78.0165]; // Deep Point Marina, Southport
const BHI_TERMINAL = [33.8635, -78.0035]; // Bald Head Island Marina

const ROUTE_PATH = [
  SOUTHPORT_TERMINAL,
  [33.8950, -78.0100],
  [33.8800, -78.0050],
  BHI_TERMINAL,
];

// Custom terminal marker icon
const terminalIcon = (name) => L.divIcon({
  className: 'custom-ferry-marker',
  html: `<div style="display:flex;flex-direction:column;align-items:center;">
    <div style="width:28px;height:28px;border-radius:50%;background:#3F6D80;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">⛴</div>
    <div style="font-size:10px;font-weight:600;color:#2B2B2B;background:white;padding:1px 6px;border-radius:4px;margin-top:2px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.15);">${name}</div>
  </div>`,
  iconSize: [40, 48],
  iconAnchor: [20, 28],
});

export default function FerryTrackerMap({ vessels = [] }) {
  const activeVessels = vessels.filter(v => v.gps_feed_enabled && v.latitude && v.longitude);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="relative">
        <MapContainer
          center={[33.885, -78.010]}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: '300px', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <Polyline positions={ROUTE_PATH} pathOptions={{ color: '#3F6D80', dashArray: '6 6', weight: 2 }} />

          <Marker position={SOUTHPORT_TERMINAL} icon={terminalIcon('Southport')}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-sm">Deep Point Marina</p>
                <p className="text-xs text-gray-500">Southport Terminal</p>
              </div>
            </Popup>
          </Marker>

          <Marker position={BHI_TERMINAL} icon={terminalIcon('BHI')}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-sm">Bald Head Island</p>
                <p className="text-xs text-gray-500">Island Terminal</p>
              </div>
            </Popup>
          </Marker>

          {activeVessels.map(v => (
            <Marker key={v.id} position={[v.latitude, v.longitude]}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold text-sm">{v.vessel_name}</p>
                  <p className="text-xs text-gray-500">{v.speed ? `${v.speed} kn` : 'Speed unknown'}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* GPS status overlay */}
        <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-luxe-sm">
          <div className="flex items-center gap-1.5">
            {activeVessels.length > 0 ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-foreground">{activeVessels.length} vessel{activeVessels.length !== 1 ? 's' : ''} live</span>
              </>
            ) : (
              <>
                <Info className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-[10px] font-medium text-muted-foreground">GPS pending</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Vessel list / GPS status */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Ship className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-luxe-sm">Fleet Status</h4>
        </div>
        {vessels.length === 0 ? (
          <p className="text-xs text-muted-foreground">No vessel data available.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {vessels.map(v => (
              <div key={v.id} className="flex items-center gap-2 bg-sand/30 rounded-lg p-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  v.gps_feed_enabled
                    ? 'bg-emerald-500/15 text-emerald-600'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Ship className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{v.vessel_name}</p>
                  <p className="text-[9px] text-muted-foreground">
                    {v.gps_feed_enabled ? 'Live tracking' : 'No GPS feed'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeVessels.length === 0 && (
          <div className="mt-3 bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Live GPS tracking is not yet available. We're working with Bald Head Island Transportation to integrate an official vessel tracking feed. The route shown above reflects the standard crossing path.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}