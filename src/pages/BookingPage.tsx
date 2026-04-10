import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollToTop } from '@/hooks/useScrollReveal';
import type { CalendarEvent, LocationId } from '@/services/api';
import AvailabilityCalendar from '@/components/booking/AvailabilityCalendar';
import EventDetailModal from '@/components/booking/EventDetailModal';
import GuestSelector from '@/components/booking/GuestSelector';
import CustomerInfoModal from '@/components/booking/CustomerInfoModal';
import type { CustomerInfo } from '@/components/booking/CustomerInfoModal';

type PageStep = 'calendar' | 'guests';

interface SelectedEvent {
  locationId: LocationId;
  locationNumericId: number;
  experienceId: number;
  date: string;
  time: string;
  pricePerPerson: number;
  locationName: string;
}

export default function BookingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useScrollToTop();

  // Pre-fill from URL params (from experience page CTAs)
  const prefillLocation = searchParams.get('location') as LocationId | null;

  const [step, setStep] = useState<PageStep>('calendar');
  const [selectedDate, setSelectedDate] = useState('');
  const [modalEvents, setModalEvents] = useState<CalendarEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const [guests, setGuests] = useState(2);
  const [customerInfoOpen, setCustomerInfoOpen] = useState(false);

  const handleDateSelect = useCallback((date: string, events: CalendarEvent[]) => {
    // If prefill location, filter events to that location
    const filtered = prefillLocation
      ? events.filter((e) => e.locationId === prefillLocation)
      : events;
    setSelectedDate(date);
    setModalEvents(filtered.length > 0 ? filtered : events);
    setModalOpen(true);
  }, [prefillLocation]);

  const handleBookEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent({
      locationId: event.locationId,
      locationNumericId: event.locationNumericId,
      experienceId: event.experienceId,
      date: event.date,
      time: event.time,
      pricePerPerson: event.pricePerPerson,
      locationName: event.locationName,
    });
    setModalOpen(false);
    setStep('guests');
  }, []);

  // Opens customer info modal before payment
  const handleProceedToPayment = useCallback(() => {
    if (!selectedEvent) return;
    setCustomerInfoOpen(true);
  }, [selectedEvent]);

  const handleCustomerInfoContinue = useCallback((info: CustomerInfo) => {
    if (!selectedEvent) return;
    sessionStorage.setItem(
      'booking',
      JSON.stringify({
        locationId: selectedEvent.locationId,
        locationNumericId: selectedEvent.locationNumericId,
        experienceId: selectedEvent.experienceId,
        date: selectedEvent.date,
        time: selectedEvent.time,
        guests,
        total: selectedEvent.pricePerPerson * guests,
        pricePerPerson: selectedEvent.pricePerPerson,
        customerFirstName: info.firstName,
        customerLastName: info.lastName,
        customerEmail: info.email,
        customerPhone: info.phoneCode + info.phone,
      }),
    );
    setCustomerInfoOpen(false);
    navigate('/payment');
  }, [selectedEvent, guests, navigate]);

  const handleBackToCalendar = useCallback(() => {
    setStep('calendar');
    setSelectedEvent(null);
  }, []);

  const locationLabel = selectedEvent
    ? selectedEvent.locationName
    : '';

  const formattedDate = selectedEvent
    ? new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="section-padding bg-neutral-cream min-h-screen">
      <div className="container-max max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
            {t('booking.title')}
          </h1>
          <p className="text-lg text-neutral-gray font-body">{t('booking.subtitle')}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <AvailabilityCalendar
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
              />
            </motion.div>
          )}

          {step === 'guests' && selectedEvent && (
            <motion.div
              key="guests"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3 }}
              className="max-w-md mx-auto"
            >
              {/* Selected event summary chip */}
              <div className="bg-white rounded-2xl shadow-card p-5 mb-8">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      selectedEvent.locationId === 'bloom' ? 'bg-primary' : 'bg-emerald-500'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-neutral-dark text-sm">
                      {locationLabel}
                    </p>
                    <p className="text-neutral-gray text-xs mt-0.5">
                      {formattedDate} · {selectedEvent.time}
                    </p>
                  </div>
                  <button
                    onClick={handleBackToCalendar}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    {t('booking.summary.edit')}
                  </button>
                </div>
              </div>

              <GuestSelector
                guests={guests}
                pricePerPerson={selectedEvent.pricePerPerson}
                onUpdate={setGuests}
              />

              {/* Price breakdown & CTA */}
              <div className="mt-8 bg-white rounded-2xl shadow-card p-6">
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-neutral-gray">
                    <span>{t('booking.summary.pricePerPerson')}</span>
                    <span>€{selectedEvent.pricePerPerson}</span>
                  </div>
                  <div className="flex justify-between text-neutral-gray">
                    <span>{t('booking.summary.guestCount')}</span>
                    <span>{guests}</span>
                  </div>
                  <div className="border-t border-neutral-sand/40 pt-3 flex justify-between items-center">
                    <span className="font-heading font-bold text-neutral-dark">{t('booking.summary.total')}</span>
                    <span className="font-display text-2xl text-primary">
                      €{selectedEvent.pricePerPerson * guests}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBackToCalendar}
                    className="flex-1 py-3 rounded-xl font-semibold text-neutral-gray bg-neutral-cream hover:bg-neutral-sand/30 transition-colors"
                  >
                    {t('booking.back')}
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleProceedToPayment}
                    className="flex-[2] py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 shadow-md transition-colors"
                  >
                    {t('booking.payNow')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Event detail modal */}
        <EventDetailModal
          events={modalEvents}
          date={selectedDate}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onBook={handleBookEvent}
        />

        {/* Customer information modal */}
        <CustomerInfoModal
          isOpen={customerInfoOpen}
          onClose={() => setCustomerInfoOpen(false)}
          onContinue={handleCustomerInfoContinue}
        />
      </div>
    </div>
  );
}
