import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import SectionWrapper from './SectionWrapper';
import { fetchFaqs, type FaqItem } from '@/services/api';

export default function FAQSection() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setOpenIndex(null);
    fetchFaqs(i18n.language)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [i18n.language]);

  return (
    <SectionWrapper>
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('faq.title')}
        </h2>
        <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto">
          {t('faq.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="mx-auto max-w-3xl rounded-3xl border border-primary/10 bg-white/70 px-6 py-12 text-center shadow-sm">
          <p className="font-heading text-xl font-semibold text-neutral-dark">No FAQs found</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="border border-neutral-sand rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-cream transition-colors"
              >
                <span className="font-heading font-semibold text-neutral-dark pr-4">
                  {item.question}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-primary text-xl flex-shrink-0"
                >
                  ↓
                </motion.span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-neutral-gray font-body text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
