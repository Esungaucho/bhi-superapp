import { Crown, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PremiumUpgradePrompt({ onClose, feature }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-luxe-lg animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-sand/50">
          <X className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </button>

        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ocean to-ocean-deep flex items-center justify-center mx-auto mb-5">
          <Crown className="w-8 h-8 text-primary-foreground" strokeWidth={1.5} />
        </div>

        <h2 className="font-heading text-xl text-foreground mb-2">Your Free Trial Has Ended</h2>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {feature
            ? `Upgrade to keep using ${feature} and all premium planning, delivery, babysitting, itinerary, and concierge tools.`
            : 'Upgrade to keep using premium planning, delivery, babysitting, itinerary, and concierge tools.'}
        </p>

        <div className="space-y-2.5 mb-6">
          {['AI Concierge', 'My Plans Itinerary', 'Priority Requests', 'Delivery Coordination'].map(feat => (
            <div key={feat} className="flex items-center gap-2 text-left">
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={1.5} />
              <span className="text-xs text-foreground">{feat}</span>
            </div>
          ))}
        </div>

        <Link
          to="/membership"
          onClick={onClose}
          className="block bg-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold mb-2"
        >
          Upgrade Now
        </Link>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground py-2"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}