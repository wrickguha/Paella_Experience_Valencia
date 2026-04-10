import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';

export default function FinalCTA() {
  const { t } = useTranslation();

  return (
    <SectionWrapper className="bg-primary">
      <div className="text-center">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          {t('finalCta.title')}
        </h2>
        <p className="text-lg text-white/80 font-body max-w-2xl mx-auto mb-10">
          {t('finalCta.subtitle')}
        </p>
        <Link
          to="/booking"
          className="inline-block bg-white text-primary font-heading font-bold text-lg
                     px-12 py-5 rounded-xl shadow-elevated hover:shadow-card
                     hover:bg-neutral-cream transition-all active:scale-[0.98]"
        >
          {t('finalCta.cta')}
        </Link>
      </div>
    </SectionWrapper>
  );
}
