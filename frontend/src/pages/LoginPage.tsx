import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';

export default function LoginPage() {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('auth_token', res.data.token);

      if (res.data.user.role === 'admin') {
        // Redirect immediately without updating auth context state.
        // This avoids GuestRoute flashing /profile before the browser navigates.
        const adminUrl = import.meta.env.VITE_ADMIN_URL ?? '/admin';
        window.location.href = adminUrl;
        return; // keep loading spinner visible until browser navigates
      }

      // Regular user: load user into context, then navigate
      await refreshUser();
      navigate('/profile');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
          ?.response?.data?.message ||
        (err as { response?: { data?: { errors?: Record<string, string[]> } } })
          ?.response?.data?.errors?.email?.[0] ||
        t('auth.loginError');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-neutral-dark mb-2">
              {t('auth.loginTitle')}
            </h1>
            <p className="text-neutral-gray text-sm">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
              {loading ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-gray mt-6">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              {t('auth.registerLink')}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
