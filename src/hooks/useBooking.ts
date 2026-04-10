import { useState, useCallback, useMemo } from 'react';
import type { LocationId, TimeSlot, DayAvailability } from '@/services/mockData';
import { locations, getMockAvailability } from '@/services/mockData';

export type WizardStep = 'location' | 'date' | 'time' | 'guests' | 'summary';

interface BookingState {
  locationId: LocationId | null;
  date: string;
  time: string;
  guests: number;
}

const initialState: BookingState = {
  locationId: null,
  date: '',
  time: '',
  guests: 2,
};

const STEPS: WizardStep[] = ['location', 'date', 'time', 'guests', 'summary'];

export function useBooking() {
  const [booking, setBooking] = useState<BookingState>(initialState);
  const [step, setStep] = useState<WizardStep>('location');

  const updateField = useCallback(
    <K extends keyof BookingState>(field: K, value: BookingState[K]) => {
      setBooking((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const currentStepIndex = STEPS.indexOf(step);

  const next = useCallback(() => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }, [step]);

  const back = useCallback(() => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }, [step]);

  const goToStep = useCallback((s: WizardStep) => {
    setStep(s);
  }, []);

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === booking.locationId) ?? null,
    [booking.locationId],
  );

  const pricePerPerson = selectedLocation?.pricePerPerson ?? 59;
  const subtotal = pricePerPerson * booking.guests;
  const total = subtotal;

  /** Get availability for current month & location */
  const getAvailability = useCallback(
    (year: number, month: number): DayAvailability[] => {
      if (!booking.locationId) return [];
      return getMockAvailability(booking.locationId, year, month);
    },
    [booking.locationId],
  );

  /** Get time slots for the selected date */
  const getTimeSlots = useCallback(
    (year: number, month: number): TimeSlot[] => {
      if (!booking.locationId || !booking.date) return [];
      const avails = getMockAvailability(booking.locationId, year, month);
      const day = avails.find((a) => a.date === booking.date);
      return day?.slots ?? [];
    },
    [booking.locationId, booking.date],
  );

  const reset = useCallback(() => {
    setBooking(initialState);
    setStep('location');
  }, []);

  const canProceed = useMemo(() => {
    switch (step) {
      case 'location':
        return booking.locationId !== null;
      case 'date':
        return booking.date !== '';
      case 'time':
        return booking.time !== '';
      case 'guests':
        return booking.guests >= 1;
      case 'summary':
        return true;
      default:
        return false;
    }
  }, [step, booking]);

  return {
    booking,
    step,
    steps: STEPS,
    currentStepIndex,
    updateField,
    next,
    back,
    goToStep,
    selectedLocation,
    pricePerPerson,
    subtotal,
    total,
    getAvailability,
    getTimeSlots,
    canProceed,
    reset,
  };
}
