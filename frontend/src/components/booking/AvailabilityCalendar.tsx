import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalendarMonth } from '@/hooks/useCalendarMonth';
import type { CalendarEvent, LocationId } from '@/services/api';

type LocationFilter = 'all' | LocationId;

interface Props {
  onSelectDate: (date: string, events: CalendarEvent[]) => void;
  selectedDate: string;
}

export default function AvailabilityCalendar({ onSelectDate, selectedDate }: Props) {
  const { t } = useTranslation();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [filter, setFilter] = useState<LocationFilter>('all');
  const [hasNavigatedBack, setHasNavigatedBack] = useState(false);

  const monthNames = t('booking.calendar.monthNames', { returnObjects: true }) as string[];
  const dayNames = t('booking.calendar.dayNames', { returnObjects: true }) as string[];

  const { events: allEvents, loading } = useCalendarMonth(viewYear, viewMonth);

  // Automatically advance to the next month if there are no upcoming events in the current month
  useEffect(() => {
    if (loading || hasNavigatedBack) return;

    const todayStr = today.toISOString().slice(0, 10);
    // Filter events to only future/today events if it's the current month, or all events if it's a future month
    const hasUpcomingEvents = allEvents.some((e) => {
      if (viewYear === today.getFullYear() && viewMonth === today.getMonth()) {
        return e.date >= todayStr;
      }
      return true;
    });

    if (!hasUpcomingEvents) {
      // Limit automatic search to 12 months ahead to avoid infinite loops
      const maxSearchDate = new Date(today.getFullYear(), today.getMonth() + 12, 1);
      const currentViewDate = new Date(viewYear, viewMonth, 1);
      
      if (currentViewDate < maxSearchDate) {
        if (viewMonth === 11) {
          setViewYear((y) => y + 1);
          setViewMonth(0);
        } else {
          setViewMonth((m) => m + 1);
        }
      }
    }
  }, [allEvents, loading, viewYear, viewMonth, today, hasNavigatedBack]);

  // Derive unique locations from events for filters and legend
  const locationMetadata = useMemo(() => {
    const map = new Map<string, { label: string; colorClass: string; dotClass: string; price: number }>();
    const extraColors = [
      { colorClass: 'bg-amber-500', dotClass: 'bg-amber-500' },
      { colorClass: 'bg-indigo-500', dotClass: 'bg-indigo-500' },
      { colorClass: 'bg-rose-500', dotClass: 'bg-rose-500' },
      { colorClass: 'bg-cyan-500', dotClass: 'bg-cyan-500' },
    ];

    let extraColorIdx = 0;
    // Sort events to ensure bloom/magnolia get priority if they exist (to keep colors stable)
    const sortedEvents = [...allEvents].sort((a, b) => {
      if (a.locationId === 'bloom') return -1;
      if (b.locationId === 'bloom') return 1;
      if (a.locationId === 'magnolia') return -1;
      if (b.locationId === 'magnolia') return 1;
      return 0;
    });

    for (const ev of sortedEvents) {
      if (!map.has(ev.locationId)) {
        let color;
        if (ev.locationId === 'bloom') {
          color = { colorClass: 'bg-primary', dotClass: 'bg-primary' };
        } else if (ev.locationId === 'magnolia') {
          color = { colorClass: 'bg-emerald-500', dotClass: 'bg-emerald-500' };
        } else {
          color = extraColors[extraColorIdx % extraColors.length];
          extraColorIdx++;
        }

        map.set(ev.locationId, {
          label: ev.locationName,
          colorClass: color.colorClass,
          dotClass: color.dotClass,
          price: ev.pricePerPerson,
        });
      }
    }
    return map;
  }, [allEvents]);

  const filteredEvents = useMemo(
    () => filter === 'all' ? allEvents : allEvents.filter((e) => e.locationId === filter),
    [allEvents, filter],
  );

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of filteredEvents) {
      const arr = map.get(ev.date) ?? [];
      arr.push(ev);
      map.set(ev.date, arr);
    }
    return map;
  }, [filteredEvents]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = ((new Date(viewYear, viewMonth, 1).getDay() + 6) % 7);

  // Determine which week indices have active/upcoming events
  const weeksWithEvents = useMemo(() => {
    const activeWeeks = new Set<number>();
    const todayStr = today.toISOString().slice(0, 10);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasEvents = (eventsByDate.get(dateStr) ?? []).length > 0;
      const isPastDate = dateStr < todayStr;
      
      if (hasEvents && !isPastDate) {
        const cellIndex = firstDayOfWeek + (day - 1);
        const weekIndex = Math.floor(cellIndex / 7);
        activeWeeks.add(weekIndex);
      }
    }
    return activeWeeks;
  }, [daysInMonth, firstDayOfWeek, eventsByDate, today, viewYear, viewMonth]);

  const prevMonth = useCallback(() => {
    setHasNavigatedBack(true);
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    setHasNavigatedBack(false);
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return d < now;
  };

  const toDateStr = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const handleDayClick = (day: number) => {
    const dateStr = toDateStr(day);
    const dayEvents = eventsByDate.get(dateStr);
    if (dayEvents && dayEvents.length > 0) {
      onSelectDate(dateStr, dayEvents);
    }
  };

  const getLocationBadgeIds = (dateStr: string) => {
    const events = eventsByDate.get(dateStr);
    if (!events) return [];
    // Return unique location IDs for this day
    return Array.from(new Set(events.map((e) => e.locationId)));
  };

  const dynamicFilters = useMemo(() => {
    const f: { key: LocationFilter; label: string; colorClass?: string }[] = [
      { key: 'all', label: t('booking.calendar.filterAll') },
    ];
    locationMetadata.forEach((meta, id) => {
      f.push({ key: id, label: meta.label, colorClass: meta.dotClass });
    });
    return f;
  }, [locationMetadata, t]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-dark mb-3">
          {t('booking.calendar.title')}
        </h2>
        <p className="text-neutral-gray font-body text-base">
          {t('booking.calendar.subtitle')}
        </p>
      </div>

      {/* Location filter tabs */}
      <div className="flex justify-center flex-wrap gap-2 mb-6">
        {dynamicFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center ${
              filter === f.key
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-neutral-gray hover:bg-neutral-cream border border-neutral-sand/40'
            }`}
          >
            {f.colorClass && (
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${filter === f.key ? 'bg-white' : f.colorClass}`} />
            )}
            {f.label}
          </button>
        ))}
      </div>

      {/* Calendar card */}
      <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="p-2 rounded-xl hover:bg-neutral-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 text-neutral-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <AnimatePresence mode="wait">
            <motion.span
              key={`${viewYear}-${viewMonth}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-display text-lg font-semibold text-neutral-dark"
            >
              {monthNames[viewMonth]} {viewYear}
            </motion.span>
          </AnimatePresence>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-neutral-cream transition-colors"
          >
            <svg className="w-5 h-5 text-neutral-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day names header */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((name) => (
            <div key={name} className="text-center text-xs font-medium text-neutral-gray uppercase tracking-wider py-2">
              {name}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl z-10">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          {/* Empty cells for offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = toDateStr(day);
            const past = isPast(day);
            const dayLocationIds = getLocationBadgeIds(dateStr);
            const hasEvents = dayLocationIds.length > 0;
            const isSelected = dateStr === selectedDate;
            
            const cellIndex = firstDayOfWeek + i;
            const weekIndex = Math.floor(cellIndex / 7);
            const weekHasEvents = weeksWithEvents.has(weekIndex);

            return (
              <motion.button
                key={day}
                whileHover={hasEvents && !past && weekHasEvents ? { scale: 1.05 } : undefined}
                whileTap={hasEvents && !past && weekHasEvents ? { scale: 0.95 } : undefined}
                disabled={past || !hasEvents || !weekHasEvents}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 relative transition-all text-sm
                  ${past ? 'text-neutral-sand cursor-not-allowed' : ''}
                  ${!past && !hasEvents ? 'text-neutral-gray/50 cursor-default' : ''}
                  ${!past && hasEvents ? 'cursor-pointer hover:bg-neutral-cream font-medium text-neutral-dark' : ''}
                  ${isSelected ? '!bg-primary/10 ring-2 ring-primary' : ''}
                  ${!weekHasEvents ? 'opacity-25 pointer-events-none' : ''}
                `}
              >
                <span className={isSelected ? 'text-primary font-bold' : ''}>{day}</span>
                {hasEvents && !past && (
                  <div className="flex gap-0.5">
                    {dayLocationIds.map((locId) => {
                      const meta = locationMetadata.get(locId);
                      return meta ? (
                        <span 
                          key={locId}
                          className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} 
                          title={meta.label} 
                        />
                      ) : null;
                    })}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 pt-4 border-t border-neutral-sand/30">
          {Array.from(locationMetadata.entries()).map(([id, meta]) => (
            <div key={id} className="flex items-center gap-2 text-xs text-neutral-gray">
              <span className={`w-2.5 h-2.5 rounded-full ${meta.dotClass}`} />
              {meta.label} · €{meta.price}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
