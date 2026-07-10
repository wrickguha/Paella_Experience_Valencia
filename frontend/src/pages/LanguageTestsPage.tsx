import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useScrollToTop, useScrollReveal } from '@/hooks/useScrollReveal';
import { fetchLevelTests, joinLanguageSession, trackLead, type LevelTestItem } from '@/services/api';

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

// ── Custom Audio Player ───────────────────────────────────────────────────────
function AudioPlayer({ src, title }: { src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setCurrentTime(audio.currentTime);
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => setPlaying(false);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || !audioRef.current || !audioRef.current.duration) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * audioRef.current.duration;
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className="mt-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-4 border border-primary/10">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      <div className="flex items-center gap-3">
        {/* Play button */}
        <button
          onClick={toggle}
          className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0 hover:bg-primary-light transition-colors shadow-md hover:shadow-lg active:scale-95 transition-all"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Waveform bar */}
        <div className="flex-1 flex flex-col gap-1.5">
          <p className="text-xs font-medium text-primary/70 truncate">🎧 {title}</p>
          <div
            ref={barRef}
            onClick={handleBarClick}
            className="relative h-2 bg-primary/15 rounded-full cursor-pointer overflow-hidden"
          >
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
            {/* Animated waveform dots when playing */}
            {playing && (
              <div className="absolute inset-0 flex items-center justify-center gap-0.5 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 rounded-full bg-white/60"
                    animate={{ height: ['4px', '8px', '4px'] }}
                    transition={{ duration: 0.8, delay: i * 0.07, repeat: Infinity }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between text-[10px] text-primary/50 font-mono">
            <span>{fmt(currentTime)}</span>
            <span>{duration > 0 ? fmt(duration) : '--:--'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Quiz Data ─────────────────────────────────────────────────────────────────
const SPANISH_QUIZ = [
  {
    q: 'Complete: "Yo ___ al mercado todos los días."',
    options: ['voy', 'vaya', 'fui', 'iba'],
    correct: 0,
  },
  {
    q: '¿Cuál es el plural de "el lápiz"?',
    options: ['los lápizes', 'los lápices', 'los lápizs', 'los lápices'],
    correct: 1,
  },
  {
    q: 'Select the correct subjunctive: "Espero que ella ___ aquí."',
    options: ['está', 'estará', 'esté', 'estaría'],
    correct: 2,
  },
  {
    q: '¿Qué significa "soler + infinitivo"?',
    options: ['to be able to', 'to tend to / usually do', 'to want to', 'to have to'],
    correct: 1,
  },
  {
    q: 'Fill in: "Si ___ más tiempo, estudiaría más."',
    options: ['tuviera', 'tiene', 'tuvo', 'tenía'],
    correct: 0,
  },
];

const ENGLISH_QUIZ = [
  {
    q: 'Choose the correct form: "She ___ to work every day."',
    options: ['walk', 'walks', 'walking', 'walked'],
    correct: 1,
  },
  {
    q: 'Which sentence is in the Present Perfect?',
    options: [
      'She was cooking dinner.',
      'She has cooked dinner.',
      'She cooked dinner.',
      'She cooks dinner.',
    ],
    correct: 1,
  },
  {
    q: '"Despite ___ tired, he continued working." Complete correctly.',
    options: ['to be', 'be', 'being', 'been'],
    correct: 2,
  },
  {
    q: 'Choose the correct conditional: "If I ___ rich, I would travel."',
    options: ['am', 'were', 'will be', 'have been'],
    correct: 1,
  },
  {
    q: 'Which word is a synonym for "ubiquitous"?',
    options: ['rare', 'omnipresent', 'ancient', 'fragile'],
    correct: 1,
  },
];

const LEVEL_THRESHOLDS = [
  { min: 0, max: 1, label: 'Beginner', es: 'Principiante', color: 'from-emerald-400 to-emerald-600', emoji: '🌱' },
  { min: 2, max: 3, label: 'Intermediate', es: 'Intermedio', color: 'from-amber-400 to-amber-600', emoji: '🌿' },
  { min: 4, max: 5, label: 'Advanced', es: 'Avanzado', color: 'from-primary to-accent', emoji: '🌟' },
];

function getLevel(score: number) {
  return LEVEL_THRESHOLDS.find((t) => score >= t.min && score <= t.max) || LEVEL_THRESHOLDS[0];
}

// ── Quiz Modal ─────────────────────────────────────────────────────────────────
function QuizModal({
  open,
  onClose,
  language,
  isEs,
}: {
  open: boolean;
  onClose: () => void;
  language: 'spanish' | 'english';
  isEs: boolean;
}) {
  const questions = language === 'spanish' ? SPANISH_QUIZ : ENGLISH_QUIZ;
  const [step, setStep] = useState(0); // 0 = start, 1..N = question, N+1 = result
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const current = questions[step - 1];
  const isStart = step === 0;
  const isResult = step === questions.length + 1;
  const score = answers.filter((a, i) => a === questions[i]?.correct).length;
  const level = getLevel(score);

  const reset = () => {
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setRevealed(false);
  };

  const handleStart = () => setStep(1);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);
    setRevealed(false);
    if (step === questions.length) {
      setStep(questions.length + 1);
    } else {
      setStep(step + 1);
    }
  };

  const handleClose = () => { reset(); onClose(); };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${language === 'spanish' ? 'from-[#c60b1e] to-[#f1bf00]' : 'from-primary to-accent'} px-6 py-5 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language === 'spanish' ? '🇪🇸' : '🇬🇧'}</span>
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-widest font-semibold">
                    {isEs ? 'Prueba de nivel' : 'Level Test'}
                  </p>
                  <h3 className="text-white font-bold text-lg leading-tight">
                    {language === 'spanish'
                      ? (isEs ? 'Test de Español' : 'Spanish Level Test')
                      : (isEs ? 'Test de Inglés' : 'English Level Test')
                    }
                  </h3>
                </div>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Progress bar */}
            {!isStart && !isResult && (
              <div className="h-1.5 bg-gray-100">
                <motion.div
                  className={`h-full bg-gradient-to-r ${language === 'spanish' ? 'from-[#c60b1e] to-[#f1bf00]' : 'from-primary to-accent'}`}
                  initial={false}
                  animate={{ width: `${((step) / questions.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}

            <div className="p-6">
              {/* START SCREEN */}
              {isStart && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <span className="text-4xl">{language === 'spanish' ? '🇪🇸' : '🇬🇧'}</span>
                  </div>
                  <h4 className="text-xl font-bold text-primary mb-2">
                    {language === 'spanish'
                      ? (isEs ? 'Test de Español (5 preguntas)' : 'Spanish Test (5 questions)')
                      : (isEs ? 'Test de Inglés (5 preguntas)' : 'English Test (5 questions)')
                    }
                  </h4>
                  <p className="text-neutral-gray text-sm mb-6">
                    {isEs
                      ? 'Responde 5 preguntas para descubrir tu nivel de idioma. ¡Tómate tu tiempo!'
                      : 'Answer 5 questions to discover your language level. Take your time!'
                    }
                  </p>
                  <button
                    onClick={handleStart}
                    className="btn-primary w-full"
                  >
                    {isEs ? 'Empezar el test ✨' : 'Start Quiz ✨'}
                  </button>
                </div>
              )}

              {/* QUESTION */}
              {!isStart && !isResult && current && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-primary/50 uppercase tracking-widest">
                      {isEs ? `Pregunta ${step} de ${questions.length}` : `Question ${step} of ${questions.length}`}
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="text-primary font-semibold text-base mb-5 leading-relaxed">{current.q}</p>

                      <div className="space-y-3 mb-6">
                        {current.options.map((option, idx) => {
                          let cls = 'w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ';
                          if (!revealed) {
                            cls += selected === idx
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-200 hover:border-primary/40 hover:bg-primary/5 text-neutral-gray cursor-pointer';
                          } else {
                            if (idx === current.correct) cls += 'border-emerald-500 bg-emerald-50 text-emerald-700';
                            else if (idx === selected) cls += 'border-red-400 bg-red-50 text-red-600';
                            else cls += 'border-gray-100 text-gray-400';
                          }
                          return (
                            <motion.button
                              key={idx}
                              className={cls}
                              onClick={() => handleSelect(idx)}
                              whileTap={!revealed ? { scale: 0.98 } : {}}
                            >
                              <span className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ${
                                  revealed && idx === current.correct ? 'border-emerald-500 bg-emerald-500 text-white' :
                                  revealed && idx === selected ? 'border-red-400 bg-red-400 text-white' :
                                  'border-current'
                                }`}>
                                  {revealed && idx === current.correct ? '✓' :
                                   revealed && idx === selected ? '✗' :
                                   String.fromCharCode(65 + idx)}
                                </span>
                                {option}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>

                      {revealed && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-xl text-sm font-medium mb-4 ${
                            selected === current.correct
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {selected === current.correct
                            ? (isEs ? '¡Correcto! 🎉' : 'Correct! 🎉')
                            : (isEs ? `Incorrecto. La respuesta es: "${current.options[current.correct]}"` : `Incorrect. The correct answer is: "${current.options[current.correct]}"`)
                          }
                        </motion.div>
                      )}

                      <button
                        onClick={handleNext}
                        disabled={!revealed}
                        className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {step === questions.length
                          ? (isEs ? 'Ver mi resultado →' : 'See my result →')
                          : (isEs ? 'Siguiente pregunta →' : 'Next question →')
                        }
                      </button>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {/* RESULT */}
              {isResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-2"
                >
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                    <span className="text-5xl">{level.emoji}</span>
                  </div>

                  <p className="text-neutral-gray text-sm mb-1">
                    {isEs ? 'Tu puntuación:' : 'Your score:'}
                  </p>
                  <p className="text-4xl font-black text-primary mb-1">
                    {score}/{questions.length}
                  </p>

                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${level.color} text-white font-bold text-sm mb-4`}>
                    {isEs ? level.es : level.label}
                  </div>

                  <p className="text-neutral-gray text-sm mb-6 leading-relaxed">
                    {isEs
                      ? score >= 4
                        ? '¡Excelente! Tu nivel es avanzado. Nuestras sesiones avanzadas son perfectas para ti.'
                        : score >= 2
                          ? 'Buen trabajo. Nivel intermedio — mejora con nosotros.'
                          : 'Nivel principiante — ¡no te preocupes! Empezaremos desde el principio.'
                      : score >= 4
                        ? 'Excellent! You\'re at an advanced level. Our advanced sessions are perfect for you.'
                        : score >= 2
                          ? 'Good work! Intermediate level — improve with us.'
                          : 'Beginner level — don\'t worry! We\'ll start from the beginning together.'
                    }
                  </p>

                  <div className="flex gap-3">
                    <button onClick={reset} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-neutral-gray text-sm font-semibold hover:border-primary hover:text-primary transition-colors">
                      {isEs ? 'Repetir test' : 'Retake Quiz'}
                    </button>
                    <a href="#join" onClick={handleClose} className="flex-1 btn-primary text-center text-sm !py-3">
                      {isEs ? 'Reservar sesión' : 'Book a Session'}
                    </a>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Quiz Section (the two cards) ──────────────────────────────────────────────
function QuizSection({ isEs }: { isEs: boolean }) {
  const [activeQuiz, setActiveQuiz] = useState<'spanish' | 'english' | null>(null);

  return (
    <>
      <section className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="container-max mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Spanish card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl shadow-card border border-neutral-sand/30 p-8 flex flex-col items-center text-center hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              {/* Flag badge */}
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5 text-3xl shadow-inner">
                🇪🇸
              </div>
              <p className="text-xs font-black tracking-[0.25em] text-red-500 uppercase mb-2">ES</p>
              <h3 className="text-2xl font-bold text-primary mb-3 leading-tight">
                {isEs ? 'Prueba tu nivel de Español' : 'Test Your Spanish Level'}
              </h3>
              <p className="text-neutral-gray text-sm leading-relaxed mb-7">
                {isEs
                  ? 'Realiza nuestro test de 5 preguntas para saber qué experiencia es perfecta para ti.'
                  : 'Take our quick 5-question quiz to find out which experience is best for you.'
                }
              </p>
              <button
                onClick={() => setActiveQuiz('spanish')}
                className="w-full bg-primary text-white font-bold py-3.5 px-6 rounded-xl hover:bg-primary-light transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg text-sm"
              >
                {isEs ? 'Empezar el test ✨' : 'Start Quiz ✨'}
              </button>
            </motion.div>

            {/* English card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="bg-white rounded-3xl shadow-card border border-neutral-sand/30 p-8 flex flex-col items-center text-center hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              {/* Flag badge */}
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-5 text-3xl shadow-inner">
                🇬🇧
              </div>
              <p className="text-xs font-black tracking-[0.25em] text-blue-600 uppercase mb-2">EN</p>
              <h3 className="text-2xl font-bold text-primary mb-3 leading-tight">
                {isEs ? 'Prueba tu nivel de Inglés' : 'Test Your English Level'}
              </h3>
              <p className="text-neutral-gray text-sm leading-relaxed mb-7">
                {isEs
                  ? 'Descubre tu nivel de inglés en 5 minutos con nuestra evaluación enfocada en la comunicación.'
                  : 'Find out your English level in 5 minutes with our speaking-focused assessment.'
                }
              </p>
              <button
                onClick={() => setActiveQuiz('english')}
                className="w-full bg-primary text-white font-bold py-3.5 px-6 rounded-xl hover:bg-primary-light transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg text-sm"
              >
                {isEs ? 'Empezar el test ✨' : 'Start Quiz ✨'}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <QuizModal
        open={activeQuiz !== null}
        onClose={() => setActiveQuiz(null)}
        language={activeQuiz || 'spanish'}
        isEs={isEs}
      />
    </>
  );
}

// ── Test Card ─────────────────────────────────────────────────────────────────
function TestCard({ test, index, lang }: { test: LevelTestItem; index: number; lang: string }) {
  const { ref, isInView } = useScrollReveal(0.15);

  // Show bilingual title
  const titlePrimary = lang === 'es' ? test.title_es : test.title_en;
  const titleSecondary = lang === 'es' ? test.title_en : test.title_es;

  const langLabels: Record<string, { en: string; es: string }> = {
    spanish:     { en: '🇪🇸 Spanish', es: '🇪🇸 Español' },
    english:     { en: '🇬🇧 English', es: '🇬🇧 Inglés' },
    both:        { en: '🌐 Bilingual', es: '🌐 Bilingüe' },
  };
  const langLabel = langLabels[test.language_type]?.[lang === 'es' ? 'es' : 'en'] || test.language_type;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl shadow-card border border-neutral-sand/30 overflow-hidden group hover:-translate-y-1 hover:shadow-elevated transition-all duration-300"
    >
      {/* Card header strip */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary-light" />

      <div className="p-6">
        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <LevelBadge level={test.skill_level} />
          <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-gray bg-gray-50 px-2.5 py-1 rounded-full">
            {langLabel}
          </span>
        </div>

        {/* Title bilingual */}
        <h3 className="text-xl font-bold text-primary leading-snug mb-1 group-hover:text-accent transition-colors">
          {titlePrimary}
        </h3>
        {titleSecondary && titleSecondary !== titlePrimary && (
          <p className="text-sm text-neutral-gray italic mb-3">{titleSecondary}</p>
        )}

        {/* Description */}
        {test.description && (
          <p className="text-neutral-gray text-sm leading-relaxed mt-3">
            {test.description}
          </p>
        )}

        {/* Audio player */}
        {test.audio_url && (
          <AudioPlayer
            src={test.audio_url}
            title={lang === 'es' ? 'Introducción de audio' : 'Audio introduction'}
          />
        )}

        {!test.audio_url && (
          <div className="mt-4 flex items-center gap-2 text-xs text-neutral-gray/60">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
            {lang === 'es' ? 'Sin audio introducción' : 'No audio introduction'}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Join CTA Form ──────────────────────────────────────────────────────────────
function JoinForm({ lang }: { lang: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isEs = lang === 'es';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitting(true);
    setError('');
    try {
      await joinLanguageSession({ name, email, language_type: 'both', skill_level: level || undefined });
      await trackLead({ source: 'language_join', name, email, metadata: { skill_level: level, from: 'level-tests-page' } });
      setSuccess(true);
    } catch {
      setError(isEs ? 'Error al enviar. Por favor, inténtalo de nuevo.' : 'Failed to send. Please try again.');
    }
    setSubmitting(false);
  };

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
          {isEs ? '¡Recibido! Nos ponemos en contacto.' : 'Received! We\'ll be in touch.'}
        </h3>
        <p className="text-neutral-gray text-sm">
          {isEs ? 'Gracias por tu interés en nuestras pruebas de nivel.' : 'Thank you for your interest in our level tests.'}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting
          ? (isEs ? 'Enviando...' : 'Sending...')
          : (isEs ? 'Quiero hacer mi prueba de nivel' : 'I want to take a level test')
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

  const [tests, setTests] = useState<LevelTestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useScrollReveal(0.05);
  const sectionRef = useScrollReveal(0.1);
  const ctaRef = useScrollReveal(0.15);

  useEffect(() => {
    fetchLevelTests(lang)
      .then(setTests)
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  }, [lang]);

  return (
    <div className="bg-bg-main min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary py-24 sm:py-32">
        {/* Decorative blobs */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary-light/20 blur-3xl" />
          {/* Floating language emojis */}
          {['🇪🇸', '🇬🇧', '🗣️', '🎧', '📖', '✍️'].map((emoji, i) => (
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
              {isEs ? 'Pruebas de Nivel' : 'Language Level Tests'}
            </h1>
            <p className="text-accent font-script text-3xl sm:text-4xl mb-6">
              {isEs ? 'Language Level Tests' : 'Pruebas de Nivel'}
            </p>

            <p className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
              {isEs
                ? 'Descubre tu nivel de español o inglés con nuestras pruebas diseñadas para encontrarte donde estás y llevarte más lejos.'
                : 'Discover your Spanish or English level with our carefully designed tests — we meet you where you are and take you further.'
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#tests" className="btn-primary">
                {isEs ? 'Ver las pruebas' : 'Explore the Tests'}
              </a>
              <Link
                to="/booking"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold font-modern
                           bg-transparent text-white border-2 border-white/40
                           hover:bg-white hover:text-primary
                           transition-all duration-300 hover:scale-105 active:scale-95 shadow-soft"
              >
                {isEs ? 'Reservar una experiencia' : 'Book an Experience'}
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
      <section className="py-10 border-b border-neutral-sand/40">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🎧', label: isEs ? 'Introducción en audio' : 'Audio Introduction' },
              { icon: '📊', label: isEs ? 'Por nivel de habilidad' : 'By Skill Level' },
              { icon: '🌐', label: isEs ? 'Español & Inglés' : 'Spanish & English' },
              { icon: '🆓', label: isEs ? 'Totalmente gratuito' : 'Completely Free' },
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

      {/* ── Quiz Cards ──────────────────────────────────────────────── */}
      <QuizSection isEs={isEs} />

      {/* ── Tests Grid ────────────────────────────────────────────── */}
      <section id="tests" className="section-padding" ref={sectionRef.ref}>
        <div className="container-max px-4 sm:px-6 lg:px-8">
          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={sectionRef.isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-accent font-script text-2xl">
              {isEs ? 'Explora' : 'Explore'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mt-1 mb-4">
              {isEs ? 'Nuestras Pruebas de Nivel' : 'Our Level Tests'}
            </h2>
            <p className="text-neutral-gray max-w-xl mx-auto text-base">
              {isEs
                ? 'Cada prueba incluye una introducción en audio. Escucha, evalúa tu comprensión, y descubre en qué nivel estás.'
                : 'Each test includes an audio introduction. Listen, assess your comprehension, and find out which level you are at.'
              }
            </p>
          </motion.div>

          {/* Cards */}
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-accent"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          ) : tests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">
                {isEs ? 'Pruebas próximamente' : 'Tests Coming Soon'}
              </h3>
              <p className="text-neutral-gray max-w-sm mx-auto">
                {isEs
                  ? 'Estamos preparando nuestras pruebas de nivel. ¡Regresa pronto o déjanos tus datos!'
                  : 'We\'re preparing our level tests. Check back soon or leave your details below!'
                }
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test, i) => (
                <TestCard key={test.id} test={test} index={i} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How it works strip ────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5 border-y border-primary/10">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">
              {isEs ? '¿Cómo funcionan las pruebas?' : 'How Do the Tests Work?'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              {
                num: '01',
                icon: '🎧',
                title: isEs ? 'Escucha el audio' : 'Listen to audio',
                desc: isEs
                  ? 'Cada prueba tiene una introducción de audio para evaluar tu comprensión auditiva.'
                  : 'Each test has an audio introduction to evaluate your listening comprehension.',
              },
              {
                num: '02',
                icon: '📝',
                title: isEs ? 'Evalúa tu nivel' : 'Assess your level',
                desc: isEs
                  ? 'Lee la descripción de cada prueba y determina cuál describe mejor tus habilidades actuales.'
                  : 'Read each test description and determine which best describes your current abilities.',
              },
              {
                num: '03',
                icon: '🚀',
                title: isEs ? 'Únete a nosotros' : 'Join us',
                desc: isEs
                  ? 'Regístrate y te conectamos con la sesión de idiomas perfecta para tu nivel.'
                  : 'Register and we\'ll match you with the perfect language session for your level.',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-bold text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-gray leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / Sign Up ─────────────────────────────────────────── */}
      <section className="section-padding" ref={ctaRef.ref}>
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={ctaRef.isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl shadow-elevated border border-neutral-sand/40 overflow-hidden"
          >
            {/* Card header */}
            <div className="bg-gradient-to-r from-primary to-primary-light px-8 py-8 text-center">
              <span className="text-5xl mb-4 block">🎓</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {isEs ? '¿Quieres descubrir tu nivel?' : 'Want to discover your level?'}
              </h2>
              <p className="text-white/75 text-sm">
                {isEs
                  ? 'Déjanos tus datos y te ayudamos a encontrar el programa perfecto para ti.'
                  : 'Leave your details and we\'ll help find the perfect programme for you.'
                }
              </p>
            </div>
            {/* Form */}
            <div className="p-8">
              <JoinForm lang={lang} />
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
            <Link to="/contact" className="btn-secondary !border-white/30 !text-white hover:!bg-white/10 hover:!text-white">
              {isEs ? 'Contáctanos' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
