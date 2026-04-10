import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '@/hooks/useBooking';
import ProgressBar from './ProgressBar';
import LocationSelector from './LocationSelector';
import CalendarPicker from './CalendarPicker';
import TimeSlotSelector from './TimeSlotSelector';
import GuestSelector from './GuestSelector';
import BookingSummary from './BookingSummary';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export default function BookingWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const bk = useBooking();

  // Determine slide direction
  const direction = 1; // always forward animation for simplicity

  // Resolve location name for calendar subtitle
  const locationName = useMemo(() => {
    if (bk.booking.locationId === 'bloom') return t('booking.location.bloomGallery.name');
    if (bk.booking.locationId === 'magnolia') return t('booking.location.casaMagnolia.name');
    return '';
  }, [bk.booking.locationId, t]);

  // Get time slots for selected date
  const timeSlots = useMemo(() => {
    if (!bk.booking.date) return [];
    const d = new Date(bk.booking.date + 'T00:00:00');
    return bk.getTimeSlots(d.getFullYear(), d.getMonth());
  }, [bk.booking.date, bk.getTimeSlots]);

  const handleProceedToPayment = () => {
    // Store booking in sessionStorage for PaymentPage
    sessionStorage.setItem(
      'booking',
      JSON.stringify({
        locationId: bk.booking.locationId,
        date: bk.booking.date,
        time: bk.booking.time,
        guests: bk.booking.guests,
        total: bk.total,
        pricePerPerson: bk.pricePerPerson,
      }),
    );
    navigate('/payment');
  };

  const renderStep = () => {
    switch (bk.step) {
      case 'location':
        return (
          <LocationSelector
            selected={bk.booking.locationId}
            onSelect={(id) => {
              bk.updateField('locationId', id);
              // Reset downstream selections when location changes
              bk.updateField('date', '');
              bk.updateField('time', '');
            }}
          />
        );
      case 'date':
        return (
          <CalendarPicker
            selectedDate={bk.booking.date}
            onSelect={(date) => {
              bk.updateField('date', date);
              bk.updateField('time', ''); // reset time when date changes
            }}
            getAvailability={bk.getAvailability}
            locationName={locationName}
          />
        );
      case 'time':
        return (
          <TimeSlotSelector
            selectedTime={bk.booking.time}
            onSelect={(time) => bk.updateField('time', time)}
            slots={timeSlots}
            date={bk.booking.date}
          />
        );
      case 'guests':
        return (
          <GuestSelector
            guests={bk.booking.guests}
            pricePerPerson={bk.pricePerPerson}
            onUpdate={(n) => bk.updateField('guests', n)}
          />
        );
      case 'summary':
        return (
          <BookingSummary
            locationId={bk.booking.locationId}
            date={bk.booking.date}
            time={bk.booking.time}
            guests={bk.booking.guests}
            pricePerPerson={bk.pricePerPerson}
            total={bk.total}
            onEdit={bk.goToStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[60vh]">
      <ProgressBar steps={bk.steps} currentIndex={bk.currentStepIndex} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={bk.step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="max-w-lg mx-auto mt-10 flex items-center justify-between gap-4">
        {bk.currentStepIndex > 0 ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={bk.back}
            className="px-6 py-3 rounded-xl font-semibold text-neutral-gray bg-neutral-cream hover:bg-neutral-sand/30 transition-colors"
          >
            {t('booking.back')}
          </motion.button>
        ) : (
          <div />
        )}

        {bk.step === 'summary' ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleProceedToPayment}
            className="px-8 py-3.5 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
          >
            {t('booking.payNow')}
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!bk.canProceed}
            onClick={bk.next}
            className="px-8 py-3.5 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('booking.next')}
          </motion.button>
        )}
      </div>
    </div>
  );
}
