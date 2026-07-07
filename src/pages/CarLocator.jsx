import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapPin, Navigation, Trash2, Car, Clock, Plus, Loader2, Check } from 'lucide-react';

export default function CarLocator() {
  const [notes, setNotes] = useState('');
  const [reminder, setReminder] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: spot } = useQuery({
    queryKey: ['parkingSpot'],
    queryFn: async () => {
      const records = await base44.entities.ParkingSpot.filter({}, '-created_date', 1);
      return records[0] || null;
    },
  });

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
    (pos) => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setAddress(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
      setLocating(false);
    },
    () => {
      setLocating(false);
      alert('Unable to get your location. Please enable location access.');
    },
    { enableHighAccuracy: true }
    );
  };

  const handleSave = async () => {
    if (!coords) return;
    setSaving(true);
    try {
      const data = {
        user_email: '',
        latitude: coords.lat,
        longitude: coords.lng,
        address,
        notes,
        saved_at: new Date().toISOString(),
        reminder_time: reminder ? new Date(reminder).toISOString() : undefined,
      };
      if (spot) {
        await base44.entities.ParkingSpot.update(spot.id, data);
      } else {
        await base44.entities.ParkingSpot.create(data);
      }
      queryClient.invalidateQueries({ queryKey: ['parkingSpot'] });
      setNotes('');
      setReminder('');
      setCoords(null);
      setAddress('');
    } catch (err) {
      alert('Failed to save parking spot.');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!spot) return;
    if (!confirm('Clear your saved parking spot?')) return;
    await base44.entities.ParkingSpot.delete(spot.id);
    queryClient.invalidateQueries({ queryKey: ['parkingSpot'] });
  };

  const navigateToCar = () => {
    if (!spot) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`, '_blank');
  };

  if (spot) {
    return (
      <div className="px-4 pt-5 pb-8">
        <h1 className="font-heading text-xl text-foreground mb-1">Car Locator</h1>
        <p className="text-xs text-muted-foreground mb-5">Your saved parking spot</p>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-luxe-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{spot.address || 'Parking Spot'}</p>
              <p className="text-[10px] text-muted-foreground">
                Saved {new Date(spot.saved_at || spot.created_date).toLocaleString()}
              </p>
            </div>
          </div>

          {spot.notes && (
            <div className="mb-3 p-3 rounded-xl bg-secondary/30">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-1">Notes</p>
              <p className="text-sm text-foreground">{spot.notes}</p>
            </div>
          )}

          {spot.reminder_time && (
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
              Reminder: {new Date(spot.reminder_time).toLocaleString()}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={navigateToCar}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3 text-xs font-semibold"
            >
              <Navigation className="w-4 h-4" strokeWidth={1.5} /> Navigate Back
            </button>
            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-1.5 border border-border rounded-full px-4 py-3 text-xs font-semibold text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} /> Clear
            </button>
          </div>
        </div>

        <button
          onClick={() => { queryClient.invalidateQueries({ queryKey: ['parkingSpot'] }); }}
          className="w-full mt-4 flex items-center justify-center gap-2 border border-border rounded-full py-3 text-xs font-semibold text-foreground hover:bg-sand/40"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Update Spot
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-8">
      <h1 className="font-heading text-xl text-foreground mb-1">Car Locator</h1>
      <p className="text-xs text-muted-foreground mb-5">Save your parking spot before you board the ferry</p>

      <div className="bg-card rounded-2xl border border-border p-5 shadow-luxe-sm space-y-4">
        <button
          onClick={getLocation}
          disabled={locating}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold disabled:opacity-50"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" strokeWidth={1.5} />}
          {locating ? 'Finding your location...' : 'Save My Parking Spot'}
        </button>

        {coords && (
          <>
            <div className="p-3 rounded-xl bg-secondary/30 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
              <span className="text-xs text-foreground">Location captured: {address}</span>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-1.5 block">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Parking lot, row, space number, terminal, landmark..."
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-1.5 block">Parking Timer / Reminder (optional)</label>
              <input
                type="datetime-local"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-foreground text-background rounded-full py-3.5 text-sm font-semibold disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={1.5} />}
              Save Parking Spot
            </button>
          </>
        )}
      </div>
    </div>
  );
}