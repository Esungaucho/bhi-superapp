import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Info, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function Row({ to, Icon, label, desc }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 py-4 border-b border-border/50 last:border-0 hover:bg-sand/40 transition-colors rounded-lg px-3 -mx-3"
    >
      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sand text-navy flex-shrink-0">
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
    </Link>
  );
}

export default function Settings() {
  return (
    <div className="px-4 pt-4 pb-8 animate-fade-in">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-foreground">Settings</h1>
      </header>

      <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 px-1">Preferences</h3>
      <div className="bg-card border border-border/50 rounded-2xl px-4 mb-6 shadow-[0_2px_12px_-8px_rgba(31,45,61,0.12)]">
        <Row to="/calendar/preferences" Icon={Bell} label="Notifications" desc="Event reminders & interests" />
        <Row to="/agents" Icon={Info} label="Concierge" desc="AI travel assistant" />
      </div>

      <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 px-1">About</h3>
      <div className="bg-card border border-border/50 rounded-2xl px-4 shadow-[0_2px_12px_-8px_rgba(31,45,61,0.12)]">
        <div className="py-4">
          <p className="text-sm font-medium text-foreground">BHI SuperApp</p>
          <p className="text-xs text-muted-foreground mt-1">Your seamless travel companion for Bald Head Island.</p>
          <p className="text-[11px] text-muted-foreground/60 mt-2">Version 1.0.0</p>
        </div>
      </div>

      <button
        onClick={() => base44.auth.logout()}
        className="w-full mt-6 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors py-3"
      >
        Sign Out
      </button>
    </div>
  );
}