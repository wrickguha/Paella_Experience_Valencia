import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiX } from 'react-icons/fi';

export default function CookieConsent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage for existing preference
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay slightly for better entrance effect
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // If already accepted/declined, set the global flag
      window.analyticsConsent = consent === 'accepted';
    }
  }, []);

  useEffect(() => {
    // Listen for custom event to open settings
    const handleOpenSettings = () => {
      setIsVisible(true);
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => {
      window.removeEventListener('open-cookie-settings', handleOpenSettings);
    };
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    window.analyticsConsent = true;
    setIsVisible(false);
    
    // Dispatch custom event for analytical scripts to load/enable
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: { analytics: true } }));
  };

  const handleDeclineAll = () => {
    localStorage.setItem('cookie-consent', 'declined');
    window.analyticsConsent = false;
    setIsVisible(false);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: { analytics: false } }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 150 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[9999] 
                     bg-white/95 backdrop-blur-md border border-neutral-sand rounded-2xl p-6 
                     shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
                <FiShield className="w-6 h-6" />
              </div>
              <h3 className="font-modern font-bold text-neutral-dark text-lg">
                {t('cookieConsent.title')}
              </h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-neutral-gray hover:text-neutral-dark transition-colors p-1 hover:bg-neutral-cream rounded-lg"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Message */}
          <p className="text-sm text-neutral-gray font-modern leading-relaxed">
            {t('cookieConsent.message')}{' '}
            <Link
              to="/cookie-policy"
              className="text-accent font-semibold hover:underline font-modern"
              onClick={() => setIsVisible(false)}
            >
              {t('cookieConsent.policyLink')}
            </Link>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={handleDeclineAll}
              className="flex-1 px-4 py-3 bg-neutral-cream text-neutral-dark border border-neutral-sand 
                         hover:bg-neutral-sand/30 hover:border-neutral-sand font-modern font-semibold rounded-xl 
                         transition-all duration-200 text-sm active:scale-98"
            >
              {t('cookieConsent.decline')}
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 px-4 py-3 bg-accent text-white hover:bg-accent-alt font-modern font-semibold 
                         rounded-xl shadow-soft hover:shadow-card transition-all duration-200 text-sm active:scale-98"
            >
              {t('cookieConsent.accept')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
