import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { LocationId } from '@/services/mockData';
import type { WizardStep } from '@/hooks/useBooking';

interface Props {
  locationId: LocationId | null;
  date: string;
  time: string;
  guests: number;
  pricePerPerson: number;
  total: number;
  onEdit: (step: WizardStep) => void;
}

const locationKeyMap: Record<LocationId, string> = {
  bloom: 'bloomGallery',
  magnolia: 'casaMagnolia',
};

export default function BookingSummary({
  locationId,
  date,
  time,
  guests,
  pricePerPerson,
  total,
  onEdit,
}: Props) {
  const { t } = useTranslation();

  const formattedDate = useMemo(() => {
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [date]);

  const locationName = locationId ? t(`booking.location.${locationKeyMap[locationId]}.name`) : '';
  const locationArea = locationId ? t(`booking.location.${locationKeyMap[locationId]}.area`) : '';

  const rows = [
    { label: t('booking.summary.location'), value: `${locationName} — ${locationArea}`, step: 'location' as WizardStep },
    { label: t('booking.summary.date'), value: formattedDate, step: 'date' as WizardStep },
    { label: t('booking.summary.time'), value: time, step: 'time' as WizardStep },
    { label: t('booking.summary.guestCount'), value: `${guests} ${t('booking.guests.label')}`, step: 'guests' as WizardStep },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-neutral-dark mb-2">
          {t('booking.summary.title')}
        </h2>
        <p className="text-neutral-gray font-body">
          {t('booking.summary.subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {/* Detail rows */}
        <div className="divide-y divide-neutral-sand/40">
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between p-5"
            >
              <div>
                <p className="text-xs text-neutral-gray uppercase tracking-wider mb-0.5">{row.label}</p>
                <p className="text-neutral-dark font-medium">{row.value}</p>
              </div>
              <button
                onClick={() => onEdit(row.step)}
                className="text-primary text-sm font-semibold hover:underline"
              >
                {t('booking.summary.edit')}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Price */}
        <div className="bg-neutral-cream/50 p-5 space-y-3">
          <div className="flex justify-between text-sm text-neutral-gray">
            <span>{t('booking.summary.pricePerPerson')}</span>
            <span>€{pricePerPerson}</span>
          </div>
          <div className="flex justify-between text-sm text-neutral-gray">
            <span>{t('booking.summary.subtotal')} ({guests} × €{pricePerPerson})</span>
            <span>€{total}</span>
          </div>
          <div className="border-t border-neutral-sand/40 pt-3 flex justify-between items-center">
            <span className="font-display text-lg text-neutral-dark">{t('booking.summary.total')}</span>
            <span className="font-display text-2xl text-primary">€{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
