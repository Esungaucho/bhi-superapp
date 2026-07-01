import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingBag, Ship, Package, MapPin, Clock, Shield, Sparkles, ChevronRight } from 'lucide-react';

const HERO = 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1200&auto=format';

export default function BirdieConcierge() {
  return (
    <div className="animate-fade-in pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative h-[300px]">
          <img src={HERO} alt="Birdie Concierge" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-medium tracking-luxe uppercase text-white/70">On-Demand Concierge</span>
          </div>
          <h1 className="font-heading text-[2rem] leading-tight">Birdie Concierge</h1>
          <p className="text-sm text-white/65 mt-1 max-w-[18rem]">
            Your personal shopper, ferry courier, and delivery service — all in one.
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="px-4 -mt-6 relative z-10">
        <Link
          to="/birdie/new"
          className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-accent text-white text-sm font-medium shadow-luxe hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Request a Shopping Delivery
        </Link>
      </div>

      {/* How it works */}
      <section className="px-4 mt-8">
        <h2 className="font-heading text-lg text-foreground mb-4">How It Works</h2>
        <div className="space-y-3">
          {[
            { Icon: ShoppingBag, title: 'Submit Your Request', desc: 'Tell us what you need — anything from groceries to gifts.' },
            { Icon: MapPin, title: 'We Find the Nearest Store', desc: 'Compare nearby options with pricing and drive times.' },
            { Icon: Shield, title: 'A Shopper Is Matched', desc: 'An approved personal shopper accepts your request.' },
            { Icon: Ship, title: 'Shopped & Ferried', desc: 'Your shopper purchases, delivers to the ferry, and ships it over.' },
            { Icon: Package, title: 'Delivered to You', desc: 'Pick up at the terminal, the tram, or your door.' },
          ].map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-ocean/10 flex items-center justify-center flex-shrink-0">
                  <step.Icon className="w-4 h-4 text-ocean" strokeWidth={1.5} />
                </div>
                {i < 4 && <div className="w-0.5 h-6 bg-border mt-1" />}
              </div>
              <div className="pb-2">
                <h3 className="text-sm font-medium text-foreground">{step.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery options */}
      <section className="px-4 mt-6">
        <h2 className="font-heading text-lg text-foreground mb-3">Delivery Options</h2>
        <div className="space-y-2">
          {[
            { Icon: MapPin, title: 'Ferry Terminal Pickup', desc: 'Free — pick up at the BHI terminal', fee: 'Free' },
            { Icon: Package, title: 'Deliver to Tram', desc: 'Placed on your assigned island tram', fee: '$5' },
            { Icon: Package, title: 'Home / Rental Delivery', desc: 'Straight to your door', fee: '$15' },
          ].map((opt, i) => (
            <div key={i} className="flex items-center gap-3 bg-card border border-border/50 rounded-xl p-3">
              <div className="w-9 h-9 rounded-full bg-sand/40 flex items-center justify-center flex-shrink-0">
                <opt.Icon className="w-4 h-4 text-ocean" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">{opt.title}</h3>
                <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
              </div>
              <span className="text-xs font-medium text-ocean">{opt.fee}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="px-4 mt-6">
        <div className="bg-ocean/5 rounded-2xl p-4 border border-ocean/10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-ocean" strokeWidth={1.5} />
            <h3 className="text-sm font-medium text-foreground">Background-Checked Shoppers</h3>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Every Birdie shopper is vetted and background-checked for your peace of mind. Track your order in real-time from request to delivery.
          </p>
        </div>
      </section>

      {/* Links */}
      <section className="px-4 mt-6 space-y-2">
        <Link to="/birdie/shoppers" className="flex items-center justify-between bg-card border border-border/50 rounded-xl p-4 hover:border-accent/30 transition-colors">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-ocean" strokeWidth={1.5} />
            <span className="text-sm font-medium text-foreground">Meet Our Shoppers</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      </section>
    </div>
  );
}