import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionWrapper from './SectionWrapper';

export default function PricingCards() {
  const { t } = useTranslation();
  const packages = t('pricing.packages', { returnObjects: true }) as Array<{
    name: string;
    price: string;
    duration: string;
    description: string;
    features: string[];
    popular?: boolean;
  }>;

  return (
    <SectionWrapper>
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('pricing.title')}
        </h2>
        <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto">
          {t('pricing.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {packages.map((pkg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className={`relative card flex flex-col ${
              pkg.popular
                ? 'border-2 border-primary ring-4 ring-primary/10 scale-[1.02]'
                : 'border border-neutral-sand'
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white
                               text-xs font-heading font-semibold px-4 py-1.5 rounded-full">
                {t('pricing.mostPopular')}
              </span>
            )}

            <div className="text-center mb-6">
              <h3 className="font-heading font-semibold text-xl text-neutral-dark mb-2">
                {pkg.name}
              </h3>
              <p className="text-sm text-neutral-gray">{pkg.description}</p>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-display font-bold text-neutral-dark">€{pkg.price}</span>
                <span className="text-sm text-neutral-gray">/ {t('pricing.perPerson')}</span>
              </div>
              <p className="text-xs text-neutral-gray mt-1">{pkg.duration}</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {pkg.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-neutral-dark">
                  <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              to="/booking"
              className={`w-full text-center py-3.5 rounded-xl font-heading font-semibold transition-all
                          ${
                            pkg.popular
                              ? 'btn-primary'
                              : 'btn-secondary'
                          }`}
            >
              {t('pricing.bookNow')}
            </Link>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
