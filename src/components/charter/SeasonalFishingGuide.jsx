import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Fish, Clock, Worm, Scale, Info, Anchor } from 'lucide-react';
import { FISHING_GUIDE } from '@/lib/fishingGuide';
import LocalCaptains from './LocalCaptains';

const MONTHS = FISHING_GUIDE.map(g => ({ month: g.month, label: g.label }));

export default function SeasonalFishingGuide() {
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [activeTab, setActiveTab] = useState('guide');

  const guide = FISHING_GUIDE[selectedMonth];

  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-sea-glass/20 to-navy/10 rounded-2xl p-4 border border-accent/20">
        <div className="flex items-center gap-2 mb-1">
          <Fish className="w-5 h-5 text-accent" />
          <h2 className="font-heading text-lg text-foreground">Seasonal Fishing Guide</h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          What's biting this month — plus the best bait, times, and local regulations.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1.5 bg-secondary/60 rounded-full p-1">
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full transition-colors ${activeTab === 'guide' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
        >
          <Fish className="w-3.5 h-3.5" /> Guide
        </button>
        <button
          onClick={() => setActiveTab('captains')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full transition-colors ${activeTab === 'captains' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
        >
          <Anchor className="w-3.5 h-3.5" /> Local Captains
        </button>
      </div>

      {activeTab === 'captains' ? (
        <LocalCaptains />
      ) : (
      <>
      {/* Month selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setSelectedMonth((selectedMonth + 11) % 12)}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-ocean" strokeWidth={1.5} />
            <span className="font-heading text-lg text-foreground">{guide.label}</span>
          </div>
          <button
            onClick={() => setSelectedMonth((selectedMonth + 1) % 12)}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Month scroll strip */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {MONTHS.map(m => (
            <button
              key={m.month}
              onClick={() => setSelectedMonth(m.month)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-12 py-1.5 rounded-xl border transition-colors ${
                selectedMonth === m.month
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border'
              }`}
            >
              <span className="text-[10px] font-medium tracking-wide">{m.label.slice(0, 3)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current month indicator */}
      {selectedMonth === currentMonth && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-accent bg-accent/10 rounded-full px-3 py-1.5 w-fit">
          <Calendar className="w-3 h-3" />
          Current Month
        </div>
      )}

      {/* Fish cards */}
      <div className="space-y-3">
        {guide.fish.map((fish, idx) => (
          <div key={idx} className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Fish header */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-sea-glass/10 to-transparent">
              <div className="w-10 h-10 rounded-full bg-ocean/8 flex items-center justify-center flex-shrink-0">
                <Fish className="w-5 h-5 text-ocean" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{fish.name}</h3>
            </div>

            {/* Details */}
            <div className="px-4 pb-4 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Worm className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Best Bait</p>
                  <p className="text-xs text-foreground mt-0.5">{fish.bait}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Best Time to Fish</p>
                  <p className="text-xs text-foreground mt-0.5">{fish.bestTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Scale className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Regulations</p>
                  <p className="text-xs text-foreground mt-0.5 leading-relaxed">{fish.regs}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex gap-2.5 items-start">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Regulations are subject to change. Always verify current size and bag limits with the{' '}
          <span className="font-semibold">NC Division of Marine Fisheries</span> before fishing.
          A valid NC saltwater fishing license is required for all anglers 16 and older.
        </p>
      </div>
      </>
      )}
    </div>
  );
}