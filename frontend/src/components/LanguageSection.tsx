import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';
import { motion } from 'framer-motion';
import { FiMessageCircle, FiUsers, FiGlobe } from 'react-icons/fi';

const iconMap = [FiMessageCircle, FiUsers, FiGlobe];


export default function LanguageSection() {
  const { t } = useTranslation();
  const points = t('language.points', { returnObjects: true }) as string[];

  return (
    <SectionWrapper className="bg-neutral-cream overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:w-1/2"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-6">
            {t('language.title')}
          </h2>
          <p className="text-xl text-neutral-gray font-body mb-10 leading-relaxed">
            {t('language.subtitle')}
          </p>

          <div className="space-y-6">
            {points.map((point, index) => {
              const Icon = iconMap[index % iconMap.length];
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Icon size={24} />
                  </div>
                  <span className="font-heading font-medium text-lg text-neutral-dark">{point}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:w-1/2 relative"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-elevated aspect-[4/3]">
            <img 
              src="/Speakeasy EXPERIENCE 4.19.2026/GPTempDownload(2).jpg" 
              alt="SpeakEasy Valencia experience" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
