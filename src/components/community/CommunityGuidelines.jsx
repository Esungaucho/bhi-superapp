import React from 'react';
import { X } from 'lucide-react';

const GUIDELINES = [
  { emoji: '🤝', title: 'Be Kind & Respectful', desc: 'Treat others like neighbors — this is our island family.' },
  { emoji: '💡', title: 'Be Helpful', desc: 'Share knowledge that benefits the community.' },
  { emoji: '🚫', title: 'No Harassment or Bullying', desc: 'No profanity, threats, or personal attacks.' },
  { emoji: '📭', title: 'No Gossip or Politics', desc: 'Keep it positive — no rumors or partisan content.' },
  { emoji: '👨‍👩‍👧‍👦', title: 'Family-Friendly', desc: 'All ages are welcome here — keep content appropriate.' },
  { emoji: '🌿', title: 'Choose Kindness', desc: 'When in doubt, err on the side of being kind.' },
];

export default function CommunityGuidelines({ onAccept, onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-navy-deep/60 backdrop-blur-sm">
      <div className="bg-card rounded-3xl shadow-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-sea-glass/20 to-navy/10 px-6 pt-8 pb-6 text-center">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary/60">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="text-4xl mb-2">🌴</div>
          <h2 className="font-heading text-xl text-foreground">Community Guidelines</h2>
          <p className="text-sm text-muted-foreground mt-1">Welcome to the BHI community feed!</p>
        </div>

        {/* Guidelines */}
        <div className="px-6 py-5 space-y-4">
          {GUIDELINES.map((g, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-lg flex-shrink-0">
                {g.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{g.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <p className="text-xs text-muted-foreground text-center mb-4 leading-relaxed">
            Posts are automatically reviewed for kindness. Let's keep our island community a positive place for everyone.
          </p>
          <button
            onClick={onAccept}
            className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold hover:bg-navy-deep transition-colors"
          >
            I Understand — Let's Post! 🌿
          </button>
        </div>
      </div>
    </div>
  );
}