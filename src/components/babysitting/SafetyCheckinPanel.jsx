import React, { useState } from 'react';
import { Upload, Camera, X, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { SAFETY_CHECKIN_TYPES } from '@/lib/babysittingConstants';

export default function SafetyCheckinPanel({ booking, onCheckinComplete }) {
  const [activeType, setActiveType] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [childrenStatus, setChildrenStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const requiredTypes = [];
  if (booking.allow_beach_pool && !booking.no_water_activities) {
    requiredTypes.push('water_life_jacket', 'water_safety');
  }
  if (booking.allow_golf_cart && !booking.no_golf_cart) {
    requiredTypes.push('golf_cart_start', 'golf_cart_end');
  }

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(file_url);
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!photoUrl) {
      toast({ title: 'Photo required', description: 'A safety photo is required for this check-in.', variant: 'destructive' });
      return;
    }
    try {
      await base44.entities.BabysitterSafetyCheckin.create({
        booking_id: booking.id,
        sitter_name: booking.sitter_name,
        checkin_type: activeType,
        photo_url: photoUrl,
        notes: notes || undefined,
        location: location || undefined,
        children_status: childrenStatus || undefined,
      });
      toast({ title: 'Safety check-in submitted', description: 'The family has been notified.' });
      setActiveType(null);
      setPhotoUrl('');
      setNotes('');
      setLocation('');
      setChildrenStatus('');
      if (onCheckinComplete) onCheckinComplete();
    } catch (err) {
      toast({ title: 'Check-in failed', description: err.message, variant: 'destructive' });
    }
  };

  if (requiredTypes.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">No safety check-ins required for this booking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4">
      <p className="text-xs font-medium tracking-luxe-sm uppercase text-muted-foreground mb-3">Safety Check-Ins</p>
      <div className="space-y-2">
        {SAFETY_CHECKIN_TYPES.filter((t) => requiredTypes.includes(t.key)).map((type) => (
          <button
            key={type.key}
            onClick={() => { setActiveType(type.key); setPhotoUrl(''); }}
            className="w-full text-left bg-sand/40 hover:bg-sand/70 rounded-lg p-3 transition-colors"
          >
            <div className="flex items-center gap-2">
              <type.Icon className="w-4 h-4 text-navy" strokeWidth={1.5} />
              <span className="text-sm font-medium text-foreground">{type.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 ml-6">{type.description}</p>
          </button>
        ))}
      </div>

      {activeType && (
        <div className="mt-4 border-t border-border/50 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {SAFETY_CHECKIN_TYPES.find((t) => t.key === activeType)?.label}
            </p>
            <button onClick={() => { setActiveType(null); setPhotoUrl(''); }} className="p-1 rounded-full hover:bg-sand/60">
              <X className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Safety Photo *</label>
            {photoUrl ? (
              <div className="relative">
                <img src={photoUrl} alt="safety" className="w-full rounded-lg" />
                <button onClick={() => setPhotoUrl('')} className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                  <X className="w-4 h-4 text-white" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-8 cursor-pointer hover:bg-sand/40 transition-colors">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
                )}
                <span className="text-xs text-muted-foreground">Upload safety photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            )}
          </div>

          {(activeType === 'water_safety' || activeType === 'golf_cart_start') && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Children Status</label>
              <input
                type="text"
                value={childrenStatus}
                onChange={(e) => setChildrenStatus(e.target.value)}
                placeholder="e.g. All children wearing life jackets and accounted for"
                className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Current location"
              className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional safety notes..."
              rows={2}
              className="w-full bg-sand/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!photoUrl || uploading}
            className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            Submit Check-In
          </button>
        </div>
      )}
    </div>
  );
}