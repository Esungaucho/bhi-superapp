import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const SOUTHPORT = [33.9151, -78.0023];
const BHI_TERMINAL = [33.8626, -77.9858];
const CENTER = [33.89, -77.99];

const boatIcon = L.divIcon({
  className: 'boat-marker',
  html: '<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">⛴️</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const pinIcon = L.divIcon({
  className: 'pin-marker',
  html: '<div style="font-size:20px">📍</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

export default function FerryMap() {
  const { data: schedules = [] } = useQuery({
    queryKey: ['ferrySchedules'],
    queryFn: () => base44.entities.FerrySchedule.list('-departure_time', 500),
  });

  const now = new Date();

  const activeFerry = useMemo(() => {
    return schedules.find(s =>
      s.gps_lat && s.gps_lng &&
      s.status !== 'canceled' &&
      new Date(s.departure_time) <= now &&
      new Date(s.arrival_time) >= now
    );
  }, [schedules, now]);

  const upcoming = useMemo(() => {
    return schedules
      .filter(s => new Date(s.departure_time) > now && s.status !== 'canceled')
      .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time))
      .slice(0, 3);
  }, [schedules, now]);

  const ferryStatus = activeFerry?.status || 'docked';
  const destination = activeFerry?.direction === 'to_island' ? 'BHI' : 'Southport';

  return (
    <div className="flex flex-col">
      {/* Map */}
      <div className="relative h-[50vh]">
        <MapContainer
          center={CENTER}
          zoom={12}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Route line */}
          <Polyline
            positions={[SOUTHPORT, BHI_TERMINAL]}
            pathOptions={{ color: '#2E86C1', dashArray: '8, 12', weight: 3, opacity: 0.6 }}
          />

          {/* Terminals */}
          <Marker position={SOUTHPORT} icon={pinIcon}>
            <Popup>Southport / Deep Point Marina</Popup>
          </Marker>
          <Marker position={BHI_TERMINAL} icon={pinIcon}>
            <Popup>BHI Ferry Terminal</Popup>
          </Marker>

          {/* Active ferry */}
          {activeFerry && (
            <Marker position={[activeFerry.gps_lat, activeFerry.gps_lng]} icon={boatIcon}>
              <Popup>
                {activeFerry.vessel_name} — {activeFerry.status}
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Status overlay */}
        <div className="absolute top-3 left-3 right-3 z-[1000]">
          <div className="bg-card/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border">
            <p className="text-sm font-bold">
              ⛴️ Ferry Status: <span className="capitalize">{ferryStatus.replace('_', ' ')}</span>
            </p>
            {activeFerry && (
              <p className="text-xs text-muted-foreground mt-1">
                ETA to {destination}: ~{Math.round((new Date(activeFerry.arrival_time) - now) / 60000)} minutes
              </p>
            )}
            {!activeFerry && (
              <p className="text-xs text-muted-foreground mt-1">No ferry currently in transit</p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming departures */}
      <div className="px-4 pt-4 pb-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Next Departures</h3>
        <div className="space-y-2">
          {upcoming.map(s => (
            <div key={s.id} className="bg-card rounded-xl p-3 border flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">
                  {format(new Date(s.departure_time), 'h:mm a')}
                  <span className="text-muted-foreground font-normal ml-2">
                    {s.direction === 'to_island' ? '🌴 To Island' : '🏙️ To Mainland'}
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground">{s.vessel_name}</p>
              </div>
              <Link
                to={`/ferry/book?id=${s.id}`}
                className="text-xs font-semibold bg-accent text-accent-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Book
              </Link>
            </div>
          ))}
          {upcoming.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming departures</p>
          )}
        </div>
      </div>
    </div>
  );
}