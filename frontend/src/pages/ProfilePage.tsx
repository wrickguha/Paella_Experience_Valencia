import { useState, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { authApi, type UserBooking } from '@/services/api';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');

  const COUNTRY_CODES = [
    { code: '+34', flag: '🇪🇸' }, { code: '+44', flag: '🇬🇧' }, { code: '+1', flag: '🇺🇸' },
    { code: '+49', flag: '🇩🇪' }, { code: '+33', flag: '🇫🇷' }, { code: '+39', flag: '🇮🇹' },
    { code: '+31', flag: '🇳🇱' }, { code: '+32', flag: '🇧🇪' }, { code: '+41', flag: '🇨🇭' },
    { code: '+43', flag: '🇦🇹' }, { code: '+46', flag: '🇸🇪' }, { code: '+47', flag: '🇳🇴' },
    { code: '+45', flag: '🇩🇰' }, { code: '+351', flag: '🇵🇹' }, { code: '+61', flag: '🇦🇺' },
    { code: '+81', flag: '🇯🇵' }, { code: '+91', flag: '🇮🇳' }, { code: '+55', flag: '🇧🇷' },
    { code: '+52', flag: '🇲🇽' },
  ];

  const parsePhone = (full: string | null) => {
    if (!full) return { code: '+34', number: '' };
    const match = COUNTRY_CODES.find((c) => full.startsWith(c.code));
    return match ? { code: match.code, number: full.slice(match.code.length) } : { code: '+34', number: full };
  };

  const parsed = parsePhone(user?.phone ?? null);

  // Profile edit state
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phoneCode, setPhoneCode] = useState(parsed.code);
  const [phone, setPhone] = useState(parsed.number);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [saving, setSaving] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      const p = parsePhone(user.phone);
      setPhoneCode(p.code);
      setPhone(p.number);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      setBookingsLoading(true);
      authApi.getBookings()
        .then((res) => setBookings(res.data.data))
        .catch(() => {})
        .finally(() => setBookingsLoading(false));
    }
  }, [activeTab]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setSaving(true);

    const data: Record<string, string> = {};
    if (name !== user?.name) data.name = name;
    if (email !== user?.email) data.email = email;
    const fullPhone = phone ? phoneCode + phone : '';
    if (fullPhone !== (user?.phone ?? '')) data.phone = fullPhone;
    if (newPassword) {
      data.current_password = currentPassword;
      data.password = newPassword;
      data.password_confirmation = passwordConfirmation;
    }

    if (Object.keys(data).length === 0) {
      setSaving(false);
      return;
    }

    try {
      await authApi.updateProfile(data);
      setProfileMsg(t('auth.profileUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setPasswordConfirmation('');
      await refreshUser();
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
        ?.response?.data;
      const firstError = resp?.errors ? Object.values(resp.errors)[0]?.[0] : null;
      setProfileError(firstError || resp?.message || t('auth.profileError'));
    } finally {
      setSaving(false);
    }
  };

  const upcomingBookings = bookings.filter((b) => new Date(b.date) >= new Date());
  const pastBookings = bookings.filter((b) => new Date(b.date) < new Date());

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  const BookingCard = ({ booking }: { booking: UserBooking }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-neutral-dark">{booking.location}</p>
          <p className="text-sm text-neutral-gray">{booking.experience}</p>
        </div>
        {statusBadge(booking.payment_status)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-neutral-gray">{t('auth.date')}</p>
          <p className="font-medium text-neutral-dark">{booking.date}</p>
        </div>
        <div>
          <p className="text-neutral-gray">{t('auth.time')}</p>
          <p className="font-medium text-neutral-dark">{booking.time?.substring(0, 5)}</p>
        </div>
        <div>
          <p className="text-neutral-gray">{t('auth.guests')}</p>
          <p className="font-medium text-neutral-dark">{booking.guests}</p>
        </div>
        <div>
          <p className="text-neutral-gray">{t('auth.total')}</p>
          <p className="font-medium text-neutral-dark">€{booking.total_price}</p>
        </div>
      </div>
      <p className="text-xs text-neutral-gray mt-3">
        {t('auth.reference')}: {booking.reference}
      </p>
    </div>
  );

  return (
    <section className="min-h-[80vh] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-neutral-dark mb-1">
            {t('auth.welcomeBack', { name: user?.name })}
          </h1>
          <p className="text-neutral-gray text-sm">{user?.email}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8">
          {(['profile', 'bookings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-neutral-dark shadow-sm'
                  : 'text-neutral-gray hover:text-neutral-dark'
              }`}
            >
              {t(`auth.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="font-display text-xl font-bold text-neutral-dark mb-6">
              {t('auth.editProfile')}
            </h2>

            {profileMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
                {profileMsg}
              </div>
            )}
            {profileError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                  {t('auth.name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary
                             focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary
                             focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>

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

              <hr className="border-gray-100" />

              <p className="text-sm text-neutral-gray">{t('auth.changePasswordHint')}</p>

              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                  {t('auth.currentPassword')}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary
                             focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                    {t('auth.newPassword')}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary
                               focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-dark mb-1.5">
                    {t('auth.confirmPassword')}
                  </label>
                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    minLength={8}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary
                               focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary !py-3 !px-8 !text-sm disabled:opacity-50"
              >
                {saving ? t('auth.saving') : t('auth.saveChanges')}
              </button>
            </form>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {bookingsLoading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-neutral-gray text-sm">{t('auth.loadingBookings')}</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-neutral-gray text-lg mb-2">{t('auth.noBookings')}</p>
                <p className="text-neutral-gray text-sm">{t('auth.noBookingsHint')}</p>
              </div>
            ) : (
              <>
                {upcomingBookings.length > 0 && (
                  <div>
                    <h3 className="font-display text-lg font-bold text-neutral-dark mb-4">
                      {t('auth.upcomingBookings')}
                    </h3>
                    <div className="space-y-3">
                      {upcomingBookings.map((b) => <BookingCard key={b.id} booking={b} />)}
                    </div>
                  </div>
                )}

                {pastBookings.length > 0 && (
                  <div>
                    <h3 className="font-display text-lg font-bold text-neutral-dark mb-4">
                      {t('auth.pastBookings')}
                    </h3>
                    <div className="space-y-3">
                      {pastBookings.map((b) => <BookingCard key={b.id} booking={b} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
