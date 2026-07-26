import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';

const STRIP_IMAGES = [
  '/Carousel/03/Artboard 1.jpg',
  '/Carousel/03/Artboard 2.jpg',
  '/Carousel/03/Artboard 3.jpg',
  '/Carousel/03/Artboard 4.jpg',
  '/Carousel/03/Artboard 5.jpg',
];

export default function FinalCTA() {
  const { t } = useTranslation();

  return (
    <>
      {/* Photo strip above the CTA */}
      <div className="flex overflow-hidden h-40 sm:h-52">
        {STRIP_IMAGES.map((src, i) => (
          <div key={i} className="flex-1 overflow-hidden">
            <img
              src={src}
              alt={`Paella experience ${i + 1}`}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
            />
          </div>
        ))}
      </div>

      <SectionWrapper className="bg-primary">
        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t('finalCta.title')}
          </h2>
          <p className="text-lg text-white/80 font-body max-w-2xl mx-auto mb-10 whitespace-pre-line">
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
    </>
  );
}

