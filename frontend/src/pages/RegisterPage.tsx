import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      await register(name, email, password, passwordConfirmation);
      navigate('/profile');
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
            <Link to="/login" className="text-primary font-medium hover:underline">
              {t('auth.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
