import React from 'react';
import { Link } from 'react-router-dom';
import { useUserAccess } from '@/hooks/useUserAccess';
import { Calendar, Bell, Settings, Bookmark, Anchor, Shield, ChevronRight, LogOut, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TIER_LABELS = {
  resident: 'Resident',
  owner: 'Island Owner',
  business: 'Business',
  visitor: 'Visitor',
};

function MenuItem({ to, Icon, label, desc }) {
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

export default function MyIsland() {
  const { user, showCaptainHub, showAdmin, showBusiness } = useUserAccess();

  const handleLogout = () => base44.auth.logout();

  return (
    <div className="px-4 pt-4 pb-8 animate-fade-in">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-navy/8 to-sea-glass/8 rounded-2xl border border-border/50 p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-navy text-white flex items-center justify-center font-heading text-xl flex-shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'B'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-lg text-foreground truncate">
              {user?.full_name || 'Island Explorer'}
            </h2>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
            {user?.tier && (
              <span className="inline-block mt-1.5 text-[10px] font-medium tracking-luxe-sm uppercase text-accent bg-accent/10 rounded-full px-2.5 py-0.5">
                {TIER_LABELS[user.tier] || user.tier}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* My Island section */}
      <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 px-1">My Island</h3>
      <div className="bg-card border border-border/50 rounded-2xl px-4 mb-6 shadow-[0_2px_12px_-8px_rgba(31,45,61,0.12)]">
        <MenuItem to="/bookings" Icon={Calendar} label="My Bookings" desc="Ferry, lodging & rentals" />
        <MenuItem to="/saved" Icon={Bookmark} label="Saved" desc="Events & favorite captains" />
        <MenuItem to="/notifications" Icon={Bell} label="Notifications" desc="Alerts & updates" />
        <MenuItem to="/profile" Icon={User} label="Edit Profile" desc="Name, photo & interests" />
        <MenuItem to="/settings" Icon={Settings} label="Settings" desc="Preferences & account" />
      </div>

      {/* Captain / Business / Admin section — conditional */}
      {(showCaptainHub || showBusiness || showAdmin) && (
        <>
          <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 px-1">Management</h3>
          <div className="bg-card border border-border/50 rounded-2xl px-4 mb-6 shadow-[0_2px_12px_-8px_rgba(31,45,61,0.12)]">
            {showCaptainHub && (
              <MenuItem to="/captain/dashboard" Icon={Anchor} label="Captain Hub" desc="Manage charters & availability" />
            )}
            {showBusiness && (
              <MenuItem to="/admin/partners" Icon={ChevronRight} label="Business Dashboard" desc="Manage your shop" />
            )}
            {showAdmin && (
              <MenuItem to="/admin/revenue" Icon={Shield} label="Admin Console" desc="Revenue, ads & moderation" />
            )}
          </div>
        </>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
      >
        <LogOut className="w-4 h-4" strokeWidth={1.5} />
        Sign Out
      </button>
    </div>
  );
}