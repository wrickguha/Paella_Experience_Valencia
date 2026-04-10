import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useScrollToTop } from '@/hooks/useScrollReveal';

export default function ContactPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  useScrollToTop();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {sent ? (
              <div className="card text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <p className="text-neutral-dark font-body">{t('contact.form.success')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card space-y-5">
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

                <button type="submit" className="btn-primary w-full">
                  {t('contact.form.send')}
                </button>
              </form>
            )}
          </motion.div>

          {/* Contact Info + Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="card">
              <h3 className="font-heading font-semibold text-lg text-neutral-dark mb-6">
                Valencia, Spain
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <span className="text-xl mt-0.5">📍</span>
                  <p className="text-sm text-neutral-gray font-body whitespace-pre-line">
                    {t('contact.info.address')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl">📧</span>
                  <p className="text-sm text-neutral-gray font-body">{t('contact.info.email')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl">📞</span>
                  <p className="text-sm text-neutral-gray font-body">{t('contact.info.phone')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl">🕐</span>
                  <p className="text-sm text-neutral-gray font-body">{t('contact.info.hours')}</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="card !p-0 overflow-hidden h-64">
              <div className="w-full h-full bg-neutral-sand flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl block mb-2">🗺</span>
                  <p className="text-sm text-neutral-gray font-body">
                    Map — Calle de la Paz, 12, Valencia
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
