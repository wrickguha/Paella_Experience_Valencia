import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScrollToTop } from '@/hooks/useScrollReveal';

export default function PaymentCancelPage() {
  const { t } = useTranslation();
  useScrollToTop();

  return (
    <div className="section-padding bg-neutral-cream min-h-screen">
      <div className="container-max max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white rounded-2xl shadow-card p-10 max-w-lg mx-auto"
        >
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-bold text-neutral-dark mb-2">
            Payment Cancelled
          </h2>
          <p className="text-lg text-neutral-gray font-body mb-8">
            Your payment was cancelled. Your booking is still reserved — you can try paying again.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/booking" className="btn-primary">
              {t('payment.failure.tryAgain', 'Try Again')}
            </Link>
            <Link
              to="/"
              className="px-6 py-3 rounded-xl font-semibold text-neutral-gray bg-neutral-cream hover:bg-neutral-sand/30 transition-colors"
            >
              {t('payment.success.backHome', 'Back to Home')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
