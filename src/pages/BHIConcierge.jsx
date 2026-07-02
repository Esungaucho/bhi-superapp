import React from 'react';
import { Link } from 'react-router-dom';
import { ConciergeBell, Compass, ChevronRight, Home, Hammer, Users, CalendarHeart } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';

const SECTIONS = [
  {
    label: 'Concierge Services',
    desc: 'Family & Care, Home, Personal, Food & Hospitality',
    link: '/concierge/services',
    Icon: ConciergeBell,
    featured: true,
  },
  {
    label: 'Preferred Partners',
    desc: 'Photography, Weddings, Wellness, Food & Hosting',
    link: '/concierge/partners',
    Icon: Compass,
  },
  {
    label: 'Luxury Real Estate',
    desc: 'Featured realtors & coastal property experts',
    link: '/real-estate',
    Icon: Home,
  },
  {
    label: 'Builders & Home',
    desc: 'Contractors, architects, designers, marine & more',
    link: '/builders',
    Icon: Hammer,
  },
  {
    label: 'Community Partners',
    desc: 'Chamber, tourism, nonprofits & associations',
    link: '/community-partners',
    Icon: Users,
  },
  {
    label: 'Weddings & Events',
    desc: 'Request a complete wedding or event package',
    link: '/concierge/wedding-inquiry',
    Icon: CalendarHeart,
  },
];

export default function BHIConcierge() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="relative h-40 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background" />
        <div className="relative flex items-center justify-end px-4 pt-3">
          <GlobalMenu />
        </div>
        <div className="relative px-4 pt-4">
          <p className="text-[10px] tracking-luxe uppercase text-white/70 font-medium">Bald Head Island</p>
          <h1 className="font-heading text-2xl text-white mt-1">Concierge</h1>
        </div>
      </div>

      <div className="px-4 py-4 pb-8">
        <p className="text-sm text-muted-foreground leading-relaxed text-center py-2 mb-4">
          Your connected luxury marketplace — concierge services, real estate, builders, restaurants, and local partners, all in one place.
        </p>

        {/* Featured (first) section */}
        {SECTIONS.filter(s => s.featured).map(section => (
          <Link
            key={section.label}
            to={section.link}
            className="flex items-center gap-3 bg-primary text-primary-foreground rounded-2xl p-4 hover:bg-primary/90 transition-colors mb-4"
          >
            <section.Icon className="w-5 h-5" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-sm font-medium">{section.label}</p>
              <p className="text-[11px] text-primary-foreground/70">{section.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        ))}

        {/* Grid of sections */}
        <div className="grid grid-cols-2 gap-3">
          {SECTIONS.filter(s => !s.featured).map(section => {
            const Icon = section.Icon;
            return (
              <Link
                key={section.label}
                to={section.link}
                className="flex flex-col items-start gap-2 bg-card border border-border/50 rounded-2xl p-4 hover:border-accent/40 hover:shadow-luxe-sm transition-all"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{section.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{section.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}