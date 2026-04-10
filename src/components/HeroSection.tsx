import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=1600&q=80"
          alt="Paella cooking"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-block bg-primary/90 text-white text-sm font-heading font-semibold
                       px-4 py-2 rounded-full mb-6"
          >
            ⭐ 4.9/5 — 2,400+ Reviews
          </motion.span>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
            {t('hero.title')}
          </h1>

          <p className="text-lg sm:text-xl text-white/90 font-body mb-10 max-w-2xl leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/booking" className="btn-primary !text-lg !px-10 !py-5 text-center">
              {t('hero.cta')}
            </Link>
            <Link
              to="/experience"
              className="btn-secondary !border-white !text-white hover:!bg-white hover:!text-neutral-dark
                         !text-lg !px-10 !py-5 text-center"
            >
              {t('hero.scrollDown')}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/80 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
