import React from 'react';
import { Star, CheckCircle2, Shield, AlertTriangle } from 'lucide-react';

export default function ReviewCard({ review }) {
  const isFlagged = review.ai_moderation_status === 'flagged' || review.ai_moderation_status === 'escalated';

  if (!review.is_visible && review.ai_moderation_status !== 'escalated') return null;

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center">
            <span className="text-xs font-medium text-navy">
              {review.reviewer_name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{review.reviewer_name}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{review.reviewer_role}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`w-3.5 h-3.5 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
            />
          ))}
        </div>
      </div>

      {review.written_review && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{review.written_review}</p>
      )}

      <div className="flex flex-wrap gap-3 text-xs">
        {review.safety_rating != null && (
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-muted-foreground">Safety:</span>
            <span className="font-medium text-foreground">{review.safety_rating}/5</span>
          </div>
        )}
        {review.communication_rating != null && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Communication:</span>
            <span className="font-medium text-foreground">{review.communication_rating}/5</span>
          </div>
        )}
        {review.would_book_again != null && (
          <div className="flex items-center gap-1">
            {review.would_book_again ? (
              <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} /><span className="text-emerald-600">Would book again</span></>
            ) : (
              <span className="text-muted-foreground">Would not book again</span>
            )}
          </div>
        )}
      </div>

      {isFlagged && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
          <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>This review is under moderation review.</span>
        </div>
      )}
    </div>
  );
}