import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';
import { motion } from 'framer-motion';

export default function ExperienceFlowSection() {
  const { t } = useTranslation();
  const steps = t('flow.steps', { returnObjects: true }) as Array<{
    id: number;
    title: string;
    description: string;
  }>;

  return (
    <SectionWrapper className="bg-primary text-white">
      <div className="text-center mb-20">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          {t('flow.title')}
        </h2>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Connection Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/10 -translate-x-1/2 hidden md:block" />
        
        <div className="space-y-12 md:space-y-24 relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`flex flex-col md:flex-row items-center gap-8 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Content */}
              <div className={`flex-1 text-center ${
                index % 2 === 0 ? 'md:text-right' : 'md:text-left'
              }`}>
                <h3 className="font-heading font-bold text-2xl mb-3 text-accent">
                  {step.title}
                </h3>
                <p className="text-white/70 font-body text-lg leading-relaxed whitespace-pre-line">
                  {step.description}
                </p>
              </div>

              {/* Step Circle */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-accent text-primary font-heading font-bold text-2xl flex items-center justify-center shadow-elevated border-4 border-primary">
                {step.id}
              </div>

              {/* Spacer for alignment */}
              <div className="flex-1 hidden md:block" />
            </motion.div>
          ))}
        </div>

        {/* Animated Line Overlay */}
        <motion.div 
          className="absolute left-1/2 top-0 w-1 bg-accent -translate-x-1/2 hidden md:block origin-top"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ height: '100%' }}
        />
      </div>
    </SectionWrapper>
  );
}
