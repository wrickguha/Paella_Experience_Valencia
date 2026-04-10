import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScrollToTop, useScrollReveal } from '@/hooks/useScrollReveal';
import GalleryGrid from '@/components/GalleryGrid';
import Testimonials from '@/components/Testimonials';
import FAQSection from '@/components/FAQSection';
import FinalCTA from '@/components/FinalCTA';

function LocationSection({
  side,
  image,
  titleKey,
  subtitleKey,
  descriptionKey,
  featuresKey,
  locationKey,
  availabilityKey,
  timeKey,
  priceKey,
  ctaKey,
  locationId,
  badgeColor,
}: {
  side: 'left' | 'right';
  image: string;
  titleKey: string;
  subtitleKey: string;
  descriptionKey: string;
  featuresKey: string;
  locationKey: string;
  availabilityKey: string;
  timeKey: string;
  priceKey: string;
  ctaKey: string;
  locationId: string;
  badgeColor: string;
}) {
  const { t } = useTranslation();
  const { ref, isInView } = useScrollReveal();
  const features = t(featuresKey, { returnObjects: true }) as string[];

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
          {/* Image */}
          <motion.div
            className={`relative rounded-2xl overflow-hidden shadow-elevated ${side === 'right' ? 'lg:order-2' : ''}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src={image}
              alt={t(titleKey)}
              className="w-full h-72 sm:h-96 lg:h-[480px] object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <span className={`absolute top-4 left-4 ${badgeColor} text-white text-xs font-semibold px-3 py-1.5 rounded-full`}>
              {t(availabilityKey)}
            </span>
          </motion.div>

          {/* Content */}
          <div className={side === 'right' ? 'lg:order-1' : ''}>
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-dark mb-2">
              {t(titleKey)}
            </h3>
            <p className="text-primary font-heading font-semibold text-sm mb-4">{t(subtitleKey)}</p>
            <p className="text-neutral-gray font-body leading-relaxed mb-6">
              {t(descriptionKey)}
            </p>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-neutral-cream rounded-xl p-3">
                <p className="text-xs text-neutral-gray uppercase tracking-wider">📍 {t('booking.eventCard.location')}</p>
                <p className="font-heading font-semibold text-sm text-neutral-dark">{t(locationKey)}</p>
              </div>
              <div className="bg-neutral-cream rounded-xl p-3">
                <p className="text-xs text-neutral-gray uppercase tracking-wider">⏱ {t('booking.eventCard.time')}</p>
                <p className="font-heading font-semibold text-sm text-neutral-dark">{t(timeKey)}</p>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-8">
              {features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-neutral-dark font-body">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>

            {/* Price + CTA */}
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to={`/booking?location=${locationId}`}
                className="btn-primary !px-8 !py-3.5"
              >
                {t(ctaKey)}
              </Link>
              <p className="font-display text-2xl font-bold text-neutral-dark">
                €{t(priceKey)}
                <span className="text-sm font-normal text-neutral-gray"> /{t('booking.eventCard.perPerson')}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default function ExperiencePage() {
  const { t } = useTranslation();
  useScrollToTop();
  const introParagraphs = t('experience.intro.paragraphs', { returnObjects: true }) as string[];

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

      {/* ── Location: Bloom Gallery (left image) ─────── */}
      <div id="locations" />
      <LocationSection
        side="left"
        image="https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=900&q=80"
        titleKey="experience.locations.bloom.title"
        subtitleKey="experience.locations.bloom.subtitle"
        descriptionKey="experience.locations.bloom.description"
        featuresKey="experience.locations.bloom.features"
        locationKey="experience.locations.bloom.location"
        availabilityKey="experience.locations.bloom.availability"
        timeKey="experience.locations.bloom.time"
        priceKey="experience.locations.bloom.price"
        ctaKey="experience.locations.bloom.cta"
        locationId="bloom"
        badgeColor="bg-primary"
      />

      {/* ── Location: Casa Magnolia (right image) ────── */}
      <LocationSection
        side="right"
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80"
        titleKey="experience.locations.magnolia.title"
        subtitleKey="experience.locations.magnolia.subtitle"
        descriptionKey="experience.locations.magnolia.description"
        featuresKey="experience.locations.magnolia.features"
        locationKey="experience.locations.magnolia.location"
        availabilityKey="experience.locations.magnolia.availability"
        timeKey="experience.locations.magnolia.time"
        priceKey="experience.locations.magnolia.price"
        ctaKey="experience.locations.magnolia.cta"
        locationId="magnolia"
        badgeColor="bg-emerald-500"
      />

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
