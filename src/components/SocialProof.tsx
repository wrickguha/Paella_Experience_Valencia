import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';

export default function SocialProof() {
  const { t } = useTranslation();

  const stats = [
    { value: '4.9★', label: t('socialProof.rating') },
    { value: '2,400+', label: t('socialProof.reviewCount') },
    { value: '5,000+', label: 'Happy Guests' },
  ];

  return (
    <SectionWrapper className="!py-12 bg-neutral-cream">
      <div className="text-center mb-8">
        <p className="text-sm font-heading font-semibold text-primary uppercase tracking-wider">
          {t('socialProof.platforms')}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-bold text-neutral-dark">
              {stat.value}
            </p>
            <p className="text-sm text-neutral-gray font-body mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
