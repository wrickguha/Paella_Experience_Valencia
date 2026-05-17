import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';
import { motion } from 'framer-motion';

const videos = [
  '/video/testimonials1.mp4',
  '/video/testimonials2.mp4',
  '/video/testimonials3.mp4',
];

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
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            className="rounded-[2rem] overflow-hidden shadow-elevated bg-neutral-cream aspect-[9/16] relative group"
          >
            <video
              src={src}
              controls
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
