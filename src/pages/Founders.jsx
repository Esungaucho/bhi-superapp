import React from 'react';
import { Heart, Mail } from 'lucide-react';

export default function Founders() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-[42vh] min-h-[320px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80"
          alt="Bald Head Island"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-6 text-center">
          <p className="text-[10px] tracking-luxe text-white/80 uppercase mb-2">BHI SuperApp</p>
          <h1 className="font-heading text-3xl md:text-4xl text-white">About the Founders</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 -mt-6 relative z-10 pb-16">
        <div className="bg-card rounded-2xl border border-border shadow-luxe p-7 md:p-9">
          <p className="font-display text-xl text-foreground mb-6">
            Welcome to the BHI SuperApp
          </p>

          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              The BHI SuperApp was founded by <span className="text-foreground font-medium">Alexander Mitchell</span> and{' '}
              <span className="text-foreground font-medium">Isabele Mitchell</span> with one simple goal: to make every
              Bald Head Island experience as effortless, informed, and enjoyable as possible.
            </p>
            <p>
              Alexander Mitchell is a descendant of the Bald Head Island Limited legacy as the grandson of George P.
              Mitchell. Together, Alex and Isabele have combined their passion for innovation, hospitality, and the
              island they love to create a single place where visitors, homeowners, members, and guests can access the
              resources they need.
            </p>
            <p>
              Every feature of this app has been thoughtfully designed to stay true to the unique spirit and charm of
              Bald Head Island while making your visit easier—from planning your trip and ferry information to dining,
              shopping, weather, events, concierge services, and local resources.
            </p>
            <p>
              Our mission is to save you time, reduce stress, and help you spend more time enjoying everything that
              makes Bald Head Island so special.
            </p>
            <p>
              This app is continually evolving, and your feedback helps us make it even better. If you have suggestions,
              notice something that isn't working correctly, or have ideas for new features that would improve your
              experience, we would truly love to hear from you.
            </p>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <Heart className="w-4 h-4 text-accent" strokeWidth={1.5} />
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Contact */}
          <h2 className="font-heading text-xl text-foreground mb-2">Contact the Founders</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We personally read your feedback and appreciate every suggestion.
          </p>

          <div className="space-y-3">
            <a
              href="mailto:atmitch5@gmail.com"
              className="flex items-center gap-4 bg-secondary/40 rounded-xl p-4 hover:bg-secondary/70 transition-colors group"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-[18px] h-[18px] text-primary" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Alexander Mitchell</p>
                <p className="text-xs text-muted-foreground truncate">atmitch5@gmail.com</p>
              </div>
            </a>

            <a
              href="mailto:belemitchell@gmail.com"
              className="flex items-center gap-4 bg-secondary/40 rounded-xl p-4 hover:bg-secondary/70 transition-colors group"
            >
              <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                <Mail className="w-[18px] h-[18px] text-accent" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Isabele Mitchell</p>
                <p className="text-xs text-muted-foreground truncate">belemitchell@gmail.com</p>
              </div>
            </a>
          </div>

          {/* Closing */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Thank you for supporting the BHI SuperApp. We hope it becomes your trusted companion for every visit to
              Bald Head Island.
            </p>
            <p className="font-display text-lg text-foreground mt-4">With gratitude,</p>
            <p className="font-heading text-lg text-foreground mt-1">Alexander & Isabele Mitchell</p>
            <p className="text-xs text-muted-foreground tracking-luxe-sm mt-1">FOUNDERS, BHI SUPERAPP</p>
          </div>
        </div>
      </div>
    </div>
  );
}