import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('+34');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isOver18, setIsOver18] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const COUNTRY_CODES = [
    { code: '+34', flag: '🇪🇸' }, { code: '+44', flag: '🇬🇧' }, { code: '+1', flag: '🇺🇸' },
    { code: '+49', flag: '🇩🇪' }, { code: '+33', flag: '🇫🇷' }, { code: '+39', flag: '🇮🇹' },
    { code: '+31', flag: '🇳🇱' }, { code: '+32', flag: '🇧🇪' }, { code: '+41', flag: '🇨🇭' },
    { code: '+43', flag: '🇦🇹' }, { code: '+46', flag: '🇸🇪' }, { code: '+47', flag: '🇳🇴' },
    { code: '+45', flag: '🇩🇰' }, { code: '+351', flag: '🇵🇹' }, { code: '+61', flag: '🇦🇺' },
    { code: '+81', flag: '🇯🇵' }, { code: '+91', flag: '🇮🇳' }, { code: '+55', flag: '🇧🇷' },
    { code: '+52', flag: '🇲🇽' },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!acceptTerms || !isOver18) {
      setError(t('auth.disclaimerRequired'));
      return;
    }

    setLoading(true);
    try {
      const fullPhone = phone ? phoneCode + phone : '';
      await register(name, email, fullPhone, password, passwordConfirmation);
      navigate(redirectTo || '/profile');
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
        ?.response?.data;
      if (resp?.errors) {
        setFieldErrors(resp.errors);
      }
      setError(resp?.message || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field: string) => fieldErrors[field]?.[0];

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-neutral-dark mb-2">
              {t('auth.registerTitle')}
            </h1>
            <p className="text-neutral-gray text-sm">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          {error && !Object.keys(fieldErrors).length && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                {t('auth.name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary
                           focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder={t('auth.namePlaceholder')}
              />
              {fieldError('name') && (
                <p className="text-red-600 text-xs mt-1">{fieldError('name')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary
                           focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder={t('auth.emailPlaceholder')}
              />
              {fieldError('email') && (
                <p className="text-red-600 text-xs mt-1">{fieldError('email')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary
                           focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder="••••••••"
              />
              {fieldError('password') && (
                <p className="text-red-600 text-xs mt-1">{fieldError('password')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary
                           focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                {t('auth.phone')}
              </label>
              <div className="flex gap-2">
                <select
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  className="px-2 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm bg-white"
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
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary
                             focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  placeholder={t('auth.phonePlaceholder')}
                />
              </div>
            </div>

            {/* Disclaimers */}
            <div className="pt-1 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-primary cursor-pointer flex-shrink-0"
                />
                <span className="text-sm leading-snug text-neutral-dark">
                  {t('auth.acceptTerms')}
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOver18}
                  onChange={(e) => setIsOver18(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-primary cursor-pointer flex-shrink-0"
                />
                <span className="text-sm leading-snug text-neutral-dark">
                  {t('auth.isOver18')}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary !py-3 !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.registering') : t('auth.register')}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-gray mt-6">
            {t('auth.hasAccount')}{' '}
            <Link to={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login'} className="text-primary font-medium hover:underline">
              {t('auth.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
