import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SectionWrapper from './SectionWrapper';

export default function BookingWidget() {
  const { t } = useTranslation();

  return (
    <SectionWrapper>
      <div className="max-w-md mx-auto card border-2 border-primary/20">
        <div className="text-center mb-6">
          <p className="text-sm text-neutral-gray font-body">
            {t('experience.keyInfo.price')}
          </p>
          <p className="text-4xl font-display font-bold text-neutral-dark">
            €79
            <span className="text-base font-normal text-neutral-gray">
              {' '}/ {t('pricing.perPerson')}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1 justify-center mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-secondary">★</span>
          ))}
          <span className="text-sm text-neutral-gray ml-2">4.9 (2,400+)</span>
        </div>

        <Link
          to="/booking"
          className="btn-primary w-full block text-center !text-lg"
        >
          {t('nav.bookNow')}
        </Link>

        <p className="text-center text-xs text-neutral-gray mt-4">
          Free cancellation up to 48h before
        </p>
      </div>
    </SectionWrapper>
  );
}
