import React from 'react';
import { X, Heart, Handshake, Shield, EyeOff, MessageCircleOff, Sparkles } from 'lucide-react';

export default function CommunityGuidelines({ onAccept, onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-navy-deep/70 backdrop-blur-md">
      <div className="bg-card rounded-3xl shadow-luxe-lg max-w-sm w-full max-h-[88vh] overflow-y-auto animate-fade-in no-scrollbar">
        {/* Hero */}
        <div className="relative h-40 overflow-hidden rounded-t-3xl">
          <img
            src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=600&auto=format"
            alt="Bald Head Island shoreline"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ocean/30 via-ocean/40 to-ocean-deep/70" />
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors">
            <X className="w-4 h-4 text-white" strokeWidth={1.5} />
          </button>
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <p className="text-[10px] tracking-luxe uppercase text-white/70 font-body">Welcome to</p>
            <h2 className="font-heading text-xl leading-tight">Our Island Community</h2>
          </div>
        </div>

        {/* Guidelines */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-foreground leading-relaxed">
            Welcome to our island community. This is a positive, respectful, family-friendly space for residents, visitors, staff, homeowners, renters, vendors, and guests.
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            By using this platform, you agree to be kind, helpful, respectful, and appropriate.
          </p>

          <div className="space-y-3 pt-1">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Be Kind & Respectful</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Treat others like neighbors — this is our island family.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Handshake className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Be Helpful</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Share knowledge that benefits the community.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">No Bullying or Harassment</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">No threats, hate speech, or personal attacks.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <EyeOff className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">No Inappropriate Content</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">No inappropriate photos, spam, scams, or unsafe behavior.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <MessageCircleOff className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">No Gossip or Politics</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Keep it positive — no rumors or partisan content.</p>
              </div>
            </div>
          </div>

          <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 flex gap-2.5 items-start">
            <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground leading-relaxed">
              All posts and comments are reviewed by our AI moderation system before appearing publicly. Flagged content is sent to admin review.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-1">
          <button
            onClick={onAccept}
            className="w-full bg-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold hover:bg-ocean-deep transition-colors"
          >
            I Agree — Enter Community
          </button>
        </div>
      </div>
    </div>
  );
}