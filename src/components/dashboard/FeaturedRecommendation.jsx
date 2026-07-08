import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Sparkles, Sunset, Coffee, Heart, Waves, Sun, ChevronRight } from 'lucide-react';

const ROTATION = [
  { day: 0, badge: 'best_sunset', title: "Today's Best Sunset Dinner", icon: Sunset, sub: 'Catch golden hour with dinner', link: '/food' },
  { day: 1, badge: 'hidden_gem', title: "Today's Hidden Gem", icon: Sparkles, sub: 'A spot you might have missed', link: '/food' },
  { day: 2, badge: 'best_coffee', title: "Today's Coffee Stop", icon: Coffee, sub: 'Start your morning right', link: '/food' },
  { day: 3, badge: 'best_date_night', title: "Tonight's Date Night Pick", icon: Heart, sub: 'Romantic dining on the island', link: '/food' },
  { day: 4, badge: 'best_waterfront', title: "Today's Waterfront Pick", icon: Waves, sub: 'Dine by the water', link: '/food' },
  { day: 5, badge: 'local_favorite', title: "Today's Local Favorite", icon: Sun, sub: 'Where the islanders go', link: '/food' },
  { day: 6, badge: 'best_family', title: "Today's Family Pick", icon: Sun, sub: 'Great for all ages', link: '/food' },
];

export default function FeaturedRecommendation() {
  const dayOfWeek = new Date().getDay();
  const todaysPick = ROTATION[dayOfWeek];

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurantsFeatured'],
    queryFn: () => base44.entities.Restaurant.list('-created_date', 50),
  });

  const recommendation = restaurants.find(r =>
    r.concierge_badges?.includes(todaysPick.badge) && r.is_open !== false
  ) || restaurants.find(r => r.concierge_badges?.includes(todaysPick.badge));

  const { data: conditions = [] } = useQuery({
    queryKey: ['islandConditionsRec'],
    queryFn: () => base44.entities.IslandConditions.list('-recorded_at', 1),
  });
  const weather = conditions?.[0];

  const Icon = todaysPick.icon;

  if (!recommendation) return null;

  const beachCondition = weather?.beach_flag === 'green' ? 'Perfect beach conditions today' :
    weather?.beach_flag === 'yellow' ? 'Moderate surf — use caution' :
    weather?.beach_flag === 'red' ? 'Dangerous surf — stay out of water' : null;

  return (
    <section className="px-5 mt-8">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
        <h2 className="font-heading text-lg text-foreground">Today's Recommendation</h2>
      </div>
      <div className="space-y-3">
        <Link to={`/dining/${recommendation.id}`} className="block bg-card border border-border/40 rounded-2xl overflow-hidden shadow-luxe-sm hover:shadow-luxe transition-all">
          {recommendation.image_url && (
            <div className="relative h-32 overflow-hidden">
              <img src={recommendation.image_url} alt={recommendation.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-3 flex items-center gap-2 text-white">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm">
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                </span>
                <span className="text-[10px] font-medium tracking-luxe-xs uppercase">{todaysPick.title}</span>
              </div>
            </div>
          )}
          <div className="p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-heading text-base text-foreground">{recommendation.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {recommendation.cuisine}{recommendation.location ? ` · ${recommendation.location}` : ''}
              </p>
              {recommendation.description && (
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{recommendation.description}</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" strokeWidth={1.5} />
          </div>
        </Link>

        {beachCondition && (
          <Link to="/weather" className="flex items-center gap-3 bg-gradient-to-r from-ocean/5 to-accent/5 border border-border/30 rounded-2xl p-3.5 hover:border-accent/30 transition-colors">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-ocean/10 text-ocean flex-shrink-0">
              <Waves className="w-5 h-5" strokeWidth={1.5} />
            </span>
            <div className="flex-1">
              <p className="text-[10px] font-medium tracking-luxe-xs uppercase text-muted-foreground">Beach Report</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{beachCondition}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.5} />
          </Link>
        )}
      </div>
    </section>
  );
}