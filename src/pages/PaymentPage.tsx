import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollToTop } from '@/hooks/useScrollReveal';

type PaymentState = 'review' | 'processing' | 'success' | 'failure';

interface StoredBooking {
  locationId: string;
  date: string;
  time: string;
  guests: number;
  total: number;
  pricePerPerson: number;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

const locationLabels: Record<string, string> = {
  bloom: 'Bloom Gallery — Ruzafa, Valencia',
  magnolia: 'Casa Magnolia — Alzira',
};

export default function PaymentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState<PaymentState>('review');
  useScrollToTop();

  const stored = useMemo<StoredBooking | null>(() => {
    try {
      const raw = sessionStorage.getItem('booking');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!stored) navigate('/booking');
  }, [stored, navigate]);

  if (!stored) return null;

  const formattedDate = new Date(stored.date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePayPal = () => {
    setState('processing');
    // Simulate PayPal redirect + payment
    setTimeout(() => {
      setState('success');
      sessionStorage.removeItem('booking');
    }, 2200);
  };

  const bookingRef = `PEV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;

  return (
    <div className="section-padding bg-neutral-cream min-h-screen">
      <div className="container-max max-w-2xl">
        <AnimatePresence mode="wait">
          {/* ── Review & Pay ─────────────────────────────── */}
          {(state === 'review' || state === 'processing') && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-10">
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-neutral-dark mb-3">
                  {t('payment.title')}
                </h1>
                <p className="text-lg text-neutral-gray font-body">{t('payment.subtitle')}</p>
              </div>

              {/* Booking summary card */}
              <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
                <h3 className="font-heading font-semibold text-base text-neutral-dark mb-5">
                  {t('payment.bookingSummary')}
                </h3>

                <div className="space-y-4 text-sm">
                  {stored.customerFirstName && (
                    <div className="flex justify-between">
                      <span className="text-neutral-gray">{t('booking.customerInfo.firstName')} &amp; {t('booking.customerInfo.lastName')}</span>
                      <span className="text-neutral-dark font-medium">{stored.customerFirstName} {stored.customerLastName}</span>
                    </div>
                  )}
                  {stored.customerEmail && (
                    <div className="flex justify-between">
                      <span className="text-neutral-gray">{t('booking.customerInfo.email')}</span>
                      <span className="text-neutral-dark font-medium">{stored.customerEmail}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-gray">{t('booking.summary.location')}</span>
                    <span className="text-neutral-dark font-medium">{locationLabels[stored.locationId] ?? stored.locationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-gray">{t('booking.summary.date')}</span>
                    <span className="text-neutral-dark font-medium">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-gray">{t('booking.summary.time')}</span>
                    <span className="text-neutral-dark font-medium">{stored.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-gray">{t('booking.summary.guestCount')}</span>
                    <span className="text-neutral-dark font-medium">{stored.guests}</span>
                  </div>
                  <div className="border-t border-neutral-sand/40 pt-4 flex justify-between items-center">
                    <span className="font-heading font-bold text-neutral-dark">{t('booking.summary.total')}</span>
                    <span className="font-display text-2xl text-primary">€{stored.total}</span>
                  </div>
                </div>
              </div>

              {/* PayPal button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={state === 'processing'}
                onClick={handlePayPal}
                className="w-full py-4 rounded-2xl font-semibold text-white bg-[#0070ba] hover:bg-[#005ea6] shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {state === 'processing' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {t('payment.redirecting')}
                  </>
                ) : (
                  <>
                    {/* PayPal logo mark */}
                    <svg className="h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
                    </svg>
                    {t('payment.paypal')}
                  </>
                )}
              </motion.button>

              <p className="text-xs text-neutral-gray text-center mt-4 flex items-center justify-center gap-1">
                🔒 {t('payment.secure')}
              </p>
            </motion.div>
          )}

          {/* ── Success ──────────────────────────────────── */}
          {state === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center bg-white rounded-2xl shadow-card p-10 max-w-lg mx-auto"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-3xl font-bold text-neutral-dark mb-2">
                {t('payment.success.title')}
              </h2>
              <p className="text-lg text-neutral-gray font-body mb-4">
                {t('payment.success.subtitle')}
              </p>
              <p className="text-sm text-neutral-gray font-body mb-8">
                {t('payment.success.message')}
              </p>
              <div className="bg-neutral-cream rounded-xl p-4 mb-8 inline-block">
                <p className="text-xs text-neutral-gray">{t('payment.success.bookingRef')}</p>
                <p className="font-heading font-bold text-xl text-primary">{bookingRef}</p>
              </div>
              <div>
                <Link to="/" className="btn-primary inline-block">
                  {t('payment.success.backHome')}
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── Failure ──────────────────────────────────── */}
          {state === 'failure' && (
            <motion.div
              key="failure"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center bg-white rounded-2xl shadow-card p-10 max-w-lg mx-auto"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="font-display text-3xl font-bold text-neutral-dark mb-2">
                {t('payment.failure.title')}
              </h2>
              <p className="text-lg text-neutral-gray font-body mb-4">
                {t('payment.failure.subtitle')}
              </p>
              <p className="text-sm text-neutral-gray font-body mb-8">
                {t('payment.failure.message')}
              </p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setState('review')} className="btn-primary">
                  {t('payment.failure.tryAgain')}
                </button>
                <Link to="/contact" className="px-6 py-3 rounded-xl font-semibold text-neutral-gray bg-neutral-cream hover:bg-neutral-sand/30 transition-colors">
                  {t('payment.failure.contactSupport')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
