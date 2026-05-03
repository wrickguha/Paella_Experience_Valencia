import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SectionWrapper from './SectionWrapper';
import { fetchGallery } from '@/services/api';
import type { GalleryImage } from '@/services/api';

export default function GalleryGrid() {
  const { t, i18n } = useTranslation();
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const lang = i18n.language.startsWith('es') ? 'es' : 'en';
    fetchGallery('homepage', lang).then(setImages).catch(() => {});
  }, [i18n.language]);

  const captions = [
    "Strangers → Friends",
    "Shared table, shared stories",
    "People from different places",
    "Connection through culture",
    "Laughter is the best ingredient",
    "Cooking is a universal language"
  ];

  return (
    <SectionWrapper className="bg-neutral-cream">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('gallery.title')}
        </h2>
        <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto">
          {t('gallery.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`relative overflow-hidden rounded-2xl group cursor-pointer ${
              index === 0 ? 'md:col-span-2 md:row-span-2' : ''
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="w-full h-full object-cover aspect-square transition-transform duration-500
                         group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center p-6 text-center">
              <span className="text-white font-heading font-bold text-sm sm:text-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                {captions[index % captions.length]}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>

  );
}
