import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiAward, FiArrowRight } from 'react-icons/fi';
import SectionWrapper from './SectionWrapper';

export default function LevelTestCTA() {
  const { i18n } = useTranslation();
  const isEs = i18n.language.startsWith('es');

  const badgeText = isEs ? 'Evaluación de Nivel' : 'Level Assessment';
  const titleText = isEs ? '¿Quieres saber cuál es tu nivel?' : 'Want to find out your current level?';
  const descText = isEs
    ? 'Realiza nuestro test rápido de nivel para inglés o español. Te ayudará a descubrir la experiencia de inmersión más adecuada para ti.'
    : 'Take our quick level assessment for English or Spanish. It helps us recommend the most comfortable and rewarding experience for you.';
  const buttonText = isEs ? 'Ir al Test de Nivel' : 'Go to Level Test';

  return (
    <SectionWrapper className="bg-neutral-cream/50 relative overflow-hidden py-16 sm:py-20 border-y border-neutral-cream">
      {/* Subtle background decorative blurs */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -z-10" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6 px-4">
        {/* Animated Badge Icon */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 text-primary font-modern font-semibold text-xs tracking-wider uppercase"
        >
          <FiAward className="w-4 h-4 text-primary" />
          <span>{badgeText}</span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-neutral-dark"
        >
          {titleText}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-neutral-gray font-body text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
        >
          {descText}
        </motion.p>

        {/* Premium CTA Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-2"
        >
          <Link
            to="/language-tests"
            className="inline-flex items-center gap-2.5 bg-primary hover:bg-primary-hover text-white font-heading font-bold px-8 py-3.5 rounded-full shadow-[0_8px_20px_-6px_rgba(232,111,44,0.4)] transition-all hover:scale-105 active:scale-98 group"
          >
            <span>{buttonText}</span>
            <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
