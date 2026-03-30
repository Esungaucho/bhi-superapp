import React from 'react';

export default function DirectionToggle({ direction, onDirectionChange }) {
  return (
    <div className="px-4 pb-3">
      <div className="flex bg-secondary rounded-xl p-1">
        <button
          onClick={() => onDirectionChange('to_island')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            direction === 'to_island'
              ? 'bg-accent text-accent-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🌴 To Island
        </button>
        <button
          onClick={() => onDirectionChange('to_mainland')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            direction === 'to_mainland'
              ? 'bg-accent text-accent-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🏙️ To Mainland
        </button>
      </div>
    </div>
  );
}