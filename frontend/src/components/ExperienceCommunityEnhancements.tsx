import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiGift, FiMusic, FiGlobe, FiUsers, FiMessageCircle } from 'react-icons/fi';

export function CommunityIntroEnhancement() {
  const { t } = useTranslation();
  const highlights = t('experience.community_intro.highlights', { returnObjects: true }) as string[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-12 pt-12 border-t border-neutral-cream text-left"
    >
      <h3 className="font-display text-2xl font-bold text-neutral-dark mb-4">
        {t('experience.community_intro.title')}
      </h3>
      <p className="text-neutral-gray font-body leading-relaxed mb-8">
        {t('experience.community_intro.content')}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {highlights.map((highlight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 bg-neutral-cream/50 p-4 rounded-xl border border-neutral-cream"
          >
            <span className="text-xl">{highlight.split(' ')[0]}</span>
            <span className="font-heading font-medium text-neutral-dark text-sm">
              {highlight.split(' ').slice(1).join(' ')}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function MicroFlowBreakdown() {
  const { t } = useTranslation();
  const steps = t('experience.micro_flow.steps', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;

  return (
    <div className="mt-20">
      <h3 className="font-display text-2xl sm:text-3xl font-bold text-neutral-dark text-center mb-12">
        {t('experience.micro_flow.title')}
      </h3>
      <div className="max-w-4xl mx-auto relative px-4">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/10 hidden md:block" />
        
        <div className="space-y-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-6 relative"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0 z-10">
                {i + 1}
              </div>
              <div className="card flex-1 !p-5 !bg-white/80 backdrop-blur-sm">
                <h4 className="font-heading font-bold text-neutral-dark mb-1">{step.title}</h4>
                <p className="text-neutral-gray text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InlineLanguageCard() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="card !bg-primary text-white mt-12 p-8 flex flex-col md:flex-row items-center gap-6"
    >
      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
        <FiGlobe size={32} />
      </div>
      <div className="text-center md:text-left">
        <h4 className="font-display text-xl font-bold mb-1">{t('experience.inline_language.title')}</h4>
        <p className="text-white/80 font-body">{t('experience.inline_language.content')}</p>
      </div>
    </motion.div>
  );
}

export function ActivitiesInlineSegment() {
  const { t } = useTranslation();
  const items = t('experience.inline_activities.items', { returnObjects: true }) as Array<{
    title: string;
    icon: string;
  }>;

  const iconMap: Record<string, any> = {
    PartyPopper: FiGift,
    Globe2: FiGlobe,
    Music: FiMusic,
  };

  return (
    <div className="mt-12 py-8 border-y border-neutral-cream">
      <h4 className="font-heading font-bold text-neutral-dark mb-6 text-center">{t('experience.inline_activities.title')}</h4>
      <div className="flex flex-wrap justify-center gap-8">
        {items.map((item, i) => {
          const Icon = iconMap[item.icon] || FiGift;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 text-neutral-gray"
            >
              <Icon className="text-accent" size={20} />
              <span className="font-medium text-sm">{item.title}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function CommunityInlineTestimonial() {
  const { t } = useTranslation();
  const testimonials = t('experience.inline_testimonials', { returnObjects: true }) as Array<{
    text: string;
    author: string;
  }>;

  return (
    <div className="my-16 space-y-6">
      {testimonials.map((test, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, opacity: 1 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="font-script text-2xl text-primary/80 mb-2">"{test.text}"</p>
          <p className="font-heading font-semibold text-xs text-neutral-gray uppercase tracking-widest">— {test.author}</p>
        </motion.div>
      ))}
    </div>
  );
}
