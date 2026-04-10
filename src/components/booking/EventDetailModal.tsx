import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import type { CalendarEvent } from '@/services/api';

interface Props {
  events: CalendarEvent[];
  date: string;
  isOpen: boolean;
  onClose: () => void;
  onBook: (event: CalendarEvent) => void;
}

export default function EventDetailModal({ events, date, isOpen, onClose, onBook }: Props) {
  const { t } = useTranslation();

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop + flex centering container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
          >
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-elevated w-full max-w-lg max-h-[85vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-dark/10 hover:bg-neutral-dark/20 transition-colors"
            >
              <svg className="w-4 h-4 text-neutral-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Date header */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-6 pt-6 pb-4">
              <p className="text-xs uppercase tracking-wider text-primary font-medium mb-1">
                {t('booking.calendar.available')}
              </p>
              <h3 className="font-display text-xl font-bold text-neutral-dark">{formattedDate}</h3>
            </div>

            {/* Event cards */}
            <div className="p-4 space-y-4">
              {events.map((event, idx) => (
                <motion.div
                  key={`${event.locationId}-${event.time}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group rounded-xl border border-neutral-sand/40 overflow-hidden hover:shadow-card transition-shadow"
                >
                  {/* Image */}
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.locationName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Location badge */}
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white ${
                        event.locationId === 'bloom' ? 'bg-primary' : 'bg-emerald-500'
                      }`}
                    >
                      {event.locationName}
                    </span>
                    {/* Price badge */}
                    <div className="absolute bottom-3 right-3 text-white text-right">
                      <span className="font-display text-2xl font-bold">€{event.pricePerPerson}</span>
                      <span className="text-xs block text-white/80">/{t('booking.eventCard.perPerson')}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-heading font-semibold text-neutral-dark mb-2">
                      Paella Experience {t('booking.eventCard.at')} {event.locationName}
                    </h4>

                    <div className="flex flex-wrap gap-3 text-sm text-neutral-gray mb-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.locationId === 'bloom' ? 'Ruzafa, Valencia' : 'Alzira'}
                      </div>
                    </div>

                    {/* Spots left urgency */}
                    <div className={`text-xs font-medium mb-4 ${
                      event.spotsLeft <= 4 ? 'text-red-500' : 'text-neutral-gray'
                    }`}>
                      {event.spotsLeft <= 4
                        ? t('booking.eventCard.onlyFewLeft', { count: event.spotsLeft })
                        : t('booking.eventCard.spotsLeft', { count: event.spotsLeft })
                      }
                    </div>

                    {/* Book Now CTA */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onBook(event)}
                      className="w-full py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 shadow-md transition-colors text-sm"
                    >
                      {t('booking.eventCard.bookNow')}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
