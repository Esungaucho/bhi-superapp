import React from 'react';
import { format, addDays, isSameDay } from 'date-fns';

export default function DateScroller({ selectedDate, onDateChange }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
      {days.map(day => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        return (
          <button
            key={day.toISOString()}
            onClick={() => onDateChange(day)}
            className={`flex flex-col items-center min-w-[52px] py-2 px-3 rounded-xl transition-all ${
              isSelected
                ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/25'
                : 'bg-card text-foreground hover:bg-secondary'
            }`}
          >
            <span className="text-[10px] font-medium uppercase opacity-70">
              {isToday ? 'Today' : format(day, 'EEE')}
            </span>
            <span className="text-lg font-bold leading-tight">{format(day, 'd')}</span>
            <span className="text-[10px] opacity-60">{format(day, 'MMM')}</span>
          </button>
        );
      })}
    </div>
  );
}