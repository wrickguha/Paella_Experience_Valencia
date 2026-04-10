import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SectionWrapper from './SectionWrapper';

const stepIcons = ['👋', '🏪', '🔥', '🍽'];

export default function ExperienceSteps() {
  const { t } = useTranslation();
  const items = t('experience.steps.items', { returnObjects: true }) as Array<{
    step: string;
    title: string;
    description: string;
    time: string;
  }>;

  return (
    <SectionWrapper className="bg-neutral-cream">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('experience.steps.title')}
        </h2>
        <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto">
          {t('experience.steps.subtitle')}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="flex gap-6 mb-12 last:mb-0"
          >
            {/* Timeline */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
                <span className="text-2xl">{stepIcons[index] || '✨'}</span>
              </div>
              {index < items.length - 1 && (
                <div className="w-0.5 h-full bg-primary/20 mt-2 min-h-[40px]" />
              )}
            </div>

            {/* Content */}
            <div className="card flex-1 !p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-heading font-semibold text-primary bg-primary/10
                                 px-3 py-1 rounded-full">
                  {item.time}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-lg text-neutral-dark mb-2">
                {item.title}
              </h3>
              <p className="text-neutral-gray font-body text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
