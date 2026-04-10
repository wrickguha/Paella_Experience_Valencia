import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import SectionWrapper from './SectionWrapper';

export default function FAQSection() {
  const { t } = useTranslation();
  const items = t('faq.items', { returnObjects: true }) as Array<{
    question: string;
    answer: string;
  }>;

  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="border border-neutral-sand rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left
                         hover:bg-neutral-cream transition-colors"
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
    </SectionWrapper>
  );
}
