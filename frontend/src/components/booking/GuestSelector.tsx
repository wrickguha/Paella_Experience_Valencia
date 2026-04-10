import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  guests: number;
  pricePerPerson: number;
  onUpdate: (guests: number) => void;
}

const MIN_GUESTS = 1;
const MAX_GUESTS = 12;

export default function GuestSelector({ guests, pricePerPerson, onUpdate }: Props) {
  const { t } = useTranslation();
  const total = pricePerPerson * guests;

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-neutral-dark mb-2">
          {t('booking.guests.title')}
        </h2>
        <p className="text-neutral-gray font-body">
          {t('booking.guests.subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-8">
        {/* Counter */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={guests <= MIN_GUESTS}
            onClick={() => onUpdate(guests - 1)}
            className="w-14 h-14 rounded-2xl bg-neutral-cream flex items-center justify-center text-neutral-dark text-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-sand/30 transition-colors"
          >
            −
          </motion.button>

          <AnimatePresence mode="wait">
            <motion.div
              key={guests}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-center"
            >
              <span className="text-5xl font-display text-neutral-dark">{guests}</span>
              <p className="text-neutral-gray text-sm mt-1">
                {t('booking.guests.label')}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={guests >= MAX_GUESTS}
            onClick={() => onUpdate(guests + 1)}
            className="w-14 h-14 rounded-2xl bg-neutral-cream flex items-center justify-center text-neutral-dark text-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-sand/30 transition-colors"
          >
            +
          </motion.button>
        </div>

        {/* Price breakdown */}
        <motion.div
          layout
          className="bg-primary/5 rounded-xl p-5 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-lg">
            <span className="text-neutral-gray">€{pricePerPerson}</span>
            <span className="text-neutral-gray">×</span>
            <span className="font-semibold text-neutral-dark">{guests}</span>
            <span className="text-neutral-gray">=</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={total}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="font-display text-2xl text-primary"
              >
                €{total}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="text-xs text-neutral-gray mt-2">
            €{pricePerPerson} {t('booking.guests.perPerson')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
