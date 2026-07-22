import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScrollToTop } from '@/hooks/useScrollReveal';
import SectionWrapper from '@/components/SectionWrapper';
import Testimonials from '@/components/Testimonials';
import GalleryGrid from '@/components/GalleryGrid';
import { FiUsers, FiGlobe, FiMessageCircle, FiHeart, FiStar, FiZap } from 'react-icons/fi';
import { fetchAbout, fetchSettings, type AboutSection, type AboutData } from '@/services/api';
import { useSectionStyle } from '@/context/SettingsContext';

const iconMap: Record<string, any> = {
  users: FiUsers,
  heart: FiHeart,
  globe: FiGlobe,
  message: FiMessageCircle,
  star: FiStar,
  zap: FiZap,
};

/* ── Hero Section ────────────────────────────────────────────────── */
function AboutHero({ settings, langSuffix }: { settings: Record<string, string>; langSuffix: string }) {
  const { t } = useTranslation();
  const [videoUrl, setVideoUrl] = useState(() => {
    return localStorage.getItem("hero_video") || "/video/hero-video.mp4";
  });

  useEffect(() => {
    fetchSettings('general')
      .then((settings) => {
        const path = settings.hero_video;
        const fullUrl = path
          ? (path.startsWith('http') || path.startsWith('/') || path.startsWith('video/')
              ? path
              : `/storage/${path}`)
          : '/video/hero-video.mp4';

        setVideoUrl((prevUrl) => {
          if (fullUrl !== prevUrl) {
            return fullUrl;
          }
          return prevUrl;
        });

        if (path) {
          localStorage.setItem('hero_video', fullUrl);
        } else {
          localStorage.removeItem('hero_video');
        }
      })
      .catch(() => {});
  }, []);

  const heroStyle = useSectionStyle('hero', 'about');

  return (
    <section className="relative min-h-[70vh] flex items-center" style={heroStyle}>
      <div className="absolute inset-0 overflow-hidden">
        <video
          key={videoUrl}
          src={videoUrl}
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
            {settings[`about_hero_title_${langSuffix}`] || t('about.hero.title')}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 font-body mb-10 max-w-2xl mx-auto">
            {settings[`about_hero_subtitle_${langSuffix}`] || t('about.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking" className="btn-primary !text-lg !px-10 !py-5">
              {settings[`about_hero_cta_${langSuffix}`] || t('about.cta.primary')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Our Story Section ───────────────────────────────────────────── */
function OurStory({ 
  data, 
  settings, 
  langSuffix 
}: { 
  data?: AboutSection; 
  settings: Record<string, string>; 
  langSuffix: string; 
}) {
  const { t } = useTranslation();
  const title = settings[`about_story_title_${langSuffix}`] || data?.title || t('about.story.title');
  const subtitle = settings[`about_story_subtitle_${langSuffix}`] || data?.subtitle || t('about.story.subtitle');
  const content = settings[`about_story_content_${langSuffix}`] || data?.content || t('about.story.content');
  const image = settings.about_story_image
    ? (settings.about_story_image.startsWith('blob:') || settings.about_story_image.startsWith('http') || settings.about_story_image.startsWith('/')
      ? settings.about_story_image
      : `/storage/${settings.about_story_image}`)
    : (data?.image || "/storage/assets/images/casa-magnolia/Chef Gene.jpg");

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

  const storyStyle = useSectionStyle('story', 'about');

  return (
    <SectionWrapper style={storyStyle}>
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
            {subtitle}
          </motion.span>
          <motion.h2 
            variants={itemVariants}
            className="font-display text-4xl sm:text-5xl font-bold text-neutral-dark mb-6 leading-tight"
          >
            {title}
          </motion.h2>
          <motion.div 
            variants={itemVariants}
            className="text-neutral-gray font-body text-lg leading-relaxed whitespace-pre-line space-y-4"
          >
            {content}
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
              src={image}
              alt={title}
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
function CommunityVision({ settings, langSuffix }: { settings: Record<string, string>; langSuffix: string }) {
  const { t } = useTranslation();
  const subtitle = settings[`about_vision_subtitle_${langSuffix}`] || t('about.vision.subtitle');
  const title = settings[`about_vision_title_${langSuffix}`] || t('about.vision.title');
  const content = settings[`about_vision_content_${langSuffix}`] || t('about.vision.content');

  const fallbackHighlights = t('about.vision.highlights', { returnObjects: true }) as any[];
  const fallbackIcons = ['users', 'heart', 'globe'];
  const highlights = [1, 2, 3].map((num, idx) => {
    const fallback = fallbackHighlights[idx] || { title: '', description: '' };
    return {
      icon: settings[`about_vision_highlight${num}_icon`] || fallbackIcons[idx % fallbackIcons.length],
      title: settings[`about_vision_highlight${num}_title_${langSuffix}`] || fallback.title,
      description: settings[`about_vision_highlight${num}_desc_${langSuffix}`] || fallback.description,
    };
  });

  const visionStyle = useSectionStyle('vision', 'about');

  return (
    <SectionWrapper className="bg-neutral-cream" style={visionStyle}>
      <div className="text-center mb-16">
        <span className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-4 block">
          {subtitle}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-6">
          {title}
        </h2>
        <p className="text-neutral-gray font-body text-lg max-w-2xl mx-auto">
          {content}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {highlights.map((item, idx) => {
          const IconComponent = iconMap[item.icon];
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
                {IconComponent ? <IconComponent size={32} /> : <span className="text-3xl">{item.icon}</span>}
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
function LanguageAndCulture({ settings, langSuffix }: { settings: Record<string, string>; langSuffix: string }) {
  const { t } = useTranslation();
  const subtitle = settings[`about_language_subtitle_${langSuffix}`] || t('about.language.subtitle');
  const title = settings[`about_language_title_${langSuffix}`] || t('about.language.title');
  const content = settings[`about_language_content_${langSuffix}`] || t('about.language.content');
  const image = settings.about_language_image
    ? (settings.about_language_image.startsWith('blob:') || settings.about_language_image.startsWith('http') || settings.about_language_image.startsWith('/')
      ? settings.about_language_image
      : `/storage/${settings.about_language_image}`)
    : "/storage/assets/images/speakeasy/GPTempDownload(2).jpg";

  const fallbackPoints = t('about.language.points', { returnObjects: true }) as any[];
  const fallbackIcons = ['message', 'zap', 'globe'];
  const points = [1, 2, 3].map((num, idx) => {
    const fallback = fallbackPoints[idx] || { title: '', description: '' };
    return {
      icon: settings[`about_language_point${num}_icon`] || fallbackIcons[idx % fallbackIcons.length],
      title: settings[`about_language_point${num}_title_${langSuffix}`] || fallback.title,
      description: settings[`about_language_point${num}_desc_${langSuffix}`] || fallback.description,
    };
  });

  const languageStyle = useSectionStyle('language', 'about');

  return (
    <SectionWrapper style={languageStyle}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:order-2 overflow-hidden rounded-2xl shadow-elevated"
        >
          <img
            src={image}
            alt={title}
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
            {subtitle}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-6">
            {title}
          </h2>
          <p className="text-neutral-gray font-body text-lg leading-relaxed mb-10">
            {content}
          </p>

          <div className="space-y-6">
            {points.map((point, idx) => {
              const IconComponent = iconMap[point.icon];
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
                    {IconComponent ? <IconComponent size={20} /> : <span className="text-xl">{point.icon}</span>}
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
function Differentiators({ settings, langSuffix }: { settings: Record<string, string>; langSuffix: string }) {
  const { t } = useTranslation();
  const subtitle = settings[`about_different_subtitle_${langSuffix}`] || t('about.different.subtitle');
  const title = settings[`about_different_title_${langSuffix}`] || t('about.different.title');

  const fallbackItems = t('about.different.items', { returnObjects: true }) as any[];
  const fallbackIcons = ['users', 'star', 'heart'];
  const items = [1, 2, 3].map((num, idx) => {
    const fallback = fallbackItems[idx] || { title: '', description: '' };
    return {
      icon: settings[`about_different_item${num}_icon`] || fallbackIcons[idx % fallbackIcons.length],
      title: settings[`about_different_item${num}_title_${langSuffix}`] || fallback.title,
      description: settings[`about_different_item${num}_desc_${langSuffix}`] || fallback.description,
    };
  });

  const diffStyle = useSectionStyle('different', 'about');

  return (
    <SectionWrapper className="bg-neutral-cream/50" style={diffStyle}>
      <div className="text-center mb-16">
        <span className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-4 block">
          {subtitle}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-6">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item, idx) => {
          const IconComponent = iconMap[item.icon];
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
                {IconComponent ? <IconComponent size={24} /> : <span className="text-2xl">{item.icon}</span>}
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


/* ── Final CTA Section ───────────────────────────────────────────── */
function FinalAboutCTA({ settings, langSuffix }: { settings: Record<string, string>; langSuffix: string }) {
  const { t } = useTranslation();
  const title = settings[`about_cta_title_${langSuffix}`] || t('about.cta.title');
  const description = settings[`about_cta_desc_${langSuffix}`] || t('about.cta.description');
  const primaryText = settings[`about_cta_primary_${langSuffix}`] || t('about.cta.primary');
  const secondaryText = settings[`about_cta_secondary_${langSuffix}`] || t('about.cta.secondary');

  const ctaStyle = useSectionStyle('cta', 'about');

  return (
    <section className="py-24 bg-neutral-cream" style={ctaStyle}>
      <div className="container-max px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2.5rem] bg-primary text-white text-center py-20 px-6 sm:px-12 shadow-2xl"
        >
          {/* Decorative background effects */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/storage/assets/images/textures/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {title}
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-body mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/booking" className="btn-secondary !bg-white !text-primary !border-white !px-10 !py-5 !text-lg shadow-xl hover:scale-105 transition-transform">
                {primaryText}
              </Link>
              <Link to="/contact" className="btn-outline !text-white !border-white/40 !px-10 !py-5 !text-lg hover:!bg-white/10 hover:!border-white transition-all">
                {secondaryText}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Main About Page ─────────────────────────────────────────────── */
export default function AboutPage() {
  useScrollToTop();
  const { i18n } = useTranslation();
  const [aboutData, setAboutData] = useState<AboutData>({});
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAbout(i18n.language)
      .then(setAboutData)
      .catch(() => {});

    fetchSettings('general')
      .then(setSettings)
      .catch(() => {});
  }, [i18n.language]);

  const langSuffix = i18n.language.startsWith('es') ? 'es' : 'en';

  return (
    <div className="bg-white">
      <OurStory data={aboutData.story} settings={settings} langSuffix={langSuffix} />
      <CommunityVision settings={settings} langSuffix={langSuffix} />
      <LanguageAndCulture settings={settings} langSuffix={langSuffix} />
      <Differentiators settings={settings} langSuffix={langSuffix} />
      <Testimonials />
      <GalleryGrid />
      <FinalAboutCTA settings={settings} langSuffix={langSuffix} />
    </div>
  );
}
