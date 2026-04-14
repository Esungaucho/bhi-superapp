import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

// Determine which ads are contextually relevant given current conditions
export function getTriggeredAds(pins, conditions) {
  if (!pins || !conditions) return [];
  return pins.filter(pin => {
    if (!pin.is_sponsored || !pin.sponsor_ad_trigger) return false;
    switch (pin.sponsor_ad_trigger) {
      case 'always': return true;
      case 'high_uv': return (conditions.uv_index || 0) >= 7;
      case 'hot_weather': return (conditions.temp_f || 0) >= 85;
      case 'rain': return ['rain', 'storm'].includes(conditions.condition);
      case 'high_crowd': return ['busy', 'very_busy'].includes(conditions.crowd_level);
      case 'low_tide': return conditions.tide_status === 'low';
      default: return false;
    }
  });
}

export default function ContextualAd({ pin, conditions }) {
  // Track impression
  useEffect(() => {
    if (!pin?.id) return;
    // Log ad impression to RevenueEntry & increment counter
    base44.entities.BusinessPin.update(pin.id, {
      ad_impressions: (pin.ad_impressions || 0) + 1,
    }).catch(() => {});
    base44.entities.RevenueEntry.create({
      source: 'ad_impression',
      reference_id: pin.id,
      reference_type: 'BusinessPin',
      amount: 0.05,
      description: `Contextual ad impression — ${pin.name} (trigger: ${pin.sponsor_ad_trigger})`,
    }).catch(() => {});
  }, [pin?.id]);

  if (!pin) return null;

  const triggerLabel = {
    high_uv: '☀️ High UV today',
    hot_weather: '🌡️ Hot day alert',
    rain: '🌧️ Rainy day',
    high_crowd: '👥 Busy beach',
    low_tide: '🌊 Low tide now',
    always: '📍 Sponsored',
  }[pin.sponsor_ad_trigger] || '📍 Sponsored';

  const Wrapper = pin.deep_link ? Link : 'div';
  const wrapperProps = pin.deep_link ? { to: pin.deep_link } : {};

  return (
    <Wrapper {...wrapperProps} className="block mx-4 mb-3">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
          🏷️
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Ad · {triggerLabel}</span>
          </div>
          <p className="text-sm font-semibold text-foreground leading-tight">{pin.name}</p>
          {pin.sponsor_ad_text && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{pin.sponsor_ad_text}</p>}
        </div>
        <span className="text-accent text-xs font-semibold flex-shrink-0">View →</span>
      </div>
    </Wrapper>
  );
}