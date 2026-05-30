import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollToTop } from '@/hooks/useScrollReveal';
import { useAuth } from '@/context/AuthContext';
import { fetchCalendarMonth } from '@/services/api';
import type { CalendarEvent, LocationId } from '@/services/api';
import AvailabilityCalendar from '@/components/booking/AvailabilityCalendar';
import EventDetailModal from '@/components/booking/EventDetailModal';
import GuestSelector from '@/components/booking/GuestSelector';

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
  const { user } = useAuth();
  useScrollToTop();

  // Pre-fill from URL params (from experience page CTAs)
  const prefillLocation = searchParams.get('location') as LocationId | null;

  const [step, setStep] = useState<PageStep>('calendar');
  const [selectedDate, setSelectedDate] = useState('');
  const [modalEvents, setModalEvents] = useState<CalendarEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const [guests, setGuests] = useState(2);
  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prefillLoading, setPrefillLoading] = useState(false);

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

  // Load prefilled event from query parameters if present (e.g. from homepage events)
  useEffect(() => {
    const prefillDate = searchParams.get('date');
    const prefillTime = searchParams.get('time');

    if (prefillLocation && prefillDate) {
      const parts = prefillDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-indexed for fetchCalendarMonth
        
        setPrefillLoading(true);
        fetchCalendarMonth(year, month)
          .then((events) => {
            const match = events.find(
              (e) =>
                e.locationId === prefillLocation &&
                e.date === prefillDate &&
                (!prefillTime || e.time === prefillTime)
            );
            if (match) {
              setSelectedEvent({
                locationId: match.locationId,
                locationNumericId: match.locationNumericId,
                experienceId: match.experienceId,
                date: match.date,
                time: match.time,
                pricePerPerson: match.pricePerPerson,
                locationName: match.locationName,
              });
              setStep('guests');
            }
          })
          .catch((err) => {
            console.error('Error prefilling event:', err);
          })
          .finally(() => {
            setPrefillLoading(false);
          });
      }
    }
  }, [prefillLocation, searchParams]);

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').trim().split(' ');
      setCustomerFirstName(parts[0] || '');
      setCustomerLastName(parts.slice(1).join(' ') || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '');
    }
  }, [user]);

  const validateCustomerInfo = () => {
    const nextErrors: Record<string, string> = {};

    if (!customerFirstName.trim()) {
      nextErrors.firstName = 'First name is required.';
    }

    if (!customerLastName.trim()) {
      nextErrors.lastName = 'Last name is required.';
    }

    if (!customerEmail.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Go straight to payment using auth user data
  const handleProceedToPayment = useCallback(() => {
    if (!selectedEvent) return;
    if (!validateCustomerInfo()) return;

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
        locationName: selectedEvent.locationName,
        customerFirstName: customerFirstName.trim(),
        customerLastName: customerLastName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
      }),
    );
    navigate('/payment');
  }, [selectedEvent, guests, navigate, customerFirstName, customerLastName, customerEmail, customerPhone]);

  const handleBackToCalendar = useCallback(() => {
    setStep('calendar');
    setSelectedEvent(null);
    navigate('/booking', { replace: true });
  }, [navigate]);

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
          {prefillLoading ? (
            <motion.div
              key="prefill-loading"
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-neutral-gray text-sm">Loading event details...</p>
            </motion.div>
          ) : step === 'calendar' && (
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
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-primary"
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

              <div className="mt-8 bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-heading font-semibold text-neutral-dark mb-4">Your contact details</h2>
                <p className="text-sm text-neutral-gray mb-5">We only need your email to send a booking confirmation. No login required.</p>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="space-y-2 text-sm">
                      <span className="font-medium text-neutral-dark">First name *</span>
                      <input
                        type="text"
                        value={customerFirstName}
                        onChange={(e) => { setCustomerFirstName(e.target.value); setErrors((prev) => { const next = { ...prev }; delete next.firstName; return next; }); }}
                        className="w-full px-4 py-3 rounded-2xl border border-neutral-sand/70 focus:border-primary focus:outline-none"
                      />
                      {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="font-medium text-neutral-dark">Last name *</span>
                      <input
                        type="text"
                        value={customerLastName}
                        onChange={(e) => { setCustomerLastName(e.target.value); setErrors((prev) => { const next = { ...prev }; delete next.lastName; return next; }); }}
                        className="w-full px-4 py-3 rounded-2xl border border-neutral-sand/70 focus:border-primary focus:outline-none"
                      />
                      {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                    </label>
                  </div>
                  <div className="grid gap-4">
                    <label className="space-y-2 text-sm">
                      <span className="font-medium text-neutral-dark">Email *</span>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => { setCustomerEmail(e.target.value); setErrors((prev) => { const next = { ...prev }; delete next.email; return next; }); }}
                        className="w-full px-4 py-3 rounded-2xl border border-neutral-sand/70 focus:border-primary focus:outline-none"
                      />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="font-medium text-neutral-dark">Phone</span>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Optional"
                        className="w-full px-4 py-3 rounded-2xl border border-neutral-sand/70 focus:border-primary focus:outline-none"
                      />
                    </label>
                  </div>
                </div>
              </div>

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
      </div>
    </div>
  );
}
