import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SectionWrapper from './SectionWrapper';
import { fetchGallery } from '@/services/api';
import type { GalleryImage } from '@/services/api';

// Real event photos — used as fallback when API returns no data
const LOCAL_GALLERY: GalleryImage[] = [
  { src: '/storage/assets/images/casa-magnolia/Chef Gene.jpg',       alt: 'Chef Gene presenting the paella at Casa Magnolia' },
  { src: '/storage/assets/images/casa-magnolia/Paella valenciana.jpg', alt: 'Traditional Paella Valenciana' },
  { src: '/storage/assets/images/casa-magnolia/Sobremesa.jpg',       alt: 'Guests sharing stories after the meal' },
  { src: '/storage/assets/images/casa-magnolia/Socarrat.jpg',        alt: 'The perfect socarrat — crispy caramelised rice base' },
  { src: '/storage/assets/images/speakeasy/GPTempDownload.jpg',      alt: 'The Speakeasy paella experience' },
  { src: '/storage/assets/images/casa-magnolia/Paella 1.jpg',        alt: 'Paella sizzling over open flame at Casa Magnolia' },
];

export default function GalleryGrid() {
  const { t, i18n } = useTranslation();
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const lang = i18n.language.startsWith('es') ? 'es' : 'en';
    fetchGallery('homepage', lang)
      .then((data) => setImages(data.length > 0 ? data : LOCAL_GALLERY))
      .catch(() => setImages(LOCAL_GALLERY));
  }, [i18n.language]);

  const captions = [
    "Strangers → Friends",
    "Shared table, shared stories",
    "People from different places",
    "Connection through culture",
    "Laughter is the best ingredient",
    "Cooking is a universal language",
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
              index === 0 ? 'md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto' : 'aspect-square'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500
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

