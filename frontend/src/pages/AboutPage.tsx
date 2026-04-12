import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScrollToTop, useScrollReveal } from '@/hooks/useScrollReveal';
import SectionWrapper from '@/components/SectionWrapper';
import Testimonials from '@/components/Testimonials';
import GalleryGrid from '@/components/GalleryGrid';
import { fetchAbout, type AboutData, type AboutSection } from '@/services/api';

/* ── Animated reveal helper ─────────────────────────────────────── */
function RevealBlock({ children, className = '', delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isInView } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   1. HERO — full-width cinematic header with CTA
   ════════════════════════════════════════════════════════════════════ */
function HeroSection({ data }: { data: AboutSection }) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        {data.image && (
          <img
            src={data.image}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      </div>

      {/* Decorative grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
      }} />

      <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8 py-32 sm:py-40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-16 h-0.5 bg-primary mx-auto mb-8"
          />

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.1]">
            {data.title}
          </h1>

          {data.subtitle && (
            <p className="text-lg sm:text-xl lg:text-2xl text-white/85 font-body max-w-2xl mx-auto mb-10 leading-relaxed">
              {data.subtitle}
            </p>
          )}

          {data.cta_text && data.cta_link && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link
                to={data.cta_link}
                className="inline-flex items-center gap-2 bg-primary text-white font-heading font-bold text-lg
                           px-10 py-5 rounded-xl shadow-elevated hover:bg-primary-600
                           hover:shadow-card transition-all active:scale-[0.98]"
              >
                {data.cta_text}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2. OUR STORY — emotional narrative with side image
   ════════════════════════════════════════════════════════════════════ */
function StorySection({ data }: { data: AboutSection }) {
  return (
    <SectionWrapper className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <RevealBlock>
          <div>
            <span className="inline-block text-primary font-heading font-semibold text-sm uppercase tracking-[0.2em] mb-4">
              {data.subtitle}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-8 leading-tight">
              {data.title}
            </h2>
            {data.content && (
              <div className="space-y-4">
                {data.content.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="text-neutral-gray font-body text-lg leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>
        </RevealBlock>

        {data.image && (
          <RevealBlock delay={0.2}>
            <div className="relative">
              <img
                src={data.image}
                alt={data.title ?? ''}
                className="rounded-2xl shadow-elevated w-full object-cover aspect-[4/3]"
                loading="lazy"
              />
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-2xl -z-10" />
              <div className="absolute -top-4 -left-4 w-20 h-20 border-2 border-primary/20 rounded-2xl -z-10" />
            </div>
          </RevealBlock>
        )}
      </div>
    </SectionWrapper>
  );
}

/* ════════════════════════════════════════════════════════════════════
   3. OUR PHILOSOPHY — reversed layout, warm background
   ════════════════════════════════════════════════════════════════════ */
function PhilosophySection({ data }: { data: AboutSection }) {
  return (
    <section className="relative overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-cream via-white to-primary-50" />

      <SectionWrapper className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {data.image && (
            <RevealBlock>
              <div className="relative lg:order-1 order-2">
                <img
                  src={data.image}
                  alt={data.title ?? ''}
                  className="rounded-2xl shadow-elevated w-full object-cover aspect-[4/3]"
                  loading="lazy"
                />
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-2xl -z-10" />
              </div>
            </RevealBlock>
          )}

          <RevealBlock delay={0.2}>
            <div className="lg:order-2 order-1">
              <span className="inline-block text-primary font-heading font-semibold text-sm uppercase tracking-[0.2em] mb-4">
                {data.subtitle}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-8 leading-tight">
                {data.title}
              </h2>
              {data.content && (
                <div className="space-y-4">
                  {data.content.split('\n').filter(Boolean).map((para, i) => (
                    <p key={i} className="text-neutral-gray font-body text-lg leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </RevealBlock>
        </div>
      </SectionWrapper>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   4. WHAT MAKES US DIFFERENT — icon cards grid
   ════════════════════════════════════════════════════════════════════ */
function DifferentiatorsSection({ data, t }: { data: AboutSection[]; t: (key: string) => string }) {
  const icons = ['🔥', '👥', '🤲', '🏛️', '❤️'];

  return (
    <SectionWrapper className="bg-white">
      <div className="text-center mb-16">
        <span className="inline-block text-primary font-heading font-semibold text-sm uppercase tracking-[0.2em] mb-4">
          {t('about.differentTitle')}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('about.differentHeading')}
        </h2>
        <p className="text-neutral-gray font-body text-lg max-w-2xl mx-auto">
          {t('about.differentSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {data.map((item, idx) => (
          <RevealBlock key={item.id} delay={idx * 0.1}>
            <div className="group relative p-8 rounded-2xl bg-neutral-light/50 border border-transparent
                            hover:border-primary/20 hover:bg-white hover:shadow-card transition-all duration-300">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5
                              group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl">{icons[idx % icons.length]}</span>
              </div>

              <h3 className="font-display text-xl font-bold text-neutral-dark mb-3">
                {item.title}
              </h3>
              <p className="text-neutral-gray font-body leading-relaxed text-[15px]">
                {item.content}
              </p>
            </div>
          </RevealBlock>
        ))}
      </div>
    </SectionWrapper>
  );
}

/* ════════════════════════════════════════════════════════════════════
   5. MEET THE TEAM — personal, human section
   ════════════════════════════════════════════════════════════════════ */
function TeamSection({ data }: { data: AboutSection }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-cream to-neutral-beige" />

      <SectionWrapper className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <RevealBlock>
            <div>
              <span className="inline-block text-primary font-heading font-semibold text-sm uppercase tracking-[0.2em] mb-4">
                {data.subtitle}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-8 leading-tight">
                {data.title}
              </h2>
              {data.content && (
                <div className="space-y-4">
                  {data.content.split('\n').filter(Boolean).map((para, i) => (
                    <p key={i} className="text-neutral-gray font-body text-lg leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </RevealBlock>

          {data.image && (
            <RevealBlock delay={0.2}>
              <div className="relative">
                <img
                  src={data.image}
                  alt={data.title ?? ''}
                  className="rounded-2xl shadow-elevated w-full object-cover aspect-[4/3]"
                  loading="lazy"
                />
                {/* Warm accent overlay on corner */}
                <div className="absolute -bottom-4 -left-4 w-28 h-28 bg-primary/10 rounded-2xl -z-10" />
                <div className="absolute -top-3 -right-3 w-16 h-16 border-2 border-primary/20 rounded-xl -z-10" />
              </div>
            </RevealBlock>
          )}
        </div>
      </SectionWrapper>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   8. WHY PEOPLE LOVE THIS — emotional outcome cards
   ════════════════════════════════════════════════════════════════════ */
function WhyLoveSection({ data, t }: { data: AboutSection[]; t: (key: string) => string }) {
  const icons = ['🤝', '📖', '🌇', '✨'];

  return (
    <SectionWrapper className="bg-white">
      <div className="text-center mb-16">
        <span className="inline-block text-primary font-heading font-semibold text-sm uppercase tracking-[0.2em] mb-4">
          {t('about.whyloveTag')}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('about.whyloveHeading')}
        </h2>
        <p className="text-neutral-gray font-body text-lg max-w-2xl mx-auto">
          {t('about.whyloveSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
        {data.map((item, idx) => (
          <RevealBlock key={item.id} delay={idx * 0.12}>
            <div className="flex gap-5 p-6 rounded-2xl bg-gradient-to-br from-neutral-cream/60 to-white
                            border border-neutral-sand/50 hover:shadow-card transition-all duration-300">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-xl">{icons[idx % icons.length]}</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-neutral-dark mb-2">
                  {item.title}
                </h3>
                <p className="text-neutral-gray font-body text-[15px] leading-relaxed">
                  {item.content}
                </p>
              </div>
            </div>
          </RevealBlock>
        ))}
      </div>
    </SectionWrapper>
  );
}

/* ════════════════════════════════════════════════════════════════════
   9. FINAL CTA — high impact conversion section
   ════════════════════════════════════════════════════════════════════ */
function CTASection({ data }: { data: AboutSection }) {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-700 to-primary-800" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Soft glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/10 rounded-full blur-3xl" />

      <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8">
        <RevealBlock>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="text-lg sm:text-xl text-white/80 font-body max-w-2xl mx-auto mb-12 leading-relaxed">
                {data.subtitle}
              </p>
            )}
            {data.cta_text && data.cta_link && (
              <Link
                to={data.cta_link}
                className="inline-flex items-center gap-3 bg-white text-primary font-heading font-bold text-lg
                           px-14 py-5 rounded-xl shadow-elevated hover:shadow-card
                           hover:bg-neutral-cream transition-all active:scale-[0.98]"
              >
                {data.cta_text}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   LOADING SKELETON
   ════════════════════════════════════════════════════════════════════ */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="h-[80vh] bg-gray-200 animate-pulse relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4 px-4">
            <div className="h-1 w-16 bg-gray-300 rounded mx-auto" />
            <div className="h-12 w-[500px] max-w-full bg-gray-300 rounded mx-auto" />
            <div className="h-6 w-[350px] max-w-full bg-gray-300 rounded mx-auto" />
            <div className="h-14 w-48 bg-gray-300 rounded-xl mx-auto mt-6" />
          </div>
        </div>
      </div>

      {/* Content skeletons */}
      <div className="container-max px-4 py-20 space-y-24">
        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-4">
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-72 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-72 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN ABOUT PAGE
   ════════════════════════════════════════════════════════════════════ */
export default function AboutPage() {
  const { t, i18n } = useTranslation();
  useScrollToTop();

  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAbout(i18n.language)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [i18n.language]);

  if (loading) return <LoadingSkeleton />;
  if (!data) return null;

  const hero = data.hero as AboutSection | undefined;
  const story = data.story as AboutSection | undefined;
  const philosophy = data.philosophy as AboutSection | undefined;
  const differentiators = Array.isArray(data.differentiators) ? data.differentiators : data.differentiators ? [data.differentiators] : [];
  const team = data.team as AboutSection | undefined;
  const whylove = Array.isArray(data.whylove) ? data.whylove : data.whylove ? [data.whylove] : [];
  const cta = data.cta as AboutSection | undefined;

  return (
    <>
      {/* 1. Hero */}
      {hero && <HeroSection data={hero} />}

      {/* 2. Our Story */}
      {story && <StorySection data={story} />}

      {/* 3. Our Philosophy */}
      {philosophy && <PhilosophySection data={philosophy} />}

      {/* 4. What Makes Us Different */}
      {differentiators.length > 0 && <DifferentiatorsSection data={differentiators} t={t} />}

      {/* 5. Meet the Team */}
      {team && <TeamSection data={team} />}

      {/* 6. Trust & Social Proof (reuse existing component) */}
      <Testimonials />

      {/* 7. Moments & Memories Gallery (reuse existing component) */}
      <GalleryGrid />

      {/* 8. Why People Love This */}
      {whylove.length > 0 && <WhyLoveSection data={whylove} t={t} />}

      {/* 9. Final CTA */}
      {cta && <CTASection data={cta} />}
    </>
  );
}
