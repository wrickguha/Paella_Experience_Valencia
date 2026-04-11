import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollToTop, useScrollReveal } from '@/hooks/useScrollReveal';
import GalleryGrid from '@/components/GalleryGrid';
import Testimonials from '@/components/Testimonials';
import FAQSection from '@/components/FAQSection';
import FinalCTA from '@/components/FinalCTA';
import { fetchLocations, type FrontendLocation, type LocationSchedule } from '@/services/api';

// ── Helpers ───────────────────────────────────────────────────────
const BADGE_COLORS = ['bg-primary', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500'];

function slugFromName(name: string): string {
  return name.toLowerCase().includes('magnolia') ? 'magnolia' : 'bloom';
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

  const nextSlide = useCallback(() => {
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
              <AnimatePresence mode="wait">
                {images.length > 0 && (
                  <motion.img
                    key={currentSlide}
                    src={images[currentSlide]}
                    alt={`${location.name} ${currentSlide + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
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
                    onClick={() => setCurrentSlide(idx)}
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
                Book {location.name} Experience
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

// ── Page ──────────────────────────────────────────────────────────
export default function ExperiencePage() {
  const { t, i18n } = useTranslation();
  useScrollToTop();
  const introParagraphs = t('experience.intro.paragraphs', { returnObjects: true }) as string[];

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
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=1600&q=80"
            alt="Valencia cooking experience"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        </div>
        <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6"
            >
              ⭐ 4.9/5 — 2,400+ {t('socialProof.reviewCount').split(' ')[0]} reviews
            </motion.span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t('experience.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 font-body mb-10 max-w-2xl mx-auto">
              {t('experience.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking" className="btn-primary !text-lg !px-10 !py-5">
                {t('hero.cta')}
              </Link>
              <a href="#locations" className="px-10 py-5 rounded-2xl text-lg font-semibold text-white border-2 border-white/40 hover:bg-white/10 transition-colors">
                {t('highlights.subtitle').split('—')[0].trim()} ↓
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Intro Section ────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-max max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-dark mb-3">
              {t('experience.intro.title')}
            </h2>
            <p className="text-primary font-heading font-semibold text-sm mb-8">
              {t('experience.intro.subtitle')}
            </p>
          </motion.div>
          <div className="space-y-5">
            {introParagraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-neutral-gray font-body leading-relaxed text-base sm:text-lg"
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location Sections ─────────────────────────── */}
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

      {/* ── Testimonials ─────────────────────────────── */}
      <Testimonials />

      {/* ── Gallery ──────────────────────────────────── */}
      <GalleryGrid />

      {/* ── FAQ ──────────────────────────────────────── */}
      <FAQSection />

      {/* ── Final CTA ────────────────────────────────── */}
      <FinalCTA />
    </>
  );
}
