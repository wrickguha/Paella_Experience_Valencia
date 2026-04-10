import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SectionWrapper from './SectionWrapper';

export default function ExperienceOverview() {
  const { t } = useTranslation();

  const infoItems = [
    { key: 'duration', icon: '⏱' },
    { key: 'location', icon: '📍' },
    { key: 'groupSize', icon: '👥' },
    { key: 'language', icon: '🌍' },
    { key: 'price', icon: '💰' },
  ];

  return (
    <SectionWrapper>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {infoItems.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="card text-center !p-5"
          >
            <span className="text-2xl mb-2 block">{item.icon}</span>
            <p className="text-xs text-neutral-gray font-body uppercase tracking-wider mb-1">
              {t(`experience.keyInfo.${item.key}`)}
            </p>
            <p className="font-heading font-semibold text-sm text-neutral-dark">
              {t(`experience.keyInfo.${item.key}Value`)}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
