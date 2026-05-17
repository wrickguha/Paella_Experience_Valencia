import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScrollToTop } from '@/hooks/useScrollReveal';
import SectionWrapper from '@/components/SectionWrapper';
import Testimonials from '@/components/Testimonials';
import GalleryGrid from '@/components/GalleryGrid';
import { FiUsers, FiGlobe, FiMessageCircle, FiHeart, FiStar, FiZap } from 'react-icons/fi';

/* ── Hero Section ────────────────────────────────────────────────── */
function AboutHero() {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-[70vh] flex items-center">
      <div className="absolute inset-0 overflow-hidden">
        <video
          src="/video/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      </div>
      <div className="container-max relative z-10 px-8 sm:px-12 lg:px-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t('about.hero.title')}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 font-body mb-10 max-w-2xl mx-auto">
            {t('about.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking" className="btn-primary !text-lg !px-10 !py-5">
              {t('about.cta.primary')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Our Story Section ───────────────────────────────────────────── */
function OurStory() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <SectionWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.span 
            variants={itemVariants}
            className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-4 block"
          >
            {t('about.story.subtitle')}
          </motion.span>
          <motion.h2 
            variants={itemVariants}
            className="font-display text-4xl sm:text-5xl font-bold text-neutral-dark mb-6 leading-tight"
          >
            {t('about.story.title')}
          </motion.h2>
          <motion.div 
            variants={itemVariants}
            className="text-neutral-gray font-body text-lg leading-relaxed whitespace-pre-line space-y-4"
          >
            {t('about.story.content')}
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, rotate: -2, scale: 0.95 }}
          whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
          whileHover={{ scale: 1.02, rotate: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative z-10"
        >
          <div className="overflow-hidden rounded-[2.5rem] shadow-2xl relative z-10 border-4 border-white">
            <motion.img
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              src="/storage/assets/images/casa-magnolia/Chef Gene.jpg"
              alt="Gene — Our Story"
              className="w-full aspect-[4/3] object-cover object-top"
            />
          </div>
          {/* Decorative Background Elements */}
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary/30 rounded-full blur-2xl -z-10" 
          />
          <motion.div 
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -top-8 -left-8 w-32 h-32 bg-accent/20 rounded-full blur-2xl -z-10" 
          />
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

/* ── Community Vision Section ─────────────────────────────────────── */
function CommunityVision() {
  const { t } = useTranslation();
  const highlights = t('about.vision.highlights', { returnObjects: true }) as any[];
  const icons = [FiUsers, FiHeart, FiGlobe];

  return (
    <SectionWrapper className="bg-neutral-cream">
      <div className="text-center mb-16">
        <span className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-4 block">
          {t('about.vision.subtitle')}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-6">
          {t('about.vision.title')}
        </h2>
        <p className="text-neutral-gray font-body text-lg max-w-2xl mx-auto">
          {t('about.vision.content')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {highlights.map((item, idx) => {
          const Icon = icons[idx % icons.length];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="card text-center !p-8 group hover:shadow-elevated transition-all"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Icon size={32} />
              </div>
              <h3 className="font-display text-xl font-bold text-neutral-dark mb-3">
                {item.title}
              </h3>
              <p className="text-neutral-gray text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

/* ── Language & Culture Section ──────────────────────────────────── */
function LanguageAndCulture() {
  const { t } = useTranslation();
  const points = t('about.language.points', { returnObjects: true }) as any[];
  const icons = [FiMessageCircle, FiZap, FiGlobe];

  return (
    <SectionWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:order-2 overflow-hidden rounded-2xl shadow-elevated"
        >
          <img
            src="/storage/assets/images/speakeasy/GPTempDownload(2).jpg"
            alt="Language & Culture — SpeakEasy Valencia"
            className="w-full aspect-[4/3] object-cover object-center"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:order-1"
        >
          <span className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-4 block">
            {t('about.language.subtitle')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-6">
            {t('about.language.title')}
          </h2>
          <p className="text-neutral-gray font-body text-lg leading-relaxed mb-10">
            {t('about.language.content')}
          </p>

          <div className="space-y-6">
            {points.map((point, idx) => {
              const Icon = icons[idx % icons.length];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-1 w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-neutral-dark">{point.title}</h4>
                    <p className="text-neutral-gray text-sm">{point.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

/* ── What Makes Us Different ─────────────────────────────────────── */
function Differentiators() {
  const { t } = useTranslation();
  const items = t('about.different.items', { returnObjects: true }) as any[];
  const icons = [FiUsers, FiStar, FiHeart];

  return (
    <SectionWrapper className="bg-neutral-cream/50">
      <div className="text-center mb-16">
        <span className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-4 block">
          {t('about.different.subtitle')}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-6">
          {t('about.different.title')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item, idx) => {
          const Icon = icons[idx % icons.length];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 rounded-2xl bg-white border border-neutral-sand/20 hover:shadow-card transition-all"
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-neutral-dark mb-3">
                {item.title}
              </h3>
              <p className="text-neutral-gray text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

/* ── Meet the Host Section ───────────────────────────────────────── */
function MeetTheHost() {
  const { t } = useTranslation();
  return (
    <SectionWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-4 block">
            {t('about.host.subtitle')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-8">
            {t('about.host.title')}
          </h2>
          <p className="text-neutral-gray font-body text-lg leading-relaxed">
            {t('about.host.content')}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative order-first lg:order-last"
        >
          <div className="overflow-hidden rounded-2xl shadow-elevated">
            <img
              src="/storage/assets/images/casa-magnolia/Chef Gene.jpg"
              alt="Chef Gene — Your Host"
              className="w-full aspect-[4/3] object-cover object-top"
            />
          </div>
          <div className="absolute -top-4 -right-4 w-20 h-20 border-4 border-accent/20 rounded-2xl -z-10" />
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

/* ── Final CTA Section ───────────────────────────────────────────── */
function FinalAboutCTA() {
  const { t } = useTranslation();
  return (
    <section className="bg-primary py-24">
      <div className="container-max px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8">
            {t('about.cta.title')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking" className="btn-secondary !bg-white !text-primary !border-white !px-10 !py-5 !text-lg">
              {t('about.cta.primary')}
            </Link>
            <Link to="/contact" className="btn-outline !text-white !border-white/30 !px-10 !py-5 !text-lg hover:!bg-white/10">
              {t('about.cta.secondary')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Main About Page ─────────────────────────────────────────────── */
export default function AboutPage() {
  useScrollToTop();

  return (
    <div className="bg-white">
      <AboutHero />
      <OurStory />
      <CommunityVision />
      <LanguageAndCulture />
      <Differentiators />
      <MeetTheHost />
      <Testimonials />
      <GalleryGrid />
      <FinalAboutCTA />
    </div>
  );
}
