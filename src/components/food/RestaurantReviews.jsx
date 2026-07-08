import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, Loader2, Plus, MessageCircle } from 'lucide-react';

export default function RestaurantReviews({ restaurantId, restaurantName }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [ratings, setRatings] = useState({ food: 0, service: 0, atmosphere: 0, value: 0 });
  const [comment, setComment] = useState('');
  const [visitType, setVisitType] = useState('dine_in');
  const [submitting, setSubmitting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['restaurantReviews', restaurantId],
    queryFn: () => base44.entities.RestaurantReview.filter({ restaurant_id: restaurantId }, '-created_date', 20),
    enabled: !!restaurantId,
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.overall_rating || r.food_rating || 0), 0) / reviews.length
    : null;

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const overall = Math.round(((ratings.food + ratings.service + ratings.atmosphere + ratings.value) / 4) * 10) / 10;
      await base44.entities.RestaurantReview.create({
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        user_email: user.email,
        user_name: user.full_name || user.email,
        food_rating: ratings.food,
        service_rating: ratings.service,
        atmosphere_rating: ratings.atmosphere,
        value_rating: ratings.value,
        overall_rating: overall,
        comment,
        visit_type: visitType,
        visit_date: new Date().toISOString().split('T')[0],
      });
      queryClient.invalidateQueries({ queryKey: ['restaurantReviews', restaurantId] });
      setShowForm(false);
      setRatings({ food: 0, service: 0, atmosphere: 0, value: 0 });
      setComment('');
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (current, onChange, label) => (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => onChange(n)} disabled={!showForm}>
            <Star className={`w-4 h-4 ${n <= current ? 'fill-amber-400 text-amber-400' : 'text-border'} transition-colors`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="font-heading text-sm font-semibold text-foreground">Diner Reviews</p>
          {avgRating && (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {avgRating.toFixed(1)} ({reviews.length})
            </span>
          )}
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
            Review
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-4 mb-3 space-y-3">
          <p className="text-xs font-semibold text-foreground">How was your experience?</p>
          {renderStars(ratings.food, v => setRatings(p => ({ ...p, food: v })), 'Food')}
          {renderStars(ratings.service, v => setRatings(p => ({ ...p, service: v })), 'Service')}
          {renderStars(ratings.atmosphere, v => setRatings(p => ({ ...p, atmosphere: v })), 'Atmosphere')}
          {renderStars(ratings.value, v => setRatings(p => ({ ...p, value: v })), 'Value')}
          <select value={visitType} onChange={e => setVisitType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs">
            <option value="dine_in">Dined In</option>
            <option value="takeout">Takeout</option>
            <option value="delivery">Delivery</option>
          </select>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={submitting || ratings.food === 0}
              className="flex-1 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold disabled:opacity-40 flex items-center justify-center gap-1.5">
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Submit Review
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground text-xs font-semibold">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <MessageCircle className="w-8 h-8 mx-auto mb-1 opacity-40" strokeWidth={1.5} />
          <p className="text-xs font-medium">No reviews yet</p>
          <p className="text-[11px]">Be the first to share your experience</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {reviews.map(r => (
            <div key={r.id} className="bg-card rounded-xl border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-foreground">{r.user_name || 'Anonymous'}</p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className={`w-2.5 h-2.5 ${n <= Math.round(r.overall_rating || r.food_rating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>}
              <div className="flex gap-1.5 mt-1.5 text-[9px] text-muted-foreground">
                <span className="bg-secondary px-1.5 py-0.5 rounded">Food {r.food_rating}</span>
                <span className="bg-secondary px-1.5 py-0.5 rounded">Service {r.service_rating}</span>
                <span className="bg-secondary px-1.5 py-0.5 rounded">Vibe {r.atmosphere_rating}</span>
                <span className="bg-secondary px-1.5 py-0.5 rounded">Value {r.value_rating}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}