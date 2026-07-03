import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useScrollToTop } from '@/hooks/useScrollReveal';
import { fetchContactSettings, sendContactMessage } from '@/services/api';
import { FiMapPin, FiMail, FiPhone, FiClock } from 'react-icons/fi';

export default function ContactPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contact, setContact] = useState<Record<string, string>>({});
  useScrollToTop();

  useEffect(() => {
    fetchContactSettings()
      .then(setContact)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await sendContactMessage(form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err?.response?.data?.message || t('contact.form.error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="section-padding bg-neutral-cream min-h-screen">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-neutral-gray font-body">{t('contact.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-stretch">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="h-full flex flex-col"
          >
            {sent ? (
              <div className="card text-center flex-1 flex flex-col justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <p className="text-neutral-dark font-body">{t('contact.form.success')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card flex-1 flex flex-col justify-between">
                <div className="space-y-5">
                  {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-body">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-heading font-medium text-neutral-dark mb-2">
                      {t('contact.form.name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-sand rounded-xl font-body text-sm
                                 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-heading font-medium text-neutral-dark mb-2">
                      {t('contact.form.email')}
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-sand rounded-xl font-body text-sm
                                 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-heading font-medium text-neutral-dark mb-2">
                      {t('contact.form.subject')}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-sand rounded-xl font-body text-sm
                                 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-heading font-medium text-neutral-dark mb-2">
                      {t('contact.form.message')}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-sand rounded-xl font-body text-sm
                                 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    />
                  </div>
                </div>

                <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-60 mt-6">
                  {sending ? t('contact.form.sending') : t('contact.form.send')}
                </button>
              </form>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-full flex flex-col"
          >
            <div className="bg-gradient-to-br from-primary-light via-primary to-primary-dark text-white rounded-2xl shadow-card p-6 sm:p-8 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-elevated flex-1 flex flex-col justify-between overflow-hidden relative">
              {/* Decorative background shapes */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary-light/50 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

              <div className="relative z-10 space-y-8 my-auto">
                <div>
                  <span className="text-accent font-semibold tracking-wider text-xs uppercase mb-1 block">
                    {t('contact.info.tagline', 'Direct Contact')}
                  </span>
                  <h3 className="font-display font-bold text-2xl text-white mb-2">
                    {contact.contact_city || 'Valencia, Spain'}
                  </h3>
                  <p className="text-white/70 text-sm font-body leading-relaxed">
                    Have questions about our language experiences? Reach out to us directly through any of these channels.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Address */}
                  {contact.contact_address && (
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                        <FiMapPin className="text-lg" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold">Address</span>
                        <p className="text-sm font-body text-white/90 whitespace-pre-line leading-relaxed">
                          {contact.contact_address}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {contact.contact_email && (
                    <a
                      href={`mailto:${contact.contact_email}`}
                      className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FiMail className="text-lg" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold">Email Us</span>
                        <span className="text-sm font-body text-white/90 group-hover:text-accent transition-colors break-all">
                          {contact.contact_email}
                        </span>
                      </div>
                    </a>
                  )}

                  {/* Phone */}
                  {contact.contact_phone && (
                    <a
                      href={`tel:${contact.contact_phone}`}
                      className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FiPhone className="text-lg" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold">Call Us</span>
                        <span className="text-sm font-body text-white/90 group-hover:text-accent transition-colors">
                          {contact.contact_phone}
                        </span>
                      </div>
                    </a>
                  )}

                  {/* Hours */}
                  {contact.contact_hours && (
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                        <FiClock className="text-lg" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-white/50 uppercase tracking-wider font-semibold">Hours</span>
                        <p className="text-sm font-body text-white/90">
                          {contact.contact_hours}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Slogan watermark */}
              <div className="relative z-10 mt-8 pt-6 border-t border-white/10 text-center select-none">
                <span className="font-script text-accent text-3xl block opacity-90 transform -rotate-1">
                  SpeakEasy Valencia
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
