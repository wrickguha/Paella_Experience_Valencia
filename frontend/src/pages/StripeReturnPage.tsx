import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScrollToTop } from '@/hooks/useScrollReveal';
import { paymentApi } from '@/services/api';

type CaptureState = 'processing' | 'success' | 'failure';

export default function StripeReturnPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<CaptureState>('processing');
  const [bookingRef, setBookingRef] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  useScrollToTop();

  useEffect(() => {
    const capture = async () => {
      // Stripe redirects back with ?session_id=cs_xxx
      const sessionId =
        searchParams.get('session_id') || sessionStorage.getItem('stripe_session_id');

      if (!sessionId) {
        setErrorMsg('Missing Stripe session token.');
        setState('failure');
        return;
      }

      try {
        const res = await paymentApi.stripeCapture(sessionId);
        const data = res.data?.data;

        if (res.data?.success) {
          setBookingRef(
            data?.booking_reference ||
              sessionStorage.getItem('booking_ref') ||
              '',
          );
          setState('success');

          // Clean up session storage
          sessionStorage.removeItem('booking');
          sessionStorage.removeItem('stripe_session_id');
          sessionStorage.removeItem('booking_ref');
        } else {
          throw new Error(res.data?.message || 'Stripe capture failed.');
        }
      } catch (err: unknown) {
        console.error('Stripe payment capture failed', err);
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          (err instanceof Error ? err.message : 'Payment verification failed.');
        setErrorMsg(msg);
        setState('failure');
      }
    };

    capture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="section-padding bg-neutral-cream min-h-screen">
      <div className="container-max max-w-2xl">
        {/* Processing */}
        {state === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 border-4 border-[#635bff]/30 border-t-[#635bff] rounded-full animate-spin mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold text-neutral-dark mb-2">
              Verifying your payment…
            </h2>
            <p className="text-neutral-gray">
              Please wait while we confirm your Stripe payment.
            </p>
          </motion.div>
        )}

        {/* Success */}
        {state === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center bg-white rounded-2xl shadow-card p-10 max-w-lg mx-auto"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
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
            {bookingRef && (
              <div className="bg-neutral-cream rounded-xl p-4 mb-8 inline-block">
                <p className="text-xs text-neutral-gray">
                  {t('payment.success.bookingRef')}
                </p>
                <p className="font-heading font-bold text-xl text-primary">
                  {bookingRef}
                </p>
              </div>
            )}
            <div>
              <Link to="/" className="btn-primary inline-block">
                {t('payment.success.backHome')}
              </Link>
            </div>
          </motion.div>
        )}

        {/* Failure */}
        {state === 'failure' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center bg-white rounded-2xl shadow-card p-10 max-w-lg mx-auto"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="font-display text-3xl font-bold text-neutral-dark mb-2">
              {t('payment.failure.title')}
            </h2>
            <p className="text-lg text-neutral-gray font-body mb-4">
              {t('payment.failure.subtitle')}
            </p>
            {errorMsg && (
              <p className="text-sm text-red-500 font-body mb-4">{errorMsg}</p>
            )}
            <div className="flex gap-4 justify-center">
              <Link to="/booking" className="btn-primary">
                {t('payment.failure.tryAgain')}
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 rounded-xl font-semibold text-neutral-gray bg-neutral-cream hover:bg-neutral-sand/30 transition-colors"
              >
                {t('payment.failure.contactSupport')}
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
