import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollToTop } from '@/hooks/useScrollReveal';
import { bookingApi, paymentApi } from '@/services/api';

type PaymentState = 'review' | 'processing' | 'success' | 'failure';

interface CouponValidation {
  valid: boolean;
  discountPercent: number;
  message: string;
}

interface StoredBooking {
  locationId: string;
  locationNumericId: number;
  experienceId: number;
  locationName: string;
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

export default function PaymentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState<PaymentState>('review');
  const [bookingRef, setBookingRef] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponValidation, setCouponValidation] = useState<CouponValidation | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [processingMethod, setProcessingMethod] = useState<'stripe' | 'paypal' | null>(null);
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

  /**
   * Full payment flow:
   * 1. Create booking in DB  → returns booking.id
   * 2. Create PayPal order   → returns approval_url
   * 3. Redirect to PayPal    → user approves
   * 4. PayPal returns here   → /payment/success route captures
   */
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponValidation({ valid: false, discountPercent: 0, message: 'Please enter a coupon code.' });
      return;
    }

    setCouponLoading(true);
    setErrorMsg('');

    try {
      const res = await paymentApi.validateCoupon(couponCode.trim());
      const discountPercent = Number(res.data.discount_percent || 0);
      setCouponValidation({ valid: true, discountPercent, message: `Coupon applied: ${discountPercent}% off` });
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Coupon code is invalid or inactive.';
      setCouponValidation({ valid: false, discountPercent: 0, message });
    }

    setCouponLoading(false);
  };

  const handleStripe = async () => {
    if (!stored) return;
    if (couponCode.trim() && couponValidation?.valid === false) {
      setErrorMsg('Please provide a valid coupon code before checkout.');
      setState('failure');
      return;
    }

    setState('processing');
    setProcessingMethod('stripe');
    setErrorMsg('');

    try {
      // Step 1: Create booking
      const bookingRes = await bookingApi.create({
        first_name: stored.customerFirstName ?? '',
        last_name: stored.customerLastName ?? '',
        email: stored.customerEmail ?? '',
        phone: stored.customerPhone ?? null,
        location_id: stored.locationNumericId,
        experience_id: stored.experienceId,
        date: stored.date,
        time: stored.time,
        guests: stored.guests,
        coupon_code: couponValidation?.valid ? couponCode.trim().toUpperCase() : undefined,
      });

      const bookingData = bookingRes.data?.data?.booking;
      if (!bookingData?.id) throw new Error('Booking creation failed.');

      const ref = bookingData.reference ?? '';
      setBookingRef(ref);

      // Step 2: Handle free bookings
      if (bookingData.total_price <= 0) {
        setState('success');
        setProcessingMethod(null);
        return;
      }

      // Step 3: Create Stripe Checkout Session → redirect
      const sessionRes = await paymentApi.stripeCreateSession(bookingData.id);

      if (sessionRes.data?.data?.is_free) {
        setBookingRef(sessionRes.data.data.booking_reference);
        setState('success');
        setProcessingMethod(null);
        return;
      }

      const sessionUrl = sessionRes.data?.data?.session_url;
      const sessionId  = sessionRes.data?.data?.session_id;

      if (sessionUrl) {
        sessionStorage.setItem('stripe_session_id', sessionId);
        sessionStorage.setItem('booking_ref', ref);
        window.location.href = sessionUrl;
      } else {
        throw new Error('No Stripe session URL returned.');
      }
    } catch (err: unknown) {
      console.error('Stripe payment flow failed', err);
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
        || (err instanceof Error ? err.message : 'Something went wrong.');
      setErrorMsg(msg);
      setState('failure');
      setProcessingMethod(null);
    }
  };

  const handlePayPal = async () => {
    if (!stored) return;
    if (couponCode.trim() && couponValidation?.valid === false) {
      setErrorMsg('Please provide a valid coupon code before checkout.');
      setState('failure');
      return;
    }

    setState('processing');
    setProcessingMethod('paypal');
    setErrorMsg('');

    try {
      // Step 1: Create booking
      const bookingRes = await bookingApi.create({
        first_name: stored.customerFirstName ?? '',
        last_name: stored.customerLastName ?? '',
        email: stored.customerEmail ?? '',
        phone: stored.customerPhone ?? null,
        location_id: stored.locationNumericId,
        experience_id: stored.experienceId,
        date: stored.date,
        time: stored.time,
        guests: stored.guests,
        coupon_code: couponValidation?.valid ? couponCode.trim().toUpperCase() : undefined,
      });

      const bookingData = bookingRes.data?.data?.booking;
      if (!bookingData?.id) throw new Error('Booking creation failed.');

      const ref = bookingData.reference ?? '';
      setBookingRef(ref);

      // Step 2: Create PayPal order (or complete free booking directly)
      const orderRes = await paymentApi.createOrder(bookingData.id);
      
      if (orderRes.data?.data?.is_free) {
        setBookingRef(orderRes.data.data.booking_reference);
        setState('success');
        setProcessingMethod(null);
        return;
      }

      const approvalUrl = orderRes.data?.data?.approval_url;
      const orderId = orderRes.data?.data?.order_id;

      if (approvalUrl) {
        // Save order_id for capture on return
        sessionStorage.setItem('paypal_order_id', orderId);
        sessionStorage.setItem('booking_ref', ref);
        // Redirect to PayPal
        window.location.href = approvalUrl;
      } else {
        // PayPal order created but no approval URL (shouldn't happen)
        throw new Error('No PayPal approval URL returned.');
      }
    } catch (err: unknown) {
      console.error('Payment flow failed', err);
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
        || (err instanceof Error ? err.message : 'Something went wrong.');
      setErrorMsg(msg);
      setState('failure');
      setProcessingMethod(null);
    }
  };

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
                  <div className="grid gap-3">
                    <label className="text-sm font-medium text-neutral-dark">Coupon Code</label>
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponValidation(null);
                        }}
                        className="w-full px-3 py-2 border rounded-lg text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Enter coupon code"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={couponLoading}
                        className="rounded-xl bg-primary px-4 text-white font-semibold transition-colors hover:bg-primary-dark disabled:opacity-60"
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {couponValidation && (
                      <p className={couponValidation.valid ? 'text-sm text-green-600' : 'text-sm text-red-500'}>
                        {couponValidation.message}
                      </p>
                    )}
                  </div>

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
                    <span className="text-neutral-dark font-medium">{stored.locationName}</span>
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
                  {couponValidation?.valid && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Discount ({couponValidation.discountPercent}%)</span>
                      <span>-€{((stored.total * couponValidation.discountPercent) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-sand/40 pt-4 flex justify-between items-center">
                    <span className="font-heading font-bold text-neutral-dark">{t('booking.summary.total')}</span>
                    <span className="font-display text-2xl text-primary">€{couponValidation?.valid ? (stored.total - (stored.total * couponValidation.discountPercent) / 100).toFixed(2) : stored.total}</span>
                  </div>
                </div>
              </div>

              {/* Payment buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stripe */}
                <motion.button
                  whileHover={state !== 'processing' ? { y: -3, scale: 1.02, boxShadow: '0 12px 30px -4px rgba(99, 91, 255, 0.4)' } : {}}
                  whileTap={state !== 'processing' ? { scale: 0.98 } : {}}
                  disabled={state === 'processing'}
                  onClick={handleStripe}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-[#635bff] to-[#7a73ff] shadow-lg transition-all flex items-center justify-center gap-2.5 border border-white/10 ${
                    state === 'processing'
                      ? processingMethod === 'stripe'
                        ? 'cursor-wait shadow-inner'
                        : 'opacity-30 cursor-not-allowed pointer-events-none scale-95'
                      : 'cursor-pointer'
                  }`}
                >
                  {state === 'processing' && processingMethod === 'stripe' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0" />
                      <span className="text-sm sm:text-base">{t('payment.redirectingStripe')}</span>
                    </>
                  ) : (
                    <>
                      {/* Stripe icon */}
                      <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.04 9.36c0-.93.76-1.29 2.02-1.29 1.8 0 4.09.55 5.89 1.52V4.07C18.98 3.38 17.01 3 15.07 3c-4.16 0-6.93 2.17-6.93 5.79 0 5.65 7.78 4.75 7.78 7.18 0 1.1-.96 1.46-2.28 1.46-1.97 0-4.49-.81-6.49-1.9v5.61c2.2.95 4.43 1.35 6.49 1.35 4.27 0 7.21-2.12 7.21-5.78-.04-6.1-7.81-5.02-7.81-7.35z" fill="currentColor"/>
                      </svg>
                      <span className="text-sm sm:text-base whitespace-nowrap">Pay with Stripe</span>
                      {/* Card logos */}
                      <span className="flex items-center gap-1 opacity-70 scale-90 flex-shrink-0">
                        <span className="bg-white/20 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider">VISA</span>
                        <span className="bg-white/20 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider">MC</span>
                      </span>
                    </>
                  )}
                </motion.button>

                {/* PayPal */}
                <motion.button
                  whileHover={state !== 'processing' ? { y: -3, scale: 1.02, boxShadow: '0 12px 30px -4px rgba(0, 112, 186, 0.4)' } : {}}
                  whileTap={state !== 'processing' ? { scale: 0.98 } : {}}
                  disabled={state === 'processing'}
                  onClick={handlePayPal}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold text-white bg-[#0070ba] hover:bg-[#005ea6] shadow-lg transition-all flex items-center justify-center gap-2.5 border border-white/10 ${
                    state === 'processing'
                      ? processingMethod === 'paypal'
                        ? 'cursor-wait shadow-inner'
                        : 'opacity-30 cursor-not-allowed pointer-events-none scale-95'
                      : 'cursor-pointer'
                  }`}
                >
                  {state === 'processing' && processingMethod === 'paypal' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0" />
                      <span className="text-sm sm:text-base">{t('payment.redirectingPaypal')}</span>
                    </>
                  ) : (
                    <>
                      {/* PayPal logo mark */}
                      <svg className="h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
                      </svg>
                      <span className="text-sm sm:text-base">Pay</span>
                    </>
                  )}
                </motion.button>
              </div>

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
              {errorMsg && (
                <p className="text-sm text-red-500 font-body mb-4">{errorMsg}</p>
              )}
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
