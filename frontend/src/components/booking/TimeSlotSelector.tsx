import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { TimeSlot } from '@/services/mockData';

interface Props {
  selectedTime: string;
  onSelect: (time: string) => void;
  slots: TimeSlot[];
  date: string;
}

export default function TimeSlotSelector({ selectedTime, onSelect, slots, date }: Props) {
  const { t } = useTranslation();

  const formattedDate = useMemo(() => {
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  }, [date]);

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-neutral-dark mb-2">
          {t('booking.timeSlot.title')}
        </h2>
        <p className="text-neutral-gray font-body">
          {t('booking.timeSlot.subtitle', { date: formattedDate })}
        </p>
      </div>

      {slots.length === 0 ? (
        <div className="text-center py-12 text-neutral-gray">
          <svg className="w-12 h-12 mx-auto mb-3 text-neutral-sand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('booking.timeSlot.noSlots')}
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => {
            const isSelected = selectedTime === slot.time;
            return (
              <motion.button
                key={slot.time}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(slot.time)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary text-white shadow-elevated'
                    : 'bg-white ring-1 ring-neutral-sand/60 shadow-card hover:shadow-elevated'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white/20' : 'bg-primary/10'
                  }`}>
                    <svg className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold">{slot.time}</span>
                </div>

                <div className="text-right">
                  <span className={`text-sm ${isSelected ? 'text-white/80' : 'text-neutral-gray'}`}>
                    {t('booking.calendar.spotsLeft', { count: slot.spotsLeft })}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
