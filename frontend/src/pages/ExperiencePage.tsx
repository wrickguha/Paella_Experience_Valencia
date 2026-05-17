import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollToTop, useScrollReveal } from '@/hooks/useScrollReveal';
import { fetchLocations, type FrontendLocation, type LocationSchedule } from '@/services/api';


// ── Helpers ───────────────────────────────────────────────────────
const BADGE_COLORS = ['bg-primary', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500'];

function slugFromName(name: string): string {
  const normalized = name.toLowerCase().trim();
  if (normalized === 'bloom gallery') return 'bloom';
  if (normalized === 'casa magnolia' || normalized === 'casa mangolia') return 'magnolia';
  
  return normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatAvailability(schedules: LocationSchedule[], availabilityType: string): string {
  if (schedules.length === 0) return availabilityType || 'Available';
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const days = [...new Set(schedules.map((s) => s.day_of_week))].sort();
  if (days.length === 1) return `${dayNames[days[0]]}s`;
  if (days.length >= 5) return 'Most days';
  return days.map((d) => dayNames[d]).join(', ');
}

function formatTime(schedules: LocationSchedule[]): string {
  if (schedules.length === 0) return '';
  const s = schedules[0];
  const start = s.start_time.substring(0, 5);
  const end = s.end_time.substring(0, 5);
  return `${start} – ${end}`;
}

// ── LocationSection ───────────────────────────────────────────────
function LocationSection({
  location,
  side,
  badgeColor,
}: {
  location: FrontendLocation;
  side: 'left' | 'right';
  badgeColor: string;
}) {
  const { t } = useTranslation();
  const { ref, isInView } = useScrollReveal();
  const locationSlug = slugFromName(location.name);
  const availability = formatAvailability(location.schedules, location.availability_type);
  const time = formatTime(location.schedules);
  const fallbackImage = location.hero_image || location.image || '';
  const images = location.gallery && location.gallery.length > 0
    ? location.gallery
    : fallbackImage ? [fallbackImage] : [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1);

  const nextSlide = useCallback(() => {
    setSlideDir(1);
    setCurrentSlide((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [images.length, nextSlide]);

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7 }}
      className="section-padding"
    >
      <div className="container-max">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${side === 'right' ? 'lg:flex-row-reverse' : ''}`}>
          {/* Image Slideshow */}
          <motion.div
            className={`relative rounded-2xl overflow-hidden shadow-elevated ${side === 'right' ? 'lg:order-2' : ''}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative w-full h-72 sm:h-96 lg:h-[480px]">
              <AnimatePresence initial={false} custom={slideDir}>
                {images.length > 0 && (
                  <motion.img
                    key={currentSlide}
                    custom={slideDir}
                    src={images[currentSlide]}
                    alt={`${location.name} ${currentSlide + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    variants={{
                      enter: (dir: number) => ({ opacity: 0, x: dir * 60 }),
                      center: { opacity: 1, x: 0 },
                      exit: (dir: number) => ({ opacity: 0, x: dir * -60 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                    loading="lazy"
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            {availability && (
              <span className={`absolute top-4 left-4 ${badgeColor} text-white text-xs font-semibold px-3 py-1.5 rounded-full`}>
                {availability}
              </span>
            )}
            {/* Dots indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSlideDir(idx > currentSlide ? 1 : -1); setCurrentSlide(idx); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentSlide ? 'bg-white w-5' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Content */}
          <div className={side === 'right' ? 'lg:order-1' : ''}>
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-dark mb-2">
              {location.name}
            </h3>
            {location.subtitle && (
              <p className="text-primary font-heading font-semibold text-sm mb-4">{location.subtitle}</p>
            )}
            <p className="text-neutral-gray font-body leading-relaxed mb-6">
              {location.description}
            </p>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-neutral-cream rounded-xl p-3">
                <p className="text-xs text-neutral-gray uppercase tracking-wider">📍 {t('booking.eventCard.location')}</p>
                <p className="font-heading font-semibold text-sm text-neutral-dark">{location.address}</p>
              </div>
              {time && (
                <div className="bg-neutral-cream rounded-xl p-3">
                  <p className="text-xs text-neutral-gray uppercase tracking-wider">⏱ {t('booking.eventCard.time')}</p>
                  <p className="font-heading font-semibold text-sm text-neutral-dark">{time}</p>
                </div>
              )}
            </div>

            {/* Features */}
            {location.features.length > 0 && (
              <ul className="space-y-2 mb-8">
                {location.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-dark font-body">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
            )}

            {/* Price + CTA */}
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to={`/booking?location=${locationSlug}`}
                className="btn-primary !px-8 !py-3.5"
              >
                Join the {location.name} Experience
              </Link>
              {location.price != null && (
                <p className="font-display text-2xl font-bold text-neutral-dark">
                  €{location.price}
                  <span className="text-sm font-normal text-neutral-gray"> /{t('booking.eventCard.perPerson')}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ── Locations Intro ───────────────────────────────────────────────
function LocationsIntro() {
  return (
    <section className="relative py-24 bg-white overflow-hidden border-t border-neutral-sand/20">
      {/* Decorative background elements */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" 
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl" 
      />
      
      <div className="container-max px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl text-primary mb-8 border border-neutral-sand/20"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </motion.div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-dark mb-6 tracking-tight">
            Experiences & Places
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <p className="text-xl sm:text-2xl text-neutral-dark font-body leading-relaxed font-medium">
              At Speak Easy Valencia, the experience is not only about the language. It’s also about <span className="text-primary italic font-bold">where it happens</span>.
            </p>
            <p className="text-lg sm:text-xl text-neutral-gray font-body leading-relaxed">
              We carefully choose places that invite people to slow down, connect naturally, and experience the way of life through conversation, food, culture, and sobremesa.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function ExperiencePage() {
  const { t, i18n } = useTranslation();
  useScrollToTop();

  const [locations, setLocations] = useState<FrontendLocation[]>([]);
  const [locLoading, setLocLoading] = useState(true);

  useEffect(() => {
    setLocLoading(true);
    fetchLocations(i18n.language)
      .then(setLocations)
      .catch(() => setLocations([]))
      .finally(() => setLocLoading(false));
  }, [i18n.language]);

  return (
    <>
      {/* ── Location Sections ─────────────────────────── */}
      <LocationsIntro />
      <div id="locations" />
      {locLoading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : locations.length === 0 ? (
        <div className="section-padding">
          <div className="container-max">
            <div className="mx-auto max-w-3xl rounded-3xl border border-primary/10 bg-neutral-cream px-6 py-12 text-center">
              <p className="font-heading text-xl font-semibold text-neutral-dark">No Locations Found</p>
            </div>
          </div>
        </div>
      ) : (
        locations.map((loc, index) => (
          <LocationSection
            key={loc.id}
            location={loc}
            side={index % 2 === 0 ? 'left' : 'right'}
            badgeColor={BADGE_COLORS[index % BADGE_COLORS.length]}
          />
        ))
      )}
    </>
  );
}
