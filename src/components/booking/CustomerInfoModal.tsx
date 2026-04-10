import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phone: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (info: CustomerInfo) => void;
}

const COUNTRY_CODES = [
  { code: '+34', flag: '🇪🇸' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+1',  flag: '🇺🇸' },
  { code: '+49', flag: '🇩🇪' },
  { code: '+33', flag: '🇫🇷' },
  { code: '+39', flag: '🇮🇹' },
  { code: '+31', flag: '🇳🇱' },
  { code: '+32', flag: '🇧🇪' },
  { code: '+41', flag: '🇨🇭' },
  { code: '+43', flag: '🇦🇹' },
  { code: '+46', flag: '🇸🇪' },
  { code: '+47', flag: '🇳🇴' },
  { code: '+45', flag: '🇩🇰' },
  { code: '+358', flag: '🇫🇮' },
  { code: '+351', flag: '🇵🇹' },
  { code: '+61', flag: '🇦🇺' },
  { code: '+64', flag: '🇳🇿' },
  { code: '+81', flag: '🇯🇵' },
  { code: '+86', flag: '🇨🇳' },
  { code: '+91', flag: '🇮🇳' },
  { code: '+55', flag: '🇧🇷' },
  { code: '+52', flag: '🇲🇽' },
  { code: '+54', flag: '🇦🇷' },
];

export default function CustomerInfoModal({ isOpen, onClose, onContinue }: Props) {
  const { t } = useTranslation();

  const [firstName, setFirstName]     = useState('');
  const [lastName, setLastName]       = useState('');
  const [email, setEmail]             = useState('');
  const [phoneCode, setPhoneCode]     = useState('+34');
  const [phone, setPhone]             = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isOver18, setIsOver18]       = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  const clearError = (key: string) =>
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = t('booking.customerInfo.required');
    if (!lastName.trim())  errs.lastName  = t('booking.customerInfo.required');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = t('booking.customerInfo.invalidEmail');
    if (!acceptTerms || !isOver18) errs.disclaimer = t('booking.customerInfo.disclaimerRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    onContinue({ firstName, lastName, email, phoneCode, phone });
  };

  const inputBase =
    'w-full px-4 py-2.5 rounded-xl border text-sm font-body outline-none transition-colors focus:ring-2 focus:ring-primary/20';
  const inputNormal = `${inputBase} border-neutral-sand/60 focus:border-primary`;
  const inputError  = `${inputBase} border-red-400 bg-red-50 focus:border-red-400`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-elevated w-full max-w-xl overflow-hidden"
          >
            {/* ── Header ──────────────────────────────────── */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-sand/30">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-sand/40 hover:bg-neutral-cream transition-colors"
                aria-label="Back"
              >
                <svg className="w-4 h-4 text-neutral-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="font-heading font-bold text-lg text-neutral-dark flex-1">
                {t('booking.customerInfo.title')}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-cream transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4 text-neutral-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ── Form body ────────────────────────────────── */}
            <div className="px-6 py-6 space-y-5">
              {/* First Name + Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                    <span className="text-red-500 mr-0.5">*</span>
                    {t('booking.customerInfo.firstName')}:
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); clearError('firstName'); }}
                    placeholder={t('booking.customerInfo.firstNamePlaceholder')}
                    className={errors.firstName ? inputError : inputNormal}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                    <span className="text-red-500 mr-0.5">*</span>
                    {t('booking.customerInfo.lastName')}:
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); clearError('lastName'); }}
                    placeholder={t('booking.customerInfo.lastNamePlaceholder')}
                    className={errors.lastName ? inputError : inputNormal}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                    {t('booking.customerInfo.email')}:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                    placeholder={t('booking.customerInfo.emailPlaceholder')}
                    className={errors.email ? inputError : inputNormal}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                    {t('booking.customerInfo.phone')}:
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      className="px-2 py-2.5 rounded-xl border border-neutral-sand/60 focus:border-primary focus:outline-none text-sm font-body bg-white"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('booking.customerInfo.phonePlaceholder')}
                      className={`flex-1 ${inputNormal}`}
                    />
                  </div>
                </div>
              </div>

              {/* ── Disclaimer ───────────────────────────────── */}
              <div className="pt-1">
                <p className="text-sm font-medium text-neutral-dark mb-3">
                  <span className="text-red-500 mr-0.5">*</span>
                  {t('booking.customerInfo.disclaimer')}
                </p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => { setAcceptTerms(e.target.checked); clearError('disclaimer'); }}
                      className="mt-0.5 w-4 h-4 rounded accent-primary cursor-pointer flex-shrink-0"
                    />
                    <span className={`text-sm leading-snug ${errors.disclaimer && !acceptTerms ? 'text-red-500' : 'text-neutral-dark'}`}>
                      {t('booking.customerInfo.acceptTerms')}
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOver18}
                      onChange={(e) => { setIsOver18(e.target.checked); clearError('disclaimer'); }}
                      className="mt-0.5 w-4 h-4 rounded accent-primary cursor-pointer flex-shrink-0"
                    />
                    <span className={`text-sm leading-snug ${errors.disclaimer && !isOver18 ? 'text-red-500' : 'text-neutral-dark'}`}>
                      {t('booking.customerInfo.isOver18')}
                    </span>
                  </label>
                </div>
                {errors.disclaimer && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.disclaimer}
                  </p>
                )}
              </div>
            </div>

            {/* ── Footer ───────────────────────────────────── */}
            <div className="flex gap-3 px-6 py-4 border-t border-neutral-sand/30 bg-neutral-cream/40">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl font-semibold text-neutral-gray bg-white border border-neutral-sand/60 hover:bg-neutral-cream transition-colors text-sm"
              >
                {t('booking.customerInfo.close')}
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleContinue}
                className="flex-[2] py-2.5 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 shadow-md transition-colors text-sm"
              >
                {t('booking.customerInfo.continue')}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
