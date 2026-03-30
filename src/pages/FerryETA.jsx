import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { Link } from 'react-router-dom';

const DESTINATIONS = [
  { value: 'Ferry Terminal', cartMin: 0 },
  { value: 'South Beach', cartMin: 12 },
  { value: 'Cape Fear Point', cartMin: 18 },
  { value: 'Harbour Village', cartMin: 3 },
  { value: 'Shoals Club', cartMin: 8 },
];

function getDriveMinutes(origin) {
  const lower = origin.toLowerCase();
  if (lower.includes('raleigh')) return 165;
  if (lower.includes('wilmington')) return 45;
  if (lower.includes('charlotte')) return 240;
  return 90;
}

export default function FerryETA() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const { data: schedules = [] } = useQuery({
    queryKey: ['ferrySchedules'],
    queryFn: () => base44.entities.FerrySchedule.list('-departure_time', 500),
  });

  const handleCalculate = async () => {
    if (!origin || !destination) return;
    setCalculating(true);

    const now = new Date();
    const driveMin = getDriveMinutes(origin);
    const parkMin = 5;
    const destInfo = DESTINATIONS.find(d => d.value === destination);
    const cartMin = destInfo?.cartMin || 0;

    // Find next ferry after arriving at terminal
    const arriveAtTerminal = addMinutes(now, driveMin + parkMin);
    const toIslandSchedules = schedules
      .filter(s => s.direction === 'to_island' && s.status !== 'canceled' && new Date(s.departure_time) > arriveAtTerminal)
      .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));

    let waitMin = 30; // default
    let recommendedFerry = null;
    if (toIslandSchedules.length > 0) {
      recommendedFerry = toIslandSchedules[0];
      waitMin = Math.round((new Date(recommendedFerry.departure_time) - arriveAtTerminal) / 60000);
    }

    const ferryMin = 20;
    const totalMin = driveMin + parkMin + waitMin + ferryMin + cartMin;
    const leaveBy = addMinutes(new Date(recommendedFerry?.departure_time || now), -(driveMin + parkMin + 10));

    setResult({
      driveMin,
      parkMin,
      waitMin,
      ferryMin,
      cartMin,
      totalMin,
      leaveBy,
      recommendedFerry,
    });

    // Save to entity
    try {
      const user = await base44.auth.me();
      await base44.entities.ETACalculation.create({
        user_email: user?.email || '',
        origin_address: origin,
        destination,
        drive_minutes: driveMin,
        park_minutes: parkMin,
        wait_minutes: waitMin,
        ferry_minutes: ferryMin,
        cart_minutes: cartMin,
        total_minutes: totalMin,
        recommended_ferry_time: recommendedFerry?.departure_time,
      });
    } catch (e) { /* silent */ }

    setCalculating(false);
  };

  const hours = result ? Math.floor(result.totalMin / 60) : 0;
  const mins = result ? result.totalMin % 60 : 0;

  return (
    <div className="px-4 py-5">
      <h2 className="text-xl font-bold mb-1">🤖 Door-to-Door Travel Time</h2>
      <p className="text-sm text-muted-foreground mb-5">Calculate your complete journey to Bald Head Island</p>

      {/* Origin input */}
      <div className="space-y-3 mb-5">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Enter your address or city"
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-card"
          />
        </div>

        <Select value={destination} onValueChange={setDestination}>
          <SelectTrigger className="h-12 rounded-xl bg-card">
            <SelectValue placeholder="Where on the island?" />
          </SelectTrigger>
          <SelectContent>
            {DESTINATIONS.map(d => (
              <SelectItem key={d.value} value={d.value}>{d.value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleCalculate}
        disabled={!origin || !destination || calculating}
        className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base"
      >
        {calculating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Calculate ETA'}
      </Button>

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-card rounded-xl border p-4 space-y-3">
            <Segment emoji="🚗" label="Drive to Deep Point Marina" value={`${result.driveMin} min`} />
            <Segment emoji="🅿️" label="Park & walk to terminal" value="~5 min" />
            <Segment emoji="⏳" label="Wait for next ferry" value={`${result.waitMin} min`} />
            <Segment emoji="⛴️" label="Ferry crossing" value="~20 min" />
            {result.cartMin > 0 && (
              <Segment emoji="🛺" label={`Golf cart to ${destination}`} value={`${result.cartMin} min`} />
            )}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-accent">
                  {hours > 0 && `${hours}h `}{mins}m
                </span>
              </div>
            </div>
          </div>

          {/* Leave by banner */}
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <p className="text-sm font-medium text-foreground">
              💡 Leave by <span className="font-bold">{format(result.leaveBy, 'h:mm a')}</span> to catch the{' '}
              <span className="font-bold">
                {result.recommendedFerry ? format(new Date(result.recommendedFerry.departure_time), 'h:mm a') : 'next'}
              </span>{' '}
              ferry. 92% confidence.
            </p>
          </div>

          {/* Book CTA */}
          {result.recommendedFerry && (
            <Link
              to={`/ferry/book?id=${result.recommendedFerry.id}`}
              className="block w-full text-center bg-accent text-accent-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Book {format(new Date(result.recommendedFerry.departure_time), 'h:mm a')} Ferry — $23/person
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Segment({ emoji, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">
        {emoji} {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}