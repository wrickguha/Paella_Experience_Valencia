import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { fetchSettings } from '@/services/api';
import { Link } from 'react-router-dom';
import { useSectionStyle } from '@/context/SettingsContext';

const DEFAULT_VIDEOS = [
  '/video/testimonials1.mp4',
  '/video/testimonials2.mp4',
  '/video/testimonials3.mp4',
];

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

function getYouTubeThumbnail(urlOrId: string) {
  const videoId = getYouTubeEmbedUrl(urlOrId).match(/youtube\.com\/embed\/([^?]+)/)?.[1];
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
}

function VideoPreview({
  src,
  index,
  onClick,
}: {
  src: string;
  index: number;
  onClick: () => void;
}) {
  const thumbnail = getYouTubeThumbnail(src);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Show video ${index + 1}`}
      className="group relative h-full w-[clamp(2.5rem,9vw,7.5rem)] shrink-0 overflow-hidden rounded-2xl bg-primary-dark bg-cover bg-center text-white shadow-lg transition duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:rounded-[1.75rem]"
      style={thumbnail ? { backgroundImage: `url("${thumbnail}")` } : undefined}
    >
      <span className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/75" />
      
    </button>
  );
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
      className="rounded-[2rem] overflow-hidden shadow-elevated bg-neutral-cream aspect-square relative group"
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
  const [videoList, setVideoList] = useState<string[]>(DEFAULT_VIDEOS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);

  useEffect(() => {
    fetchSettings('general')
      .then((s) => {
        setSettings(s);
        const videoKeys = Object.keys(s)
          .map((key) => {
            const match = key.match(/^testimonial_video_(\d+)$/);
            return match ? Number(match[1]) : null;
          })
          .filter((index): index is number => index !== null)
          .sort((a, b) => a - b);
        const fetchedVideos = videoKeys
          .map((index) => s[`testimonial_video_${index}`]?.trim())
          .filter((url): url is string => Boolean(url));
        const videos = fetchedVideos.length > 0 ? fetchedVideos : DEFAULT_VIDEOS;
        setVideoList(videos);
        setCurrentIndex(0);
      })
      .catch(() => {});
  }, []);

  const showVideo = (index: number) => {
    setSlideDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex((index + videoList.length) % videoList.length);
  };

  const langSuffix = i18n.language.startsWith('es') ? 'es' : 'en';
  const sectionTitle = settings[`video_testimonials_title_${langSuffix}`] || t('videoTestimonials.title');
  const sectionSubtitle = settings[`video_testimonials_subtitle_${langSuffix}`];
  const seeMoreText = settings[`video_testimonials_seeMore_${langSuffix}`] || t('videoTestimonials.seeMore');

  return (
    <SectionWrapper className="bg-[#f1fafb]" style={sectionStyle}>
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {sectionTitle}
        </h2>
        {sectionSubtitle && (
          <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto whitespace-pre-line">
            {sectionSubtitle}
          </p>
        )}
      </div>

      <div className="relative mx-auto max-w-6xl px-1 sm:px-8">
        <div className="flex h-[min(78vw,34rem)] items-stretch justify-center gap-2 overflow-hidden sm:gap-4">
          {videoList.length > 1 && [-2, -1].map((offset) => {
            if (Math.abs(offset) >= videoList.length) return null;
            const index = (currentIndex + offset + videoList.length) % videoList.length;
            return (
              <VideoPreview
                key={`preview-${offset}-${index}`}
                src={videoList[index]}
                index={index}
                onClick={() => showVideo(index)}
              />
            );
          })}

          <div className="relative h-full aspect-square shrink-0 overflow-hidden rounded-2xl shadow-[0_24px_70px_rgba(3,36,81,0.2)] sm:rounded-[1.75rem]">
            <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
              <motion.div
                key={`${currentIndex}-${videoList[currentIndex]}`}
                custom={slideDirection}
                initial={{ opacity: 0, x: slideDirection * 48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDirection * -48 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="h-full w-full"
              >
                <LazyVideo src={videoList[currentIndex]} index={currentIndex} />
              </motion.div>
            </AnimatePresence>
          </div>

          {videoList.length > 1 && [1, 2].map((offset) => {
            if (offset >= videoList.length) return null;
            const index = (currentIndex + offset) % videoList.length;
            return (
              <VideoPreview
                key={`preview-${offset}-${index}`}
                src={videoList[index]}
                index={index}
                onClick={() => showVideo(index)}
              />
            );
          })}
        </div>

        {videoList.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => showVideo(currentIndex - 1)}
              aria-label={t('common.previous', { defaultValue: 'Previous video' })}
              className="absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-[0_8px_25px_rgba(3,36,81,0.14)] transition hover:scale-105 hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:left-2 sm:h-14 sm:w-14"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => showVideo(currentIndex + 1)}
              aria-label={t('common.next', { defaultValue: 'Next video' })}
              className="absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-[0_8px_25px_rgba(3,36,81,0.14)] transition hover:scale-105 hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:right-2 sm:h-14 sm:w-14"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      {videoList.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2.5" aria-label="Choose a video">
          {videoList.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => showVideo(index)}
              aria-label={`Show video ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex ? 'w-7 bg-primary' : 'w-2.5 bg-primary/20 hover:bg-primary/40'
              }`}
            />
          ))}
          <span className="sr-only">{currentIndex + 1} of {videoList.length}</span>
        </div>
      )}

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
