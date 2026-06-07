import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const videos = [
  '/video/testimonials1.mp4',
  '/video/testimonials2.mp4',
  '/video/testimonials3.mp4',
];

function LazyVideo({ src, index }: { src: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

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
      { rootMargin: '200px' } // start loading 200px before it enters viewport
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
      className="rounded-[2rem] overflow-hidden shadow-elevated bg-neutral-cream aspect-[9/16] relative group"
    >
      {inView ? (
        <video
          src={src}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        /* Placeholder shown until video is near viewport */
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-neutral-200">
          <svg
            className="w-14 h-14 text-neutral-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}

export default function VideoTestimonialsSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper className="bg-white">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('videoTestimonials.title')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {videos.map((src, index) => (
          <LazyVideo key={index} src={src} index={index} />
        ))}
      </div>
    </SectionWrapper>
  );
}
