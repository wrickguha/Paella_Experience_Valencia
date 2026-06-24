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

  // Custom date schedules have day_of_week = null and a specific date
  const isCustomDate = schedules.every((s) => s.day_of_week == null);
  if (isCustomDate) {
    // Find the closest upcoming date (or just first one)
    const sorted = [...schedules]
      .filter((s) => s.date)
      .sort((a, b) => (a.date! > b.date! ? 1 : -1));
    if (sorted.length === 0) return 'Custom Date';
    const d = new Date(sorted[0].date! + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const days = [...new Set(schedules.map((s) => s.day_of_week))].filter((d): d is number => d != null).sort();
  if (days.length === 0) return availabilityType || 'Available';
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

function cleanImageUrl(url: string | null): string {
  if (!url) return '';
  if (url.startsWith('http')) {
    const storageIndex = url.indexOf('/storage/');
    if (storageIndex !== -1) {
      return url.substring(storageIndex);
    }
    const assetsIndex = url.indexOf('/assets/');
    if (assetsIndex !== -1) {
      return url.substring(assetsIndex);
    }
  }
  return url;
}

function SafeImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-neutral-sand/10 border-b border-neutral-sand/10 flex flex-col items-center justify-center text-neutral-dark p-4 gap-2 text-center min-h-[180px]">
        <span className="text-3xl">📍</span>
        <span className="text-[10px] font-semibold text-neutral-gray uppercase tracking-wider">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

// ── ModalLocationDetails ──────────────────────────────────────────
function ModalLocationDetails({ location }: { location: FrontendLocation }) {
  const { t } = useTranslation();
  const locationSlug = slugFromName(location.name);
  const availability = formatAvailability(location.schedules, location.availability_type);
  const time = formatTime(location.schedules);
  const fallbackImage = cleanImageUrl(location.hero_image || location.image || location.gallery?.[0] || '');
  const images = location.gallery && location.gallery.length > 0
    ? location.gallery.map(cleanImageUrl)
    : fallbackImage ? [fallbackImage] : [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const [slideErrors, setSlideErrors] = useState<Record<number, boolean>>({});

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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 h-full items-stretch">
      {/* Left Column: Image Slideshow & Quick Info */}
      <div className="md:col-span-6 flex flex-col justify-between gap-4">
        {/* Image Slideshow */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm flex-1 min-h-[220px] md:min-h-[280px] max-h-[340px]">
          <div className="absolute inset-0">
            <AnimatePresence initial={false} custom={slideDir}>
              {images.length > 0 && (
                slideErrors[currentSlide] ? (
                  <div key={`err-${currentSlide}`} className="w-full h-full bg-neutral-sand/10 flex flex-col items-center justify-center text-neutral-dark p-4 gap-2 text-center">
                    <span className="text-4xl">📍</span>
                    <span className="text-xs font-semibold text-neutral-gray uppercase tracking-wider">Image unavailable</span>
                  </div>
                ) : (
                  <motion.img
                    key={currentSlide}
                    custom={slideDir}
                    src={images[currentSlide]}
                    onError={() => setSlideErrors(prev => ({ ...prev, [currentSlide]: true }))}
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
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    loading="lazy"
                  />
                )
              )}
            </AnimatePresence>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          {availability && (
            <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
              {availability}
            </span>
          )}
          {location.category && (
            <span className={`absolute top-3 right-3 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10 ${
              location.category === 'countryside' ? 'bg-emerald-600' : 'bg-slate-700'
            }`}>
              {location.category === 'countryside' ? '🌿 Countryside' : '🏙️ City'}
            </span>
          )}
          {/* Dots indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSlideDir(idx > currentSlide ? 1 : -1); setCurrentSlide(idx); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentSlide ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 flex-shrink-0">
          <div className="bg-neutral-cream rounded-xl p-3 border border-neutral-sand/10">
            <p className="text-[9px] uppercase tracking-wider text-neutral-gray mb-0.5">📍 {t('booking.eventCard.location')}</p>
            {location.maps_link ? (
              <a
                href={location.maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-heading font-semibold text-xs text-primary hover:underline"
              >
                View on Maps
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <p className="font-heading font-semibold text-xs text-neutral-dark truncate">{location.address}</p>
            )}
          </div>
          {time && (
            <div className="bg-neutral-cream rounded-xl p-3 border border-neutral-sand/10">
              <p className="text-[9px] uppercase tracking-wider text-neutral-gray mb-0.5">⏱ {t('booking.eventCard.time')}</p>
              <p className="font-heading font-semibold text-xs text-neutral-dark">{time}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Title, Description, Features & Booking CTA */}
      <div className="md:col-span-6 flex flex-col justify-between h-full gap-4 md:overflow-y-auto md:pr-2">
        <div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-neutral-dark mb-1">
            {location.name}
          </h3>
          {location.subtitle && (
            <p className="text-primary font-heading font-semibold text-xs sm:text-sm mb-3">{location.subtitle}</p>
          )}
          <div className="text-neutral-gray font-body leading-relaxed text-xs sm:text-sm mb-4 space-y-3">
            {location.description.split('\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para.trim()}</p>
            ))}
          </div>

          {/* Features */}
          {location.features && location.features.length > 0 && (
            <div className="bg-neutral-cream/20 rounded-xl p-4 border border-neutral-sand/10">
              <p className="text-[9px] uppercase tracking-wider text-neutral-gray mb-2 font-semibold">✨ Highlights</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {location.features.slice(0, 4).map((feat, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-neutral-dark font-body">
                    <svg className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="truncate">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-neutral-sand/20 flex-shrink-0">
          {location.price != null && (
            <div>
              <p className="text-[9px] uppercase tracking-wider text-neutral-gray mb-0.5">Price per person</p>
              <p className="font-display text-xl sm:text-2xl font-bold text-neutral-dark">
                €{location.price}
              </p>
            </div>
          )}
          {location.is_active !== false && location.experience_is_active !== false ? (
            <Link
              to={`/booking?location=${locationSlug}`}
              className="btn-primary !px-6 !py-3 text-xs sm:text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg text-center"
            >
              Save your seat at the table
            </Link>
          ) : (
            <button
              disabled
              className="px-6 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap bg-neutral-sand/20 text-neutral-gray rounded-xl cursor-not-allowed text-center"
            >
              Booking Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
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
            Experiences & Locations
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'city' | 'countryside' | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<FrontendLocation | null>(null);

  useEffect(() => {
    setLocLoading(true);
    fetchLocations(i18n.language)
      .then(setLocations)
      .catch(() => setLocations([]))
      .finally(() => setLocLoading(false));
  }, [i18n.language]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const getCountForCategory = (cat: 'city' | 'countryside') => {
    return locations.filter((loc) => (loc.category || 'city') === cat).length;
  };

  const handleOpenCategory = (cat: 'city' | 'countryside') => {
    setActiveCategory(cat);
    setIsModalOpen(true);
    setSelectedLocation(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveCategory(null);
    setSelectedLocation(null);
  };

  const filteredLocations = locations.filter(
    (loc) => (loc.category || 'city') === activeCategory
  );

  return (
    <>
      {/* ── Location Sections ─────────────────────────── */}
      <LocationsIntro />
      <div id="locations" />

      {/* Category Selection Cards */}
      <section className="pb-24 bg-white">
        <div className="container-max px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* City Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.4 }}
              onClick={() => handleOpenCategory('city')}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer shadow-elevated group"
            >
              <img
                src="/city-experience.png"
                alt="City Experiences"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-955/90 via-slate-900/40 to-transparent bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20">
                  🏙️
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-primary bg-white/95 border border-primary/20 uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-sm">
                      {getCountForCategory('city')} {getCountForCategory('city') === 1 ? 'Location' : 'Locations'}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                    {t('experience.categories.city.title', 'City Experiences')}
                  </h3>
                  <p className="text-white/80 font-body text-xs sm:text-sm leading-relaxed max-w-sm">
                    {t('experience.categories.city.subtitle', 'Immersion in urban cooking studios, historical venues, and local life')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Countryside Card */}
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.4 }}
              onClick={() => handleOpenCategory('countryside')}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer shadow-elevated group"
            >
              <img
                src="https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=800&auto=format&fit=crop"
                alt="Countryside Experiences"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-955/40 to-transparent bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-transparent" />
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20">
                  🌿
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-emerald-600 bg-white/95 border border-emerald-100 uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-sm">
                      {getCountForCategory('countryside')} {getCountForCategory('countryside') === 1 ? 'Location' : 'Locations'}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                    {t('experience.categories.countryside.title', 'Countryside Experiences')}
                  </h3>
                  <p className="text-white/80 font-body text-xs sm:text-sm leading-relaxed max-w-sm">
                    {t('experience.categories.countryside.subtitle', 'Gatherings in quiet fincas, surrounded by nature and orange groves')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Two-Stage Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && activeCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-hidden"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative w-full max-w-5xl h-[90vh] md:h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-sand/20 bg-neutral-cream/40">
                <div className="flex items-center gap-3">
                  {selectedLocation && (
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="p-2 -ml-2 rounded-full hover:bg-neutral-sand/10 text-neutral-dark transition-colors flex items-center gap-1 text-sm font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      {t('experience.back', 'Back')}
                    </button>
                  )}
                  <div className="flex flex-col">
                    <h3 className="font-display font-bold text-neutral-dark text-lg md:text-xl leading-tight">
                      {selectedLocation
                        ? selectedLocation.name
                        : activeCategory === 'city'
                          ? t('experience.categories.city.title', 'City Experiences')
                          : t('experience.categories.countryside.title', 'Countryside Experiences')
                      }
                    </h3>
                    {!selectedLocation && (
                      <p className="text-neutral-gray text-xs font-body mt-0.5">
                        {activeCategory === 'city'
                          ? t('experience.categories.city.subtitle', 'Immersion in urban cooking studios, historical venues, and local life')
                          : t('experience.categories.countryside.subtitle', 'Gatherings in quiet fincas, surrounded by nature and orange groves')
                        }
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-neutral-sand/15 text-neutral-gray hover:text-neutral-dark transition-all duration-200"
                  aria-label={t('experience.close', 'Close')}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${selectedLocation ? 'md:overflow-hidden' : ''}`}>
                {locLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {!selectedLocation ? (
                      /* Stage 1: Location Selection List */
                      <motion.div
                        key="stage-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-full flex flex-col justify-center"
                      >
                        {filteredLocations.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                            <p className="font-heading text-lg font-semibold text-neutral-dark">
                              {t('experience.noLocations', 'No Locations Found')}
                            </p>
                            <p className="text-neutral-gray mt-2 font-body max-w-md">
                              {t('experience.noLocationsDesc', 'We are currently curating more premium experiences for this category. Please check back soon!')}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-6 py-4">
                            {filteredLocations.map((loc) => {
                              const fallbackImage = cleanImageUrl(loc.hero_image || loc.image || loc.gallery?.[0] || '');
                              return (
                                <motion.div
                                  key={loc.id}
                                  whileHover={{ y: -4, scale: 1.01 }}
                                  className="w-full max-w-2xl bg-neutral-cream/30 border border-neutral-sand/20 rounded-3xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer flex flex-col sm:flex-row h-auto transition-all duration-300 group"
                                  onClick={() => setSelectedLocation(loc)}
                                >
                                  {/* Card Image */}
                                  <div className="relative w-full sm:w-56 aspect-[4/3] sm:aspect-auto sm:h-auto overflow-hidden flex-shrink-0">
                                    <SafeImage
                                      src={fallbackImage}
                                      alt={loc.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {loc.category && (
                                      <span className="absolute top-3 left-3 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm">
                                        {loc.category === 'countryside' ? '🌿 Countryside' : '🏙️ City'}
                                      </span>
                                    )}
                                  </div>
                                  {/* Card Content */}
                                  <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                      <div className="flex justify-between items-start gap-2 mb-1">
                                        <h4 className="font-display font-bold text-neutral-dark text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                                          {loc.name}
                                          {(loc.is_active === false || loc.experience_is_active === false) && (
                                            <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 uppercase tracking-widest px-2 py-0.5 rounded-md">
                                              No active events
                                            </span>
                                          )}
                                        </h4>
                                        {loc.price != null && (
                                          <span className="text-primary font-display font-bold text-sm">€{loc.price}</span>
                                        )}
                                      </div>
                                      {loc.subtitle && (
                                        <p className="text-primary font-heading font-semibold text-xs mb-2">
                                          {loc.subtitle}
                                        </p>
                                      )}
                                      <p className="text-neutral-gray font-body text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 mb-4">
                                        {loc.description}
                                      </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-neutral-sand/20 text-[11px] font-semibold text-neutral-dark">
                                      <span className="flex items-center gap-1">📅 {formatAvailability(loc.schedules, loc.availability_type)}</span>
                                      <span className="text-primary hover:underline flex items-center gap-0.5">
                                        Explore
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      /* Stage 2: Location Details View */
                      <motion.div
                        key="stage-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <ModalLocationDetails location={selectedLocation} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
