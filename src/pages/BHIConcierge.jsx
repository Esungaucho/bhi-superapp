import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConciergeBell, Compass, ChevronRight } from 'lucide-react';
import GlobalMenu from '@/components/GlobalMenu';

export default function BHIConcierge() {
  const [tab, setTab] = useState('services');

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

      {/* Tab switcher */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-card border border-border/50 rounded-2xl p-1 flex shadow-luxe-sm">
          <button
            onClick={() => setTab('services')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tab === 'services' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <ConciergeBell className="w-4 h-4" strokeWidth={1.5} />
            Concierge Services
          </button>
          <button
            onClick={() => setTab('partners')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tab === 'partners' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Compass className="w-4 h-4" strokeWidth={1.5} />
            Preferred Partners
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 py-4 pb-8">
        {tab === 'services' ? <ServicesTab /> : <PartnersTab />}
      </div>
    </div>
  );
}

function ServicesTab() {
  return (
    <div className="space-y-4">
      <div className="text-center py-2">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Request, book, and manage services through our Island Concierge team. From childcare to private chefs — we handle the details.
        </p>
      </div>
      <Link
        to="/concierge/services"
        className="flex items-center gap-3 bg-primary text-primary-foreground rounded-2xl p-4 hover:bg-primary/90 transition-colors"
      >
        <ConciergeBell className="w-5 h-5" strokeWidth={1.5} />
        <div className="flex-1">
          <p className="text-sm font-medium">Browse Concierge Services</p>
          <p className="text-[11px] text-primary-foreground/70">Family & Care, Home, Personal, Food & Hospitality</p>
        </div>
        <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
      </Link>
      <Link
        to="/concierge/request"
        className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl p-4 hover:border-accent/40 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Compass className="w-5 h-5 text-accent" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Special Request</p>
          <p className="text-[11px] text-muted-foreground">Tell us what you need — we'll make it happen</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
      </Link>
    </div>
  );
}

function PartnersTab() {
  return (
    <div className="space-y-4">
      <div className="text-center py-2">
        <p className="text-sm text-muted-foreground leading-relaxed">
          A curated network of trusted local businesses and referral partners on and around Bald Head Island.
        </p>
      </div>
      <Link
        to="/concierge/partners"
        className="flex items-center gap-3 bg-primary text-primary-foreground rounded-2xl p-4 hover:bg-primary/90 transition-colors"
      >
        <Compass className="w-5 h-5" strokeWidth={1.5} />
        <div className="flex-1">
          <p className="text-sm font-medium">Browse Preferred Partners</p>
          <p className="text-[11px] text-primary-foreground/70">Photography, Weddings, Real Estate, Wellness, Food</p>
        </div>
        <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
      </Link>
      <Link
        to="/concierge/wedding-inquiry"
        className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl p-4 hover:border-accent/40 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <ConciergeBell className="w-5 h-5 text-accent" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Weddings & Events Inquiry</p>
          <p className="text-[11px] text-muted-foreground">Request a complete wedding package through the app</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
      </Link>
    </div>
  );
}