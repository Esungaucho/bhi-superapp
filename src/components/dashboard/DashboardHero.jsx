import React from 'react';
import { format } from 'date-fns';
import { formatSunsetTime } from '@/lib/sunTimes';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardHero({ user }) {
  const firstName = user?.full_name?.split(' ')[0] || 'Explorer';
  const today = format(new Date(), 'MMMM d');
  const sunset = formatSunsetTime();

  return (
    <section className="animate-fade-in relative">
      <div className="relative h-[280px] overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Bald Head Island at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        <div className="absolute inset-0 flex flex-col justify-end p-7 text-white">
          <p className="text-[11px] font-body tracking-luxe uppercase text-white/70">
            {getGreeting()}, {firstName}
          </p>
          <h1 className="font-heading text-[1.75rem] leading-[1.1] mt-1.5 text-balance">
            Welcome to Bald Head Island
          </h1>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-white/60 font-body">
            <span>{today}</span>
            <span className="text-white/30">·</span>
            <span>Sunset {sunset}</span>
          </div>
        </div>
      </div>
    </section>
  );
}