import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollReveal';
import { fetchSettings } from '@/services/api';
import { LevelTestCard } from '@/components/SpanishLevelTest';
import { useSectionStyle } from '@/context/SettingsContext';

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LanguageTestsPage() {
  useScrollToTop();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('es') ? 'es' : 'en';
  const isEs = lang === 'es';

  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings('general')
      .then(res => {
        setSettings(res || {});
      })
      .catch(() => {});
  }, []);

  const infoStyle = useSectionStyle('info', 'langtest');
  const cardsStyle = useSectionStyle('cards', 'langtest');

  return (
    <div className="bg-bg-main min-h-screen pt-8 sm:pt-12">

      {/* ── Info strip ────────────────────────────────────────────── */}
      <section className="py-8 border-b border-neutral-sand/40" style={infoStyle}>
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: settings.langtests_info1_icon || '🎧', label: settings[`langtests_info1_text_${lang}`] || (isEs ? 'Introducción en audio' : 'Audio Introduction') },
              { icon: settings.langtests_info2_icon || '📊', label: settings[`langtests_info2_text_${lang}`] || (isEs ? 'Por nivel de habilidad' : 'By Skill Level') },
              { icon: settings.langtests_info3_icon || '🌐', label: settings[`langtests_info3_text_${lang}`] || (isEs ? 'Español & Inglés' : 'Spanish & English') },
              { icon: settings.langtests_info4_icon || '🆓', label: settings[`langtests_info4_text_${lang}`] || (isEs ? 'Totalmente gratuito' : 'Completely Free') },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="text-sm font-medium text-neutral-gray">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Level Tests Section (Start Quiz Cards) ──────────────────── */}
      <section id="tests" className="py-12 px-4 sm:px-6 lg:px-8 bg-neutral-cream/20" style={cardsStyle}>
        <div className="container-max mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <LevelTestCard lang="es" settings={settings} />
            <LevelTestCard lang="en" settings={settings} />
          </div>
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────────────────────── */}
      <section className="py-14 bg-primary text-center">
        <div className="container-max px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
          <p className="text-white/60 text-sm uppercase tracking-widest mb-3">
            {isEs ? 'También te puede interesar' : 'You might also enjoy'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            {isEs ? 'Vive la experiencia SpeakEasy' : 'Live the SpeakEasy Experience'}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/experience" className="btn-primary">
              {isEs ? 'Ver experiencias' : 'Explore Experiences'}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold font-modern
                         bg-transparent text-white border-2 border-white/40
                         hover:bg-white hover:text-primary
                         transition-all duration-300 hover:scale-105 active:scale-95 shadow-soft"
            >
              {isEs ? 'Contáctanos' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
