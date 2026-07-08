import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Plus, X, Loader2, Megaphone } from 'lucide-react';

const QUICK_PRESETS = [
  { label: 'Ferry Delayed', message: 'Ferry delayed 30 minutes due to weather conditions.', status: 'delayed', severity: 'warning' },
  { label: 'Weather Delay', message: 'Weather delay in effect. Please check back for updates.', status: 'weather_impacted', severity: 'warning' },
  { label: 'Parking Full', message: 'Parking at Deep Point Marina is currently full. Overflow parking available.', status: 'special_announcement', severity: 'warning' },
  { label: 'Extra Ferry Added', message: 'An extra ferry has been added to the schedule. Check departure times.', status: 'special_announcement', severity: 'normal' },
  { label: 'Tram Delays Expected', message: 'Tram delays expected due to high demand. Please plan accordingly.', status: 'special_announcement', severity: 'warning' },
  { label: 'Service Cancelled', message: 'Ferry service cancelled due to severe weather.', status: 'cancelled', severity: 'critical' },
];

export default function AdminOverridePanel() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ message: '', status: 'delayed', severity: 'warning' });
  const [saving, setSaving] = useState(false);

  const { data: overrides = [] } = useQuery({
    queryKey: ['ferryAdminOverrides'],
    queryFn: () => base44.entities.FerryStatus.filter({ active: true, is_admin_override: true }, '-last_checked', 10),
  });

  const applyPreset = (preset) => {
    setForm({ message: preset.message, status: preset.status, severity: preset.severity });
  };

  const handlePost = async () => {
    if (!form.message.trim()) return;
    setSaving(true);
    try {
      await base44.entities.FerryStatus.create({
        status: form.status,
        message: form.message,
        severity: form.severity,
        active: true,
        is_admin_override: true,
        last_checked: new Date().toISOString(),
        source_url: 'admin_override',
      });
      setForm({ message: '', status: 'delayed', severity: 'warning' });
      queryClient.invalidateQueries({ queryKey: ['ferryAdminOverrides'] });
      queryClient.invalidateQueries({ queryKey: ['ferryStatus'] });
      queryClient.invalidateQueries({ queryKey: ['ferryStatusAdmin'] });
    } catch {
      alert('Failed to post override.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    await base44.entities.FerryStatus.update(id, { active: false });
    queryClient.invalidateQueries({ queryKey: ['ferryAdminOverrides'] });
    queryClient.invalidateQueries({ queryKey: ['ferryStatus'] });
    queryClient.invalidateQueries({ queryKey: ['ferryStatusAdmin'] });
  };

  return (
    <div className="space-y-4">
      {/* Quick Presets */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-luxe-sm text-muted-foreground mb-2">Quick Override</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-card border border-border text-foreground hover:bg-sand/40 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom form */}
      <div className="bg-card rounded-xl border border-border p-3.5 space-y-3">
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-1.5 block">Message</label>
          <textarea
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            placeholder="Enter urgent ferry update..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-1 block">Status</label>
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background"
            >
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
              <option value="weather_impacted">Weather Impacted</option>
              <option value="special_announcement">Special Announcement</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-luxe-xs mb-1 block">Severity</label>
            <select
              value={form.severity}
              onChange={e => setForm({ ...form, severity: e.target.value })}
              className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background"
            >
              <option value="normal">Normal</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <button
          onClick={handlePost}
          disabled={saving || !form.message.trim()}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" strokeWidth={1.5} />}
          Post Override
        </button>
      </div>

      {/* Active Overrides */}
      {overrides.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-luxe-sm text-muted-foreground mb-2">Active Overrides</p>
          <div className="space-y-2">
            {overrides.map(o => (
              <div key={o.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                <Megaphone className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground capitalize">{o.status.replace(/_/g, ' ')}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{o.message}</p>
                  <p className="text-[10px] text-amber-600 mt-1">Admin Override · {o.severity}</p>
                </div>
                <button
                  onClick={() => handleDeactivate(o.id)}
                  className="p-1 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-amber-600" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}