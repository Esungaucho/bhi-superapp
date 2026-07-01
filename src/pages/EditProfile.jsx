import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Camera, Loader2, Check } from 'lucide-react';
import { USER_TIERS, INTEREST_OPTIONS } from '@/lib/userConstants';
import { useUserPreference } from '@/hooks/useUserPreference';

export default function EditProfile() {
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { pref } = useUserPreference(user);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [tier, setTier] = useState(user?.tier || '');
  const [interests, setInterests] = useState(pref?.interests || []);

  React.useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
      setTier(user.tier || '');
    }
  }, [user]);

  React.useEffect(() => {
    if (pref?.interests) setInterests(pref.interests);
  }, [pref]);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAvatar(file_url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const toggleInterest = (id) => {
    setInterests(interests.includes(id) ? interests.filter(i => i !== id) : [...interests, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await base44.auth.updateMe({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        avatar,
        tier,
      });

      const existing = await base44.entities.UserPreference.filter({ user_email: user.email });
      const prefData = {
        user_email: user.email,
        user_name: `${firstName} ${lastName}`.trim(),
        interests,
      };
      if (existing.length > 0) {
        await base44.entities.UserPreference.update(existing[0].id, prefData);
      } else {
        await base44.entities.UserPreference.create(prefData);
      }

      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['userPreference']);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-8 animate-fade-in">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-foreground">Edit Profile</h1>
      </header>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative w-24 h-24 rounded-full bg-sand border border-border/50 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
        >
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
          )}
        </button>
        <p className="text-xs text-muted-foreground mt-2">Change photo</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
      </div>

      {/* Name */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Email (read-only) */}
      <div className="mb-4">
        <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">Email</label>
        <input
          type="email"
          value={user?.email || ''}
          disabled
          className="w-full h-12 px-4 rounded-xl border border-border bg-muted/50 text-sm text-muted-foreground"
        />
      </div>

      {/* Phone */}
      <div className="mb-6">
        <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-1.5 block">Phone (optional)</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="(910) 555-0100"
          className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Tier */}
      <div className="mb-6">
        <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 block">I am a…</label>
        <div className="grid grid-cols-2 gap-2.5">
          {USER_TIERS.map(t => (
            <button
              key={t.value}
              onClick={() => setTier(t.value)}
              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                tier === t.value ? 'border-accent bg-accent/10 ring-1 ring-accent/30' : 'border-border bg-card'
              }`}
            >
              <span className="text-lg">{t.emoji}</span>
              <span className="text-xs font-medium text-foreground">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="mb-8">
        <label className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 block">Favorite Activities & Interests</label>
        <div className="grid grid-cols-2 gap-2">
          {INTEREST_OPTIONS.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => toggleInterest(id)}
              className={`flex items-center gap-2 rounded-lg border p-2.5 text-left transition-all ${
                interests.includes(id) ? 'border-accent bg-accent/10' : 'border-border bg-card'
              }`}
            >
              <span className="text-sm">{emoji}</span>
              <span className="text-[11px] font-medium text-foreground">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-40"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? (
          <><Check className="w-5 h-5" strokeWidth={2} /> Saved</>
        ) : 'Save Changes'}
      </button>
    </div>
  );
}