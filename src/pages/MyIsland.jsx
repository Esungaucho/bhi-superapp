import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useUserPreference } from '@/hooks/useUserPreference';
import { getPersonalizedRecommendations, getRoleGreeting } from '@/lib/personalization';
import { getRoleLabel } from '@/lib/userConstants';
import { trackActionAsync } from '@/lib/behaviorTracking';
import {
  Calendar, Bell, Settings, Bookmark, Anchor, Shield, ChevronRight,
  LogOut, User, ConciergeBell, Sparkles, CalendarDays,
} from 'lucide-react';
import WeatherMarineModule from '@/components/dashboard/WeatherMarineModule';

const TIER_LABELS = {
  resident: 'Resident',
  homeowner: 'Homeowner',
  business_owner: 'Business Owner',
  captain: 'Captain',
  employee: 'Employee',
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

function RecommendationCard({ card }) {
  const { Icon, title, desc, path } = card;
  const handleClick = () => {
    trackActionAsync({
      action_type: 'recommendation_tap',
      action_label: title,
      target_path: path,
      session_context: 'my_island',
      metadata: { card_id: card.id, matched_roles: card.roles, matched_interests: card.interests },
    });
  };
  return (
    <Link
      to={path}
      onClick={handleClick}
      className="group flex flex-col gap-2.5 bg-card border border-border/40 rounded-2xl p-4 hover:border-accent/30 hover:shadow-luxe-sm transition-all duration-300"
    >
      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent group-hover:bg-accent/15 transition-colors">
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
      </div>
    </Link>
  );
}

export default function MyIsland() {
  const { user, showCaptainHub, showAdmin, showBusiness, showConciergeDashboard } = useUserAccess();
  const { pref } = useUserPreference(user);

  const userRole = pref?.user_role;
  const activityInterests = pref?.activity_interests || [];
  const greeting = getRoleGreeting(userRole);
  const recommendations = getPersonalizedRecommendations(userRole, activityInterests);

  const handleLogout = () => base44.auth.logout();

  const firstName = user?.full_name?.split(' ')[0] || 'Island Explorer';

  return (
    <div className="px-4 pt-4 pb-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-navy/8 to-sea-glass/8 rounded-2xl border border-border/50 p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-navy text-white flex items-center justify-center font-heading text-xl flex-shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.full_name?.charAt(0)?.toUpperCase() || 'B'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-lg text-foreground truncate">
              {firstName}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{greeting.subtitle}</p>
            {userRole && (
              <span className="inline-block mt-1.5 text-[10px] font-medium tracking-luxe-sm uppercase text-accent bg-accent/10 rounded-full px-2.5 py-0.5">
                {getRoleLabel(userRole)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Weather & Marine Conditions */}
      <div className="mb-6">
        <WeatherMarineModule />
      </div>

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
            <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground">
              Recommended for You
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recommendations.slice(0, 6).map(card => (
              <RecommendationCard key={card.id} card={card} />
            ))}
          </div>
          {recommendations.length > 6 && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {recommendations.slice(6).map(card => (
                <RecommendationCard key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* No preferences yet — prompt onboarding */}
      {!pref?.onboarding_completed && (
        <Link
          to="/onboarding"
          className="block mb-6 bg-accent/5 border border-accent/20 rounded-2xl p-4 text-center hover:bg-accent/10 transition-colors"
        >
          <p className="text-sm font-semibold text-accent">Complete Your Profile</p>
          <p className="text-xs text-muted-foreground mt-1">Personalize your island experience in 60 seconds</p>
        </Link>
      )}

      {/* Quick Access */}
      <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 px-1">Quick Access</h3>
      <div className="bg-card border border-border/50 rounded-2xl px-4 mb-6 shadow-[0_2px_12px_-8px_rgba(31,45,61,0.12)]">
        <MenuItem to="/bookings" Icon={Calendar} label="My Bookings" desc="Ferry, lodging & rentals" />
        <MenuItem to="/saved" Icon={Bookmark} label="Saved" desc="Events & favorite captains" />
        <MenuItem to="/calendar" Icon={CalendarDays} label="Island Calendar" desc="Events & activities" />
        <MenuItem to="/notifications" Icon={Bell} label="Notifications" desc="Alerts & updates" />
        <MenuItem to="/profile" Icon={User} label="Edit Profile" desc="Role, interests & preferences" />
        <MenuItem to="/settings" Icon={Settings} label="Settings" desc="Preferences & account" />
      </div>

      {/* Management section — conditional */}
      {(showCaptainHub || showBusiness || showAdmin || showConciergeDashboard) && (
        <>
          <h3 className="text-[11px] font-medium tracking-luxe-sm uppercase text-muted-foreground mb-2 px-1">Management</h3>
          <div className="bg-card border border-border/50 rounded-2xl px-4 mb-6 shadow-[0_2px_12px_-8px_rgba(31,45,61,0.12)]">
            {showConciergeDashboard && (
              <MenuItem to="/concierge/dashboard" Icon={ConciergeBell} label="Concierge Dashboard" desc="View & manage your requests" />
            )}
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