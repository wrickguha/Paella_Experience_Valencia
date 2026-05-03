import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';
import { motion } from 'framer-motion';
import { FiGift, FiMusic, FiGlobe, FiUsers } from 'react-icons/fi';

const iconMap: Record<number, any> = {
  0: FiGift,
  1: FiGlobe,
  2: FiMusic,
  3: FiUsers,
};

const PartyPopper = FiGift;


export default function ActivitiesSection() {
  const { t } = useTranslation();
  const items = t('activities.items', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <SectionWrapper className="bg-white">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('activities.title')}
        </h2>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {items.map((item, index) => {
          const Icon = iconMap[index] || PartyPopper;
          return (
            <motion.div
              key={index}
              variants={itemAnim}
              className="card text-center flex flex-col items-center group hover:border-accent/30 border-2 border-transparent"
            >
              <div className="w-16 h-16 bg-bg-main rounded-2xl flex items-center justify-center text-accent mb-6 transition-colors group-hover:bg-accent group-hover:text-white">
                <Icon size={32} />
              </div>
              <h3 className="font-heading font-semibold text-lg text-neutral-dark mb-3">
                {item.title}
              </h3>
              <p className="text-neutral-gray font-body text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
