import React, { useState } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isSameMonth, addMonths, subMonths, isToday } from 'date-fns';
import { getCategory } from '@/lib/calendarConstants';

export default function MonthGrid({ events, selectedDate, onSelectDate }) {
  const [viewMonth, setViewMonth] = useState(startOfMonth(selectedDate || new Date()));

  const days = eachDayOfInterval({
    start: startOfWeek(viewMonth),
    end: endOfWeek(endOfMonth(viewMonth))
  });

  return (
    <div className="bg-card rounded-2xl border border-border p-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">←</button>
        <span className="text-sm font-semibold text-foreground">{format(viewMonth, 'MMMM yyyy')}</span>
        <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">→</button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center text-[9px] font-semibold text-muted-foreground py-1">{d}</div>
        ))}
        {days.map(day => {
          const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), day));
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const inMonth = isSameMonth(day, viewMonth);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`relative aspect-square rounded-lg text-[11px] font-medium flex items-center justify-center transition-colors
                ${isSelected ? 'bg-primary text-primary-foreground' : isTodayDate ? 'bg-accent/20 text-accent font-bold' : inMonth ? 'text-foreground hover:bg-secondary' : 'text-muted-foreground/30'}`}
            >
              {format(day, 'd')}
              {dayEvents.length > 0 && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((e, i) => {
                    const cat = getCategory(e.category);
                    return <span key={i} className={`w-1 h-1 rounded-full ${cat.dot || 'bg-accent'}`} />;
                  })}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}