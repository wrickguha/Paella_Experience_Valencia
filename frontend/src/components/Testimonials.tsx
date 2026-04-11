import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SectionWrapper from './SectionWrapper';
import { fetchTestimonials, type Testimonial } from '@/services/api';

export default function Testimonials() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTestimonials(i18n.language)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [i18n.language]);

  return (
    <SectionWrapper className="bg-neutral-cream">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('testimonials.title')}
        </h2>
        <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto">
          {t('testimonials.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="mx-auto max-w-3xl rounded-3xl border border-primary/10 bg-white/70 px-6 py-12 text-center shadow-sm">
          <p className="font-heading text-xl font-semibold text-neutral-dark">No Testimonials found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="card"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <span key={i} className="text-secondary text-lg">★</span>
                ))}
              </div>

              <p className="text-neutral-dark font-body text-sm leading-relaxed mb-6 italic">
                "{item.review}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary font-heading font-bold text-sm">
                      {item.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-neutral-dark">{item.name}</p>
                  <p className="text-xs text-neutral-gray">{item.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}

