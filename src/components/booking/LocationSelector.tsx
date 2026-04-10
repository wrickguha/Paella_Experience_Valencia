import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { locations } from '@/services/mockData';
import type { LocationId } from '@/services/mockData';

interface Props {
  selected: LocationId | null;
  onSelect: (id: LocationId) => void;
}

const locationKeyMap: Record<LocationId, string> = {
  bloom: 'bloomGallery',
  magnolia: 'casaMagnolia',
};

export default function LocationSelector({ selected, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-neutral-dark mb-2">
          {t('booking.location.title')}
        </h2>
        <p className="text-neutral-gray font-body">
          {t('booking.location.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {locations.map((loc) => {
          const key = locationKeyMap[loc.id];
          const isSelected = selected === loc.id;

          return (
            <motion.button
              key={loc.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(loc.id)}
              className={`group relative overflow-hidden rounded-2xl text-left transition-all duration-300 ${
                isSelected
                  ? 'ring-3 ring-primary shadow-elevated'
                  : 'ring-1 ring-neutral-sand/60 shadow-card hover:shadow-elevated'
              }`}
            >
              {/* Image */}
              <div className="h-48 overflow-hidden">
                <img
                  src={loc.image}
                  alt={t(`booking.location.${key}.name`)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-display text-xl text-neutral-dark mb-1">
                  {t(`booking.location.${key}.name`)}
                </h3>
                <p className="text-sm text-primary font-semibold mb-2">
                  {t(`booking.location.${key}.availability`)} · {t(`booking.location.${key}.time`)}
                </p>
                <p className="text-neutral-gray text-sm leading-relaxed mb-3">
                  {t(`booking.location.${key}.description`)}
                </p>
                <div className="flex items-center text-xs text-neutral-gray">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t(`booking.location.${key}.area`)}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
