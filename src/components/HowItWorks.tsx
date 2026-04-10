import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionWrapper from './SectionWrapper';

const ICONS = [
  // Calendar icon
  <svg key="cal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>,
  // Ticket / form icon
  <svg key="ticket" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8">
    <path d="M20 12V22H4V12" />
    <path d="M22 7H2v5h20V7z" />
    <path d="M12 22V7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>,
  // Chef / utensils icon
  <svg key="chef" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8">
    <path d="M3 11l19-9-9 19-2-8-8-2z" />
  </svg>,
];

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = t('howItWorks.steps', { returnObjects: true }) as Array<{
    number: string;
    title: string;
    description: string;
  }>;

  const bgColors = ['bg-primary/10', 'bg-secondary/20', 'bg-primary/10'];
  const iconColors = ['text-primary', 'text-secondary-dark', 'text-primary'];
  const borderColors = ['border-primary/20', 'border-secondary/30', 'border-primary/20'];

  return (
    <SectionWrapper className="bg-neutral-cream">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-heading font-semibold uppercase tracking-wider mb-4">
          Simple Process
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('howItWorks.title')}
        </h2>
        <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto">
          {t('howItWorks.subtitle')}
        </p>
      </div>

      {/* Steps */}
      <div className="relative max-w-4xl mx-auto">
        {/* Connector line — desktop only */}
        <div
          className="hidden md:block absolute top-[52px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px bg-gradient-to-r from-primary/30 via-secondary/40 to-primary/30"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
              className="flex flex-col items-center text-center"
            >
              {/* Number badge + icon */}
              <div className="relative mb-6">
                {/* Outer ring */}
                <div
                  className={`w-24 h-24 rounded-full border-2 ${borderColors[index]} ${bgColors[index]} flex items-center justify-center`}
                >
                  <span className={`${iconColors[index]}`}>{ICONS[index]}</span>
                </div>
                {/* Step number pill */}
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white text-xs font-heading font-bold flex items-center justify-center shadow-md">
                  {step.number}
                </span>
              </div>

              {/* Text */}
              <h3 className="font-heading font-bold text-xl text-neutral-dark mb-3">
                {step.title}
              </h3>
              <p className="text-neutral-gray font-body text-sm leading-relaxed max-w-[240px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.5 }}
        >
          <Link to="/booking" className="btn-primary inline-flex items-center gap-2">
            {t('howItWorks.cta')}
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
