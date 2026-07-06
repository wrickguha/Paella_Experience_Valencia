import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollToTop } from '@/hooks/useScrollReveal';
import { fetchTestimonials, fetchSettings, type Testimonial } from '@/services/api';

// Utility helper to resolve YouTube URLs or local paths
function getYouTubeEmbedUrl(urlOrId: string) {
  if (!urlOrId) return '';
  if (urlOrId.includes('youtube.com/embed/')) return urlOrId;
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = urlOrId.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  } else {
    const shortsRegExp = /youtube\.com\/shorts\/([^#\&\?]*)/;
    const shortsMatch = urlOrId.match(shortsRegExp);
    if (shortsMatch && shortsMatch[1].length === 11) {
      videoId = shortsMatch[1];
    } else if (urlOrId.length === 11) {
      videoId = urlOrId;
    }
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : urlOrId;
}

// Lazy Loaded video component with premium gold borders and hover controls
function PremiumLazyVideo({ src, index }: { src: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be') || src.length === 11;
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(src) : src;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.7, cubicBezier: [0.16, 1, 0.3, 1] }}
      className="group relative aspect-[9/16] overflow-hidden rounded-[2rem] border border-accent/20 bg-primary-dark/40 shadow-card transition-all duration-500 hover:-translate-y-2 hover:border-accent/60 hover:shadow-elevated"
    >
      {/* Background glow hover effect */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

      {inView ? (
        isYouTube ? (
          <iframe
            src={isPlaying ? `${embedUrl}&autoplay=1` : embedUrl}
            title={`Guest story ${index + 1}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ border: 0 }}
          />
        ) : (
          <video
            src={src}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-primary-dark/80">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
        </div>
      )}

      {/* Floating details / play action over YouTube video before playing */}
      {isYouTube && !isPlaying && (
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-6">
          <div className="flex justify-end">
            <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent backdrop-blur-md border border-accent/30">
              Video Review
            </span>
          </div>
          <div className="flex flex-col items-center justify-center flex-1">
            <button
              onClick={() => setIsPlaying(true)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-soft transition-all duration-300 hover:scale-110 hover:bg-accent-alt active:scale-95 group-hover:shadow-card"
            >
              <svg className="ml-1 h-8 w-8 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <p className="mt-4 text-sm font-semibold tracking-wider text-white/90 drop-shadow-md">
              PLAY STORY
            </p>
          </div>
          <div className="text-center">
            <p className="font-script text-2xl text-accent">SpeakEasy Valencia</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Simulated Confetti Particle for Success State
function ConfettiParticle({ delay, x, color }: { delay: number; x: string; color: string }) {
  return (
    <div
      className="absolute top-0 w-3 h-3 rounded-sm opacity-85"
      style={{
        left: x,
        backgroundColor: color,
        animation: `confetti-drift 3.5s ${delay}s linear infinite`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  );
}

export default function TestimonialsPage() {
  const { t, i18n } = useTranslation();
  useScrollToTop();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'food' | 'languages' | 'hosts'>('all');

  // Video reels state
  const [videoList, setVideoList] = useState<string[]>([]);

  // Review Form States
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formReview, setFormReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Load Testimonials & Video URLs
  useEffect(() => {
    setLoading(true);
    fetchTestimonials(i18n.language)
      .then((data) => {
        setTestimonials(data);
      })
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));

    fetchSettings('general')
      .then((s) => {
        setVideoList([
          s.testimonial_video_1 || '/video/testimonials1.mp4',
          s.testimonial_video_2 || '/video/testimonials2.mp4',
          s.testimonial_video_3 || '/video/testimonials3.mp4',
        ]);
      })
      .catch(() => {
        setVideoList([
          '/video/testimonials1.mp4',
          '/video/testimonials2.mp4',
          '/video/testimonials3.mp4',
        ]);
      });
  }, [i18n.language]);

  // Client-side categorization based on review keywords
  const categorizeReview = (text: string): 'food' | 'languages' | 'hosts' => {
    const txt = text.toLowerCase();
    const isLang = txt.includes('learn') || txt.includes('language') || txt.includes('speak') || txt.includes('talk') || txt.includes('practice') || txt.includes('spanish') || txt.includes('english') || txt.includes('inglés') || txt.includes('español');
    const isFood = txt.includes('food') || txt.includes('cook') || txt.includes('paella') || txt.includes('recipe') || txt.includes('chef') || txt.includes('dinner') || txt.includes('delicious') || txt.includes('comida') || txt.includes('cocinar') || txt.includes('receta');
    
    if (isLang) return 'languages';
    if (isFood) return 'food';
    return 'hosts'; // fallback to hospitality/vibe
  };

  const filteredTestimonials = testimonials.filter((item) => {
    if (selectedFilter === 'all') return true;
    return categorizeReview(item.review) === selectedFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formReview) return;
    setSubmitting(true);
    
    // Simulate API request delay
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      // Append local submission into state list
      const newReview: Testimonial = {
        id: Date.now(),
        name: formName,
        location: formLocation || 'Valencia, ES',
        review: formReview,
        rating: formRating,
        avatar: null,
      };
      setTestimonials((prev) => [newReview, ...prev]);
    }, 1200);
  };

  const confettiColors = ['#f4a261', '#d4a373', '#032451', '#e8ceb0', '#ffcc00', '#f28482'];

  return (
    <div className="bg-neutral-cream min-h-screen overflow-x-hidden font-body text-text-primary pb-24">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light py-24 sm:py-32 text-white">
        {/* Animated background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-luxury/20 blur-[120px]" />
          {/* Centred ambient spotlight */}
          <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[150px] animate-pulse" />
        </div>

        {/* Floating food/sparkle particles inside hero */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { symbol: '🥘', x: '10%', y: '25%', duration: 6, size: 'text-2xl sm:text-3xl' },
            { symbol: '🍷', x: '85%', y: '20%', duration: 8, size: 'text-xl sm:text-2xl' },
            { symbol: '✨', x: '20%', y: '70%', duration: 5, size: 'text-lg sm:text-xl' },
            { symbol: '🍊', x: '75%', y: '65%', duration: 7, size: 'text-xl sm:text-2xl' },
          ].map((p, i) => (
            <motion.div
              key={i}
              className={`absolute select-none opacity-45 ${p.size}`}
              style={{ left: p.x, top: p.y }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {p.symbol}
            </motion.div>
          ))}
        </div>

        <div className="container-max px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="font-script text-3xl sm:text-4xl text-accent mb-3 block">
              Sobremesa
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
              {t('testimonialsPage.heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed mb-8">
              {t('testimonialsPage.heroSubtitle')}
            </p>

            {/* Google Rating badge */}
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-3 rounded-full shadow-soft">
              <span className="text-yellow-400 text-lg">★★★★★</span>
              <span className="text-sm font-semibold text-white/95">
                {t('testimonialsPage.ratingSummary')}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. VIDEO STORIES SECTION */}
      {videoList.length > 0 && (
        <section className="py-16 sm:py-24 container-max px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
              {t('testimonialsPage.videoSectionTitle')}
            </h2>
            <div className="h-1 w-16 bg-accent rounded mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {videoList.map((src, idx) => (
              <PremiumLazyVideo key={idx} src={src} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* 3. WRITTEN REVIEWS SECTION */}
      <section className="py-16 bg-white/40 border-y border-neutral-beige/40">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
              {t('testimonialsPage.writtenSectionTitle')}
            </h2>
            <p className="text-neutral-gray max-w-xl mx-auto text-sm sm:text-base">
              {t('testimonialsPage.writtenSectionSubtitle')}
            </p>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 max-w-3xl mx-auto">
            {(['all', 'food', 'languages', 'hosts'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 ${
                  selectedFilter === filter
                    ? 'bg-primary text-white shadow-soft scale-105'
                    : 'bg-white text-neutral-gray border border-neutral-sand hover:bg-neutral-beige hover:text-primary'
                }`}
              >
                {t(`testimonialsPage.filters.${filter}`)}
              </button>
            ))}
          </div>

          {/* Reviews Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16 bg-white/70 border border-neutral-sand/50 rounded-3xl p-8">
              <span className="text-3xl block mb-2">📋</span>
              <p className="text-neutral-gray font-semibold">No reviews found in this category.</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
            >
              <AnimatePresence mode="popLayout">
                {filteredTestimonials.map((item, index) => {
                  const category = categorizeReview(item.review);
                  return (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="group relative flex flex-col justify-between rounded-2xl bg-white p-6 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 border border-neutral-beige/30"
                    >
                      {/* Stylized Quote Mark background */}
                      <span className="absolute top-4 right-6 text-7xl font-serif text-accent/10 select-none pointer-events-none transition-colors group-hover:text-accent/25">
                        “
                      </span>

                      <div>
                        {/* Star Ratings */}
                        <div className="flex items-center gap-0.5 mb-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`text-lg leading-none ${
                                i < item.rating ? 'text-amber-500' : 'text-neutral-200'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>

                        {/* Category badge */}
                        <div className="mb-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            category === 'food'
                              ? 'bg-amber-100 text-amber-800'
                              : category === 'languages'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {t(`testimonialsPage.filters.${category}`)}
                          </span>
                        </div>

                        <p className="text-neutral-dark font-body text-sm leading-relaxed mb-6 italic text-neutral-800">
                          "{item.review}"
                        </p>
                      </div>

                      {/* Guest details */}
                      <div className="flex items-center gap-3 border-t border-neutral-beige/20 pt-4 mt-auto">
                        <div className="relative w-11 h-11 rounded-full flex items-center justify-center overflow-hidden bg-primary/5 border border-accent/25 p-0.5">
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/40 rounded-full flex items-center justify-center font-bold text-primary text-sm">
                              {item.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-sm text-neutral-dark">
                            {item.name}
                          </p>
                          <p className="text-xs text-neutral-gray">{item.location}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* 4. SHARE YOUR STORY FORM */}
      <section className="py-16 sm:py-24 container-max px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto relative">
          
          {/* Confetti Drift Area */}
          {submitted && (
            <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-[2.5rem]">
              {Array.from({ length: 40 }).map((_, i) => (
                <ConfettiParticle
                  key={i}
                  delay={Math.random() * 2.5}
                  x={`${Math.random() * 100}%`}
                  color={confettiColors[Math.floor(Math.random() * confettiColors.length)]}
                />
              ))}
            </div>
          )}

          <motion.div
            layout
            className="card relative overflow-hidden rounded-[2.5rem] bg-white border border-neutral-sand/40 p-8 sm:p-12 shadow-card"
          >
            {/* Ambient orange glow in the card corner */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent/10 blur-[40px] pointer-events-none" />

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 flex flex-col items-center justify-center"
                >
                  {/* Glowing Checkmark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl shadow-soft mb-6"
                  >
                    ✓
                  </motion.div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-4">
                    Thank you!
                  </h3>
                  <p className="text-neutral-gray font-body max-w-md mx-auto leading-relaxed">
                    {t('testimonialsPage.formSuccess')}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormName('');
                      setFormLocation('');
                      setFormReview('');
                      setFormRating(5);
                    }}
                    className="mt-8 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary text-white hover:bg-primary-light active:scale-95 transition-all"
                  >
                    Write Another Review
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center mb-8">
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-2">
                      {t('testimonialsPage.formTitle')}
                    </h3>
                    <p className="text-neutral-gray text-sm sm:text-base font-light">
                      {t('testimonialsPage.formSubtitle')}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-dark mb-2">
                          {t('testimonialsPage.formName')} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-sand/80 rounded-xl font-body text-sm bg-neutral-cream/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-dark mb-2">
                          {t('testimonialsPage.formLocation')}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rome, Italy"
                          value={formLocation}
                          onChange={(e) => setFormLocation(e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-sand/80 rounded-xl font-body text-sm bg-neutral-cream/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Interactive Star Selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-dark mb-2">
                        {t('testimonialsPage.formRating')}
                      </label>
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const val = i + 1;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setFormRating(val)}
                              onMouseEnter={() => setHoverRating(val)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="text-2xl transition-all duration-150 transform hover:scale-125 focus:outline-none"
                            >
                              <span
                                className={`${
                                  val <= (hoverRating ?? formRating)
                                    ? 'text-amber-500 drop-shadow-sm'
                                    : 'text-neutral-200'
                                }`}
                              >
                                ★
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-dark mb-2">
                        {t('testimonialsPage.formReview')} *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formReview}
                        onChange={(e) => setFormReview(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-sand/80 rounded-xl font-body text-sm bg-neutral-cream/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-300"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-accent text-white uppercase tracking-widest font-bold text-xs rounded-xl shadow-soft hover:bg-accent-alt hover:shadow-card hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-300 disabled:opacity-50"
                    >
                      {submitting ? t('testimonialsPage.formSubmitting') : t('testimonialsPage.formSubmit')}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Embedded CSS Confetti Keyframes */}
      <style>{`
        @keyframes confetti-drift {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(450px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
