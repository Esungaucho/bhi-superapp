import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, X, Bird } from 'lucide-react';
import RestaurantCard from '@/components/food/RestaurantCard';

const EXAMPLE_QUERIES = [
  'Where should we eat tonight?',
  'Best place after the beach?',
  'Romantic dinner for two?',
  'Coffee before the ferry?',
  'Somewhere with kids?',
  'Best sunset views?',
];

export default function AIDiningSearch({ restaurants }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

      const restaurantData = restaurants.map(r => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        price_range: r.price_range,
        is_open: r.is_open,
        hours: r.hours,
        location: r.location,
        is_waterfront: r.is_waterfront,
        has_outdoor_seating: r.has_outdoor_seating,
        is_kid_friendly: r.is_kid_friendly,
        is_dog_friendly: r.is_dog_friendly,
        has_vegan_options: r.has_vegan_options,
        has_gluten_free_options: r.has_gluten_free_options,
        member_only: r.member_only,
        dining_categories: r.dining_categories,
        concierge_badges: r.concierge_badges,
        description: r.description,
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Bald Head Island dining concierge. A user asks: "${q}"

Current time: ${currentTime} on ${dayName}

Here are the available restaurants:
${JSON.stringify(restaurantData, null, 2)}

Based on the user's request, current time, open status, and restaurant attributes, recommend the top 3 best matches. Consider whether restaurants are likely open at this time based on their hours. Return a JSON object with this structure:
{
  "recommendations": [
    {
      "restaurant_id": "the-id",
      "reason": "A warm, personal 1-2 sentence explanation of why this is a great match for their request",
      "tip": "A specific tip like 'Ask for a table by the water' or 'Try their famous crab cakes'"
    }
  ]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  restaurant_id: { type: 'string' },
                  reason: { type: 'string' },
                  tip: { type: 'string' },
                },
              },
            },
          },
        },
      });

      setResults(response.recommendations || []);
    } catch (err) {
      setError(err.message || 'Could not fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-4 border-b border-border bg-gradient-to-b from-accent/5 to-transparent">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">Ask the Concierge</p>
          <p className="text-[11px] text-muted-foreground">Tell us what you're craving</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          placeholder="Where should we eat tonight?"
          className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="px-4 rounded-xl bg-accent text-accent-foreground text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bird className="w-4 h-4" strokeWidth={1.5} />}
          {loading ? '' : 'Ask'}
        </button>
      </div>

      {!results && !loading && !error && (
        <div className="flex gap-2 mt-2.5 overflow-x-auto no-scrollbar">
          {EXAMPLE_QUERIES.map(ex => (
            <button key={ex} onClick={() => { setQuery(ex); handleSearch(ex); }}
              className="flex-shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full bg-card border border-border text-muted-foreground hover:text-accent hover:border-accent/40 transition-colors">
              {ex}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive mt-3">{error}</p>
      )}

      {results && results.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-accent uppercase tracking-luxe-sm">Concierge Picks</p>
            <button onClick={() => { setResults(null); setQuery(''); }} className="p-1 rounded-full hover:bg-sand/50 transition-colors">
              <X className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </div>
          {results.map((rec, i) => {
            const restaurant = restaurants.find(r => r.id === rec.restaurant_id);
            if (!restaurant) return null;
            return (
              <div key={i}>
                <div className="flex items-start gap-2 mb-2 px-1">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div>
                    <p className="text-xs text-foreground leading-relaxed">{rec.reason}</p>
                    {rec.tip && (
                      <p className="text-[11px] text-accent mt-1 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" strokeWidth={1.5} />
                        {rec.tip}
                      </p>
                    )}
                  </div>
                </div>
                <RestaurantCard restaurant={restaurant} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}