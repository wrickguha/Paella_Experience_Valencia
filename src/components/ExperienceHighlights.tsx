import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';
import { motion } from 'framer-motion';

const iconMap: Record<string, string> = {
  chef: '👨‍🍳',
  market: '🏪',
  fire: '🔥',
  wine: '🍷',
  group: '👥',
  camera: '📸',
};

export default function ExperienceHighlights() {
  const { t } = useTranslation();
  const items = t('highlights.items', { returnObjects: true }) as Array<{
    icon: string;
    title: string;
    description: string;
  }>;

  return (
    <SectionWrapper>
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('highlights.title')}
        </h2>
        <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto">
          {t('highlights.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="card text-center hover:shadow-elevated transition-shadow duration-300"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">{iconMap[item.icon] || '✨'}</span>
            </div>
            <h3 className="font-heading font-semibold text-lg text-neutral-dark mb-3">
              {item.title}
            </h3>
            <p className="text-neutral-gray font-body text-sm leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
