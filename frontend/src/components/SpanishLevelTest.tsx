import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import SectionWrapper from './SectionWrapper';

type QuizState = 'intro' | 'quiz' | 'result';

interface Question {
  q: string;
  options: string[];
  answer: number;
}

interface LevelTestCardProps {
  lang: 'es' | 'en';
}

function LevelTestCard({ lang }: LevelTestCardProps) {
  const { t } = useTranslation();
  const isSpanish = lang === 'es';
  const i18nKeyPrefix = isSpanish ? 'spanishTest' : 'englishTest';
  
  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const questions = t(`${i18nKeyPrefix}.questions`, { returnObjects: true }) as Question[];
  const totalQuestions = questions ? questions.length : 0;

  const handleStart = () => {
    setQuizState('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestionIndex].answer;
    if (isCorrect) {
      setScore((prev) => prev + (isSpanish ? 3 : 1));
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizState('result');
    }
  };

  const getRecommendation = () => {
    if (isSpanish) {
      if (score <= 30) return 'beginner';
      if (score <= 42) return 'intermediate';
      return 'advanced';
    } else {
      if (score <= 5) return 'a1';
      if (score <= 10) return 'a2';
      if (score <= 15) return 'b1';
      if (score <= 20) return 'b2';
      if (score <= 25) return 'c1';
      return 'c2';
    }
  };

  if (!questions) return null;

  return (
    <div className="w-full min-h-[400px] flex items-stretch">
      <AnimatePresence mode="wait">
        {/* INTRO STATE */}
        {quizState === 'intro' && (
          <motion.div
            key={`${lang}-intro`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center bg-white p-8 sm:p-12 rounded-[2rem] shadow-elevated w-full border border-primary/10 flex flex-col justify-between h-full"
          >
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">{isSpanish ? '🇪🇸' : '🇬🇧'}</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-dark mb-4">
                {t(`${i18nKeyPrefix}.title`)}
              </h2>
              <p className="text-neutral-gray text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                {t(`${i18nKeyPrefix}.subtitle`)}
              </p>
            </div>
            <div>
              <button
                onClick={handleStart}
                className="bg-primary hover:bg-primary-hover text-white font-heading font-semibold text-lg px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                {t(`${i18nKeyPrefix}.startBtn`)}
              </button>
            </div>
          </motion.div>
        )}

        {/* QUIZ STATE */}
        {quizState === 'quiz' && (
          <motion.div
            key={`${lang}-quiz`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full bg-white p-8 sm:p-12 rounded-[2rem] shadow-elevated border border-primary/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-8 text-sm font-heading font-semibold text-neutral-gray gap-4">
                <span className="whitespace-nowrap">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                <div className="w-1/2 bg-neutral-cream rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-body font-bold text-neutral-dark mb-8">
                {questions[currentQuestionIndex].q}
              </h3>

              <div className="space-y-3 mb-8">
                {questions[currentQuestionIndex].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-body text-lg ${
                      selectedAnswer === idx
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-neutral-cream hover:border-primary/30 hover:bg-neutral-cream/50 text-neutral-dark'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className={`font-heading font-semibold text-lg px-8 py-3 rounded-xl transition-all ${
                  selectedAnswer !== null
                    ? 'bg-primary hover:bg-primary-hover text-white shadow-md hover:scale-105 active:scale-95'
                    : 'bg-neutral-cream text-neutral-gray cursor-not-allowed'
                }`}
              >
                {currentQuestionIndex === totalQuestions - 1 
                  ? t(`${i18nKeyPrefix}.resultsBtn`) 
                  : t(`${i18nKeyPrefix}.nextBtn`)}
              </button>
            </div>
          </motion.div>
        )}

        {/* RESULT STATE */}
        {quizState === 'result' && (
          <motion.div
            key={`${lang}-result`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full bg-white p-8 sm:p-12 rounded-[2rem] shadow-elevated border border-primary/10 text-center flex flex-col justify-between"
          >
            <div>
              <div className="mb-6">
                <p className="text-neutral-gray font-heading font-semibold uppercase tracking-wider mb-2">
                  {t(`${i18nKeyPrefix}.resultsTitle`)}
                </p>
                <div className="inline-block bg-primary/10 text-primary text-4xl font-display font-bold px-6 py-4 rounded-2xl">
                  {score} <span className="text-xl text-primary/70">{t(`${i18nKeyPrefix}.outOf`)}</span>
                </div>
              </div>

              <div className="bg-neutral-cream/50 rounded-2xl p-6 sm:p-8 mb-8">
                <p className="text-sm font-heading font-semibold text-neutral-gray uppercase tracking-wider mb-3">
                  {t(`${i18nKeyPrefix}.recommendationTitle`)}
                </p>
                <h4 className="text-2xl font-display font-bold text-primary mb-3">
                  {isSpanish 
                    ? t(`spanishTest.levels.${getRecommendation()}.title`)
                    : `Your estimated level is ${t(`englishTest.levels.${getRecommendation()}.title`)}.`}
                </h4>
                <p className="text-neutral-dark font-body text-base leading-relaxed">
                  {t(`${i18nKeyPrefix}.levels.${getRecommendation()}.description`)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleStart}
                className="px-6 py-3 rounded-xl font-heading font-semibold text-neutral-dark hover:bg-neutral-cream transition-colors"
              >
                {t(`${i18nKeyPrefix}.retakeBtn`)}
              </button>
              <Link
                to={isSpanish ? "/experience" : "/contact?subject=Free%20speaking%20assessment"}
                className="bg-primary hover:bg-primary-hover text-white font-heading font-semibold px-8 py-3 rounded-xl shadow-md transition-transform hover:scale-105"
              >
                {t(`${i18nKeyPrefix}.bookBtn`)}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SpanishLevelTest() {
  return (
    <SectionWrapper className="bg-neutral-cream/50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <LevelTestCard lang="es" />
        <LevelTestCard lang="en" />
      </div>
    </SectionWrapper>
  );
}
