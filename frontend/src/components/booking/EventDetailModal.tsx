import { useState, useCallback } from 'react';
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

// ── Image Slider ────────────────────────────────────────────────────
interface ImageSliderProps {
  images: string[];
  alt: string;
}

function ImageSlider({ images, alt }: ImageSliderProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // +1 = forward, -1 = backward

  const go = useCallback(
    (next: number) => {
      setDirection(next > index ? 1 : -1);
      setIndex(next);
    },
    [index],
  );

  const prev = useCallback(() => go((index - 1 + images.length) % images.length), [go, index, images.length]);
  const next = useCallback(() => go((index + 1) % images.length), [go, index, images.length]);

  const hasMultiple = images.length > 1;

  // Swipe handling via drag
  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x < -40) next();
      else if (info.offset.x > 40) prev();
    },
    [next, prev],
  );

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '60%' : '-60%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0 }),
  };

  return (
    <div className="relative h-56 sm:h-64 bg-neutral-cream overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.img
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', ease: 'easeInOut', duration: 0.32 }}
          drag={hasMultiple ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={handleDragEnd}
          src={images[index]}
          alt={`${alt} — photo ${index + 1}`}
          className="absolute inset-0 w-full h-full object-cover select-none"
          style={{ cursor: hasMultiple ? 'grab' : 'default' }}
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Arrows */}
      {hasMultiple && (
        <>
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/65 text-white transition-colors backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/65 text-white transition-colors backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`rounded-full transition-all duration-200 ${
                  i === index
                    ? 'w-4 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Modal ──────────────────────────────────────────────────────
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
              {events.map((event, idx) => {
                // Use gallery if available and non-empty, otherwise fall back to single image
                const images =
                  event.gallery && event.gallery.length > 0
                    ? event.gallery
                    : event.image
                    ? [event.image]
                    : [];

                return (
                  <motion.div
                    key={`${event.locationId}-${event.time}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group rounded-xl border border-neutral-sand/40 overflow-hidden hover:shadow-card transition-shadow"
                  >
                    {/* Image slider */}
                    <div className="relative">
                      {images.length > 0 ? (
                        <ImageSlider images={images} alt={event.locationName} />
                      ) : (
                        <div className="h-56 sm:h-64 bg-neutral-100" />
                      )}

                      {/* Location badge — sits above the slider gradient */}
                      <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-primary">
                        {event.locationName}
                      </span>
                      {/* Price badge */}
                      <div className="absolute bottom-3 right-3 z-10 text-white text-right">
                        <span className="font-display text-2xl font-bold">€{event.pricePerPerson}</span>
                        <span className="text-xs block text-white/80">/{t('booking.eventCard.perPerson')}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h4 className="font-heading font-semibold text-neutral-dark mb-2">
                        {event.locationName}
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
                          {event.maps_link ? (
                            <a
                              href={event.maps_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View on Maps
                            </a>
                          ) : (
                            event.address || (event.locationId === 'bloom' ? 'Ruzafa, Valencia' : 'Alzira')
                          )}
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
                );
              })}
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
