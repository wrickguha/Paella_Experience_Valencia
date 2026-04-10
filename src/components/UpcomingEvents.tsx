import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';
import { useCalendarMonth } from '@/hooks/useCalendarMonth';
import type { CalendarEvent } from '@/services/api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function parseDateParts(dateStr: string) {
  const [, m, d] = dateStr.split('-');
  return { day: parseInt(d, 10), monthIndex: parseInt(m, 10) - 1 };
}

function urgencyClass(spots: number) {
  if (spots <= 3) return 'text-red-500';
  if (spots <= 6) return 'text-amber-500';
  return 'text-emerald-600';
}

interface EventCardProps {
  event: CalendarEvent;
  index: number;
}

function EventCard({ event, index }: EventCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { day, monthIndex } = parseDateParts(event.date);
  const isBloom = event.locationId === 'bloom';
  const monthNames = i18n.language.startsWith('es') ? MONTH_NAMES_ES : MONTH_NAMES;
  const addressKey = isBloom ? 'upcomingEvents.bloomGallery' : 'upcomingEvents.casaMagnolia';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
      className={`relative bg-white rounded-2xl shadow-card overflow-hidden border border-neutral-sand/30 flex flex-col
        ${isBloom ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-emerald-500'}`}
    >
      {/* Price badge */}
      <div className={`absolute top-4 right-4 text-sm font-heading font-bold
        ${isBloom ? 'text-primary' : 'text-emerald-600'}`}>
        €{event.pricePerPerson}.00
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Date + time row */}
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-3xl font-bold text-neutral-dark leading-none">
            {day}
          </span>
          <span className="font-heading text-sm font-semibold text-neutral-gray uppercase tracking-wide">
            {monthNames[monthIndex]} at {event.time}
          </span>
        </div>

        {/* Location badge */}
        <span
          className={`self-start px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold
            ${isBloom
              ? 'bg-primary/10 text-primary'
              : 'bg-emerald-50 text-emerald-700'}`}
        >
          {event.locationName}
        </span>

        {/* Title */}
        <p className="font-heading font-semibold text-neutral-dark text-sm leading-snug">
          {isBloom
            ? 'Saturdays — The Paella Experience · 12–4pm · Bloom Gallery, Ruzafa'
            : 'Weekdays — The Paella Experience · 1–5pm · Casa Magnolia'}
        </p>

        {/* Address */}
        <p className="text-xs text-neutral-gray font-body leading-relaxed">
          {t(addressKey)}
        </p>

        {/* Footer: status + slots */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-sand/40">
          <span className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            {t('upcomingEvents.open')}
          </span>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-heading font-semibold ${urgencyClass(event.spotsLeft)}`}>
              <span className="font-bold">{event.spotsLeft}</span> {t('upcomingEvents.slotsLeft')}
            </span>
            <button
              onClick={() => navigate(`/booking?location=${event.locationId}&date=${event.date}`)}
              className={`px-3 py-1 rounded-lg text-xs font-heading font-semibold text-white transition-opacity hover:opacity-90
                ${isBloom ? 'bg-primary' : 'bg-emerald-600'}`}
            >
              {t('upcomingEvents.bookNow')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function UpcomingEvents() {
  const { t, i18n } = useTranslation();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const monthNames = i18n.language.startsWith('es') ? MONTH_NAMES_ES : MONTH_NAMES;

  const { events: rawEvents, loading } = useCalendarMonth(year, monthIndex);

  const events = useMemo(
    () => rawEvents
      .filter((e) => new Date(e.date) >= today)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [rawEvents],
  );

  const canGoPrev = !(year === today.getFullYear() && monthIndex === today.getMonth());

  function prevMonth() {
    if (!canGoPrev) return;
    setDirection(-1);
    if (monthIndex === 0) { setYear(y => y - 1); setMonthIndex(11); }
    else setMonthIndex(m => m - 1);
  }

  function nextMonth() {
    setDirection(1);
    if (monthIndex === 11) { setYear(y => y + 1); setMonthIndex(0); }
    else setMonthIndex(m => m + 1);
  }

  const monthKey = `${year}-${monthIndex}`;

  return (
    <SectionWrapper className="bg-white">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
        <div>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-heading font-semibold uppercase tracking-wider mb-3">
            Reserve Your Spot
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-dark mb-2">
            {t('upcomingEvents.title')}
          </h2>
          <p className="text-neutral-gray font-body max-w-lg">
            {t('upcomingEvents.subtitle')}
          </p>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-heading font-semibold text-neutral-dark text-base min-w-[120px] text-right">
            {monthNames[monthIndex]} {year}
          </span>
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            aria-label="Previous month"
            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors
              ${canGoPrev
                ? 'border-neutral-sand text-neutral-dark hover:border-primary hover:text-primary'
                : 'border-neutral-sand/40 text-neutral-sand cursor-not-allowed'}`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="w-9 h-9 rounded-lg border border-neutral-sand text-neutral-dark flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex gap-5 mb-8">
        <span className="inline-flex items-center gap-2 text-xs font-heading font-semibold text-neutral-gray">
          <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
          Bloom Gallery
        </span>
        <span className="inline-flex items-center gap-2 text-xs font-heading font-semibold text-neutral-gray">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
          Casa Magnolia
        </span>
      </div>

      {/* ── Event grid ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
      <AnimatePresence mode="wait">
        <motion.div
          key={monthKey}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 40 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {events.length === 0 ? (
            <div className="text-center py-16 text-neutral-gray font-body">
              {t('upcomingEvents.noEvents')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event, i) => (
                <EventCard key={`${event.date}-${event.locationId}`} event={event} index={i} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      )}

      {/* ── Footer CTA ── */}
      <div className="text-center mt-12">
        <Link
          to="/booking"
          className="inline-flex items-center gap-2 text-primary font-heading font-semibold text-sm hover:underline underline-offset-4"
        >
          {t('upcomingEvents.viewAll')}
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </SectionWrapper>
  );
}
