import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { fetchSettings } from '@/services/api';
import { Link } from 'react-router-dom';
import { useSectionStyle } from '@/context/SettingsContext';

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

  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be') || src.length === 11;
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(src) : src;

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
        isYouTube ? (
          <iframe
            src={embedUrl}
            title={`Video testimonial ${index + 1}`}
            className="absolute inset-0 w-full h-full"
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
            className="absolute inset-0 w-full h-full object-cover"
          />
        )
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
  const { t, i18n } = useTranslation();
  const sectionStyle = useSectionStyle('testimonials');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [videoList, setVideoList] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('testimonial_videos');
      return cached ? JSON.parse(cached) : [
        '/video/testimonials1.mp4',
        '/video/testimonials2.mp4',
        '/video/testimonials3.mp4',
      ];
    } catch {
      return [
        '/video/testimonials1.mp4',
        '/video/testimonials2.mp4',
        '/video/testimonials3.mp4',
      ];
    }
  });

  useEffect(() => {
    fetchSettings('general')
      .then((s) => {
        setSettings(s);
        const fetchedVideos = [
          s.testimonial_video_1 || '/video/testimonials1.mp4',
          s.testimonial_video_2 || '/video/testimonials2.mp4',
          s.testimonial_video_3 || '/video/testimonials3.mp4',
        ];
        setVideoList(fetchedVideos);
        localStorage.setItem('testimonial_videos', JSON.stringify(fetchedVideos));
      })
      .catch(() => {});
  }, []);

  const langSuffix = i18n.language.startsWith('es') ? 'es' : 'en';
  const sectionTitle = settings[`video_testimonials_title_${langSuffix}`] || t('videoTestimonials.title');
  const sectionSubtitle = settings[`video_testimonials_subtitle_${langSuffix}`];
  const seeMoreText = settings[`video_testimonials_seeMore_${langSuffix}`] || t('videoTestimonials.seeMore');

  return (
    <SectionWrapper className="bg-white" style={sectionStyle}>
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {sectionTitle}
        </h2>
        {sectionSubtitle && (
          <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {videoList.map((src, index) => (
          <LazyVideo key={index} src={src} index={index} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center mt-12"
      >
        <Link
          to="/testimonials"
          className="btn-primary group relative overflow-hidden inline-flex items-center gap-2"
        >
          <span>{seeMoreText}</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </motion.div>
    </SectionWrapper>
  );
}
