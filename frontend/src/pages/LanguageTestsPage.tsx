import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useScrollToTop, useScrollReveal } from '@/hooks/useScrollReveal';
import { joinLanguageSession, trackLead, fetchSettings } from '@/services/api';
import { LevelTestCard } from '@/components/SpanishLevelTest';
import { useSectionStyle } from '@/context/SettingsContext';

// ── Skill Level Badge ─────────────────────────────────────────────────────────
const LEVEL_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  beginner:     { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  intermediate: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  advanced:     { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500'      },
};

function LevelBadge({ level }: { level: string | null }) {
  if (!level) return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
      All Levels
    </span>
  );
  const c = LEVEL_COLORS[level] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} inline-block`} />
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

// ── Join CTA Form ──────────────────────────────────────────────────────────────
function JoinForm({ lang, settings = {} }: { lang: string; settings?: Record<string, string> }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Audio Upload & Recording states
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadMode, setUploadMode] = useState<'upload' | 'record' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);
  const isEs = lang === 'es';

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'introduction.webm', { type: 'audio/webm' });
        setAudioFile(file);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error('Mic access denied:', err);
      setError(isEs ? 'No se pudo acceder al micrófono. Por favor, comprueba los permisos.' : 'Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError(isEs ? 'El archivo es demasiado grande (máx 20MB).' : 'File is too large (max 20MB).');
        return;
      }
      setAudioFile(file);
      setAudioPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeAudio = () => {
    setAudioFile(null);
    setAudioPreviewUrl(null);
    setUploadMode(null);
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitting(true);
    setError('');
    try {
      await joinLanguageSession({
        name,
        email,
        language_type: 'both',
        skill_level: level || undefined,
        audio: audioFile,
      });
      await trackLead({
        source: 'language_join',
        name,
        email,
        metadata: {
          skill_level: level,
          from: 'level-tests-page',
          has_audio: !!audioFile,
        },
      });
      setSuccess(true);
    } catch {
      setError(isEs ? 'Error al enviar. Por favor, inténtalo de nuevo.' : 'Failed to send. Please try again.');
    }
    setSubmitting(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-primary mb-2">
          {settings[`langtests_cta_success_title_${lang}`] || (isEs ? '¡Recibido! Nos ponemos en contacto.' : 'Received! We\'ll be in touch.')}
        </h3>
        <p className="text-neutral-gray text-sm">
          {settings[`langtests_cta_success_desc_${lang}`] || (isEs ? 'Gracias por tu interés en nuestras pruebas de nivel.' : 'Thank you for your interest in our level tests.')}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">
            {isEs ? 'Tu nombre' : 'Your name'} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isEs ? 'Nombre completo' : 'Full name'}
            required
            className="input-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">
            {isEs ? 'Correo electrónico' : 'Email address'} *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="input-base"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-1.5">
          {isEs ? 'Tu nivel de idioma' : 'Your language level'}
        </label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="input-base"
        >
          <option value="">{isEs ? 'Seleccionar nivel...' : 'Select level...'}</option>
          <option value="beginner">{isEs ? 'Principiante' : 'Beginner'}</option>
          <option value="intermediate">{isEs ? 'Intermedio' : 'Intermediate'}</option>
          <option value="advanced">{isEs ? 'Avanzado' : 'Advanced'}</option>
        </select>
      </div>

      {/* Audio Introduction Section */}
      <div className="border border-neutral-sand/50 rounded-2xl p-4 bg-gray-50/50">
        <label className="block text-sm font-semibold text-primary mb-2">
          {isEs ? 'Añade tu voz (Opcional)' : 'Add your voice introduction (Optional)'}
        </label>
        <p className="text-xs text-neutral-gray mb-3.5 leading-relaxed">
          {isEs
            ? 'Graba o sube una breve introducción hablando en el idioma que quieres practicar. Te ayudará a conseguir el grupo perfecto.'
            : 'Record or upload a short voice introduction speaking the language you want to practice. It helps us match you to the right group.'}
        </p>

        {/* Action Buttons if nothing is selected yet */}
        {!audioPreviewUrl && !uploadMode && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setUploadMode('record')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-primary/20 bg-white text-primary hover:bg-primary/5 font-semibold text-sm transition-all"
            >
              <span>🎙️</span> {isEs ? 'Grabar voz directamente' : 'Record directly'}
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('upload')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-primary/20 bg-white text-primary hover:bg-primary/5 font-semibold text-sm transition-all"
            >
              <span>📤</span> {isEs ? 'Subir archivo de audio' : 'Upload audio file'}
            </button>
          </div>
        )}

        {/* Record Mode */}
        {uploadMode === 'record' && !audioPreviewUrl && (
          <div className="flex flex-col items-center py-4 bg-white rounded-xl border border-neutral-sand/20 shadow-sm p-4">
            {isRecording ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
                  <span className="text-sm font-semibold text-red-600 tracking-wide font-mono">
                    {isEs ? 'GRABANDO' : 'RECORDING'} ({formatTime(recordingTime)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full text-sm flex items-center gap-2 transition-all shadow-md"
                >
                  ⏹️ {isEs ? 'Parar grabación' : 'Stop Recording'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-neutral-gray">{isEs ? 'Pulsa el botón para iniciar tu micrófono' : 'Click the button to start your microphone'}</p>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={startRecording}
                    className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-6 rounded-xl text-sm flex items-center gap-2 transition-all shadow-md"
                  >
                    🎙️ {isEs ? 'Iniciar Grabación' : 'Start Recording'}
                  </button>
                  <button
                    type="button"
                    onClick={removeAudio}
                    className="border border-gray-200 text-neutral-gray font-bold py-3 px-4 rounded-xl text-sm hover:bg-gray-50 transition-all"
                  >
                    {isEs ? 'Atrás' : 'Back'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Mode */}
        {uploadMode === 'upload' && !audioPreviewUrl && (
          <div className="flex flex-col items-center py-4 bg-white rounded-xl border border-neutral-sand/20 shadow-sm p-4">
            <p className="text-xs text-neutral-gray mb-3">{isEs ? 'Selecciona un archivo MP3, WAV, M4A o OGG' : 'Select an MP3, WAV, M4A, or OGG file'}</p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-6 rounded-xl text-sm flex items-center gap-2 transition-all shadow-md"
              >
                📁 {isEs ? 'Seleccionar archivo' : 'Select File'}
              </button>
              <button
                type="button"
                onClick={removeAudio}
                className="border border-gray-200 text-neutral-gray font-bold py-3 px-4 rounded-xl text-sm hover:bg-gray-50 transition-all"
              >
                {isEs ? 'Atrás' : 'Back'}
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/ogg,audio/webm,.mp3,.wav,.m4a,.ogg"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Selected Audio Preview */}
        {audioPreviewUrl && (
          <div className="bg-white rounded-xl border border-neutral-sand/20 shadow-sm p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎵</span>
                <div>
                  <p className="text-xs font-semibold text-primary">{isEs ? 'Introducción preparada' : 'Introduction ready'}</p>
                  <p className="text-[10px] text-neutral-gray truncate max-w-[200px]">
                    {audioFile?.name || 'audio-sample.webm'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeAudio}
                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
              >
                ❌ {isEs ? 'Eliminar' : 'Remove'}
              </button>
            </div>
            <audio controls src={audioPreviewUrl} className="w-full" style={{ height: 40 }} />
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary w-full shadow-md">
        {submitting
          ? (isEs ? 'Enviando...' : 'Sending...')
          : (settings[`langtests_cta_submit_${lang}`] || (isEs ? 'Quiero hacer mi prueba de nivel' : 'I want to take a level test'))
        }
      </button>
    </form>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LanguageTestsPage() {
  useScrollToTop();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('es') ? 'es' : 'en';
  const isEs = lang === 'es';

  const [settings, setSettings] = useState<Record<string, string>>({});

  const heroRef = useScrollReveal(0.05);
  const ctaRef = useScrollReveal(0.15);

  useEffect(() => {
    fetchSettings('general')
      .then(res => {
        setSettings(res || {});
      })
      .catch(() => {});
  }, []);

  const heroStyle = useSectionStyle('hero', 'langtest');
  const infoStyle = useSectionStyle('info', 'langtest');
  const cardsStyle = useSectionStyle('cards', 'langtest');
  const ctaStyle = useSectionStyle('cta', 'langtest');

  return (
    <div className="bg-bg-main min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary py-24 sm:py-32" style={heroStyle}>
        {/* Decorative blobs */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary-light/20 blur-3xl" />
          {/* Floating language emojis */}
          {(settings.langtests_hero_emojis ? settings.langtests_hero_emojis.split(',') : ['🇪🇸', '🇬🇧', '🗣️', '🎧', '📖', '✍️']).map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-3xl opacity-20 select-none"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 30}%`,
              }}
              animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>

        <div className="container-max px-4 sm:px-6 lg:px-8 relative z-10" ref={heroRef.ref}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroRef.isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {isEs ? 'SpeakEasy Valencia' : 'SpeakEasy Valencia'}
            </div>

            {/* Main heading — bilingual stacked */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3">
              {settings[`langtests_hero_title_${lang}`] || (isEs ? 'Pruebas de Nivel' : 'Language Level Tests')}
            </h1>
            <p className="text-accent font-script text-3xl sm:text-4xl mb-6">
              {settings[`langtests_hero_subtitle_${lang}`] || (isEs ? 'Language Level Tests' : 'Pruebas de Nivel')}
            </p>

            <p className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10 whitespace-pre-line">
              {settings[`langtests_hero_desc_${lang}`] || (isEs
                ? 'Descubre tu nivel de español o inglés con nuestras pruebas diseñadas para encontrarte donde estás y llevarte más lejos.'
                : 'Discover your Spanish or English level with our carefully designed tests — we meet you where you are and take you further.'
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#tests" className="btn-primary">
                {settings[`langtests_hero_primary_cta_${lang}`] || (isEs ? 'Ver las pruebas' : 'Explore the Tests')}
              </a>
              <Link
                to="/booking"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold font-modern
                           bg-transparent text-white border-2 border-white/40
                           hover:bg-white hover:text-primary
                           transition-all duration-300 hover:scale-105 active:scale-95 shadow-soft"
              >
                {settings[`langtests_hero_secondary_cta_${lang}`] || (isEs ? 'Reservar una experiencia' : 'Book an Experience')}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-10 sm:h-16" fill="none" preserveAspectRatio="none">
            <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z" fill="var(--color-bg-main)" />
          </svg>
        </div>
      </section>

      {/* ── Info strip ────────────────────────────────────────────── */}
      <section className="py-10 border-b border-neutral-sand/40" style={infoStyle}>
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

      {/* ── Level Tests Section (20-30 Questions Real Tests) ────────── */}
      <section id="tests" className="py-14 px-4 sm:px-6 lg:px-8 bg-neutral-cream/20" style={cardsStyle}>
        <div className="container-max mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <LevelTestCard lang="es" settings={settings} />
            <LevelTestCard lang="en" settings={settings} />
          </div>
        </div>
      </section>

      {/* ── CTA / Sign Up ─────────────────────────────────────────── */}
      <section className="section-padding" ref={ctaRef.ref} style={ctaStyle}>
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={ctaRef.isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl shadow-elevated border border-neutral-sand/40 overflow-hidden"
          >
            {/* Card header */}
            <div className="bg-gradient-to-r from-primary to-primary-light px-8 py-8 text-center">
              <span className="text-5xl mb-4 block">{settings.langtests_cta_icon || '🎓'}</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {settings[`langtests_cta_title_${lang}`] || (isEs ? '¿Quieres descubrir tu nivel?' : 'Want to discover your level?')}
              </h2>
              <p className="text-white/75 text-sm">
                {settings[`langtests_cta_subtitle_${lang}`] || (isEs
                  ? 'Déjanos tus datos y te ayudamos a encontrar el programa perfecto para ti.'
                  : 'Leave your details and we\'ll help find the perfect programme for you.'
                )}
              </p>
            </div>
            {/* Form */}
            <div className="p-8">
              <JoinForm lang={lang} settings={settings} />
            </div>
          </motion.div>
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
