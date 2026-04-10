import { useMemo } from 'react';
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

  // Fixed window: today → today + 7 days (never changes during render)
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const cutoff = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return d;
  }, [today]);

  const todayStr  = today.toISOString().slice(0, 10);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  // Always fetch current month; also fetch next month in case the 7-day
  // window crosses a month boundary (e.g. Apr 28 → May 4).
  const curYear   = today.getFullYear();
  const curMonth  = today.getMonth();
  const nextMonth = curMonth === 11 ? 0  : curMonth + 1;
  const nextYear  = curMonth === 11 ? curYear + 1 : curYear;

  const { events: curEvents,  loading: loadingCur  } = useCalendarMonth(curYear, curMonth);
  const { events: nextEvents, loading: loadingNext } = useCalendarMonth(nextYear, nextMonth);
  const loading = loadingCur || loadingNext;

  const monthNames = i18n.language.startsWith('es') ? MONTH_NAMES_ES : MONTH_NAMES;

  const events = useMemo(() => {
    const all = [...curEvents, ...nextEvents];
    // Deduplicate by date+locationId in case months overlap
    const seen = new Set<string>();
    return all
      .filter((e) => {
        const key = `${e.date}-${e.locationId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return e.date >= todayStr && e.date <= cutoffStr;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [curEvents, nextEvents, todayStr, cutoffStr]);

  // Human-readable date range label e.g. "10 May — 17 May"
  const rangeLabel = useMemo(() => {
    const fmt = (d: Date) =>
      `${d.getDate()} ${monthNames[d.getMonth()]}`;
    return `${fmt(today)} — ${fmt(cutoff)}`;
  }, [today, cutoff, monthNames]);

  const monthKey = `week-${todayStr}`;

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

        {/* Date range badge */}
        <div className="shrink-0">
          <span className="font-heading font-semibold text-neutral-dark text-base bg-neutral-cream px-4 py-2 rounded-full border border-neutral-sand/50">
            {rangeLabel}
          </span>
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
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
