import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';

export default function ExperienceDescription() {
  const { t } = useTranslation();
  const paragraphs = t('experience.description.paragraphs', { returnObjects: true }) as string[];

  return (
    <SectionWrapper>
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-dark mb-8">
          {t('experience.description.title')}
        </h2>
        <div className="space-y-6">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-neutral-gray font-body text-base leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
