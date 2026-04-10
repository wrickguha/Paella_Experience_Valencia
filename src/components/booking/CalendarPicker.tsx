import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import type { DayAvailability } from '@/services/mockData';

interface Props {
  selectedDate: string;
  onSelect: (date: string) => void;
  getAvailability: (year: number, month: number) => DayAvailability[];
  locationName: string;
}

export default function CalendarPicker({ selectedDate, onSelect, getAvailability, locationName }: Props) {
  const { t } = useTranslation();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthNames = t('booking.calendar.monthNames', { returnObjects: true }) as string[];
  const dayNames = t('booking.calendar.dayNames', { returnObjects: true }) as string[];

  const availability = useMemo(
    () => getAvailability(viewYear, viewMonth),
    [getAvailability, viewYear, viewMonth],
  );

  const availableDates = useMemo(
    () => new Set(availability.map((a) => a.date)),
    [availability],
  );

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Monday = 0 .. Sunday = 6
  const firstDayOfWeek = ((new Date(viewYear, viewMonth, 1).getDay() + 6) % 7);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const toDateStr = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const canGoPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth();

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-neutral-dark mb-2">
          {t('booking.calendar.title')}
        </h2>
        <p className="text-neutral-gray font-body">
          {t('booking.calendar.subtitle', { location: locationName })}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
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
              className="font-display text-lg text-neutral-dark"
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

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-neutral-gray py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = toDateStr(day);
            const past = isPast(day);
            const available = availableDates.has(dateStr);
            const isSelected = selectedDate === dateStr;

            return (
              <motion.button
                key={day}
                whileTap={available && !past ? { scale: 0.9 } : undefined}
                disabled={past || !available}
                onClick={() => onSelect(dateStr)}
                className={`h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary text-white shadow-md'
                    : available && !past
                      ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : past
                        ? 'text-neutral-sand cursor-not-allowed'
                        : 'text-neutral-gray/40 cursor-not-allowed'
                }`}
              >
                {day}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-neutral-gray">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary/20" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary" /> Selected
          </span>
        </div>
      </div>
    </div>
  );
}
