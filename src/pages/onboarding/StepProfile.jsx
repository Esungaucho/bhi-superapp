import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { USER_TIERS } from '@/lib/userConstants';

export default function StepProfile({ profile, setProfile }) {
  const fileRef = useRef();

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProfile({ ...profile, avatar: file_url });
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative w-24 h-24 rounded-full bg-sand border border-border/40 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
        >
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
          )}
        </button>
        <p className="text-xs text-muted-foreground mt-2">Add a photo (optional)</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
      </div>

      {/* Name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium tracking-luxe-xs uppercase text-muted-foreground mb-1.5 block">First Name</label>
          <input
            type="text"
            value={profile.first_name}
            onChange={e => setProfile({ ...profile, first_name: e.target.value })}
            placeholder="Alexander"
            className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-ocean transition-colors"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium tracking-luxe-xs uppercase text-muted-foreground mb-1.5 block">Last Name</label>
          <input
            type="text"
            value={profile.last_name}
            onChange={e => setProfile({ ...profile, last_name: e.target.value })}
            placeholder="Mitchell"
            className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-ocean transition-colors"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="text-[11px] font-medium tracking-luxe-xs uppercase text-muted-foreground mb-1.5 block">Phone (optional)</label>
        <input
          type="tel"
          value={profile.phone}
          onChange={e => setProfile({ ...profile, phone: e.target.value })}
          placeholder="(910) 555-0100"
          className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-ocean transition-colors"
        />
      </div>

      {/* Tier */}
      <div>
        <label className="text-[11px] font-medium tracking-luxe-xs uppercase text-muted-foreground mb-2.5 block">I am a…</label>
        <div className="grid grid-cols-2 gap-2.5">
          {USER_TIERS.map(({ value, Icon, label }) => (
            <button
              key={value}
              onClick={() => setProfile({ ...profile, tier: value })}
              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                profile.tier === value
                  ? 'border-ocean bg-ocean/5 ring-1 ring-ocean/20'
                  : 'border-border bg-card hover:border-border/60'
              }`}
            >
              <Icon className="w-5 h-5 text-foreground/60 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-xs font-medium text-foreground leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}