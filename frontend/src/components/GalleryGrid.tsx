import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiImage as ImageIcon } from 'react-icons/fi';
import SectionWrapper from './SectionWrapper';
import { fetchGallery, fetchGalleryCategories } from '@/services/api';
import type { GalleryCategory, GalleryImage } from '@/services/api';

// Module-level cache so gallery isn't re-fetched on every language toggle
const galleryCache = new Map<string, { images: GalleryImage[]; categories: GalleryCategory[] }>();

// Real event photos — used as fallback when API returns no data
const LOCAL_GALLERY: GalleryImage[] = [
  { id: -1, src: '/storage/assets/images/casa-magnolia/Chef Gene.jpg', alt: 'Chef Gene presenting the paella at Casa Magnolia', categoryId: null, categorySlug: 'paella-and-food', categoryName: 'Paella & Food' },
  { id: -2, src: '/storage/assets/images/casa-magnolia/Paella valenciana.jpg', alt: 'Traditional Paella Valenciana', categoryId: null, categorySlug: 'paella-and-food', categoryName: 'Paella & Food' },
  { id: -3, src: '/storage/assets/images/casa-magnolia/Sobremesa.jpg', alt: 'Guests sharing stories after the meal', categoryId: null, categorySlug: 'people-and-moments', categoryName: 'People & Moments' },
  { id: -4, src: '/storage/assets/images/casa-magnolia/Socarrat.jpg', alt: 'The perfect socarrat — crispy caramelised rice base', categoryId: null, categorySlug: 'paella-and-food', categoryName: 'Paella & Food' },
  { id: -5, src: '/storage/assets/images/speakeasy/GPTempDownload.jpg', alt: 'The Speakeasy paella experience', categoryId: null, categorySlug: 'the-experience', categoryName: 'The Experience' },
  { id: -6, src: '/storage/assets/images/casa-magnolia/Paella 1.jpg', alt: 'Paella sizzling over open flame at Casa Magnolia', categoryId: null, categorySlug: 'paella-and-food', categoryName: 'Paella & Food' },
];

const FALLBACK_CATEGORIES = [
  { slug: 'paella-and-food', en: 'Paella & Food', es: 'Paella y cocina' },
  { slug: 'people-and-moments', en: 'People & Moments', es: 'Personas y momentos' },
  { slug: 'places-and-atmosphere', en: 'Places & Atmosphere', es: 'Lugares y ambiente' },
  { slug: 'the-experience', en: 'The Experience', es: 'La experiencia' },
];

export default function GalleryGrid() {
  const { t, i18n } = useTranslation();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const lang = i18n.language.startsWith('es') ? 'es' : 'en';

  useEffect(() => {
    const cacheKey = `about-gallery-${lang}`;
    const cached = galleryCache.get(cacheKey);
    if (cached) {
      setImages(cached.images);
      setCategories(cached.categories);
      return;
    }

    let cancelled = false;
    Promise.all([
      fetchGallery(undefined, lang).catch(() => LOCAL_GALLERY),
      fetchGalleryCategories(lang).catch(() => []),
    ]).then(([data, fetchedCategories]) => {
        if (cancelled) return;
        const result = data.length > 0 ? data : LOCAL_GALLERY;
        const categoryResult = fetchedCategories.length > 0
          ? fetchedCategories.filter((category) => category.imageCount > 0)
          : FALLBACK_CATEGORIES.map((category, index) => ({
              id: -(index + 1),
              slug: category.slug,
              name: lang === 'es' ? category.es : category.en,
              imageCount: result.filter((image) => image.categorySlug === category.slug).length,
            })).filter((category) => category.imageCount > 0);
        galleryCache.set(cacheKey, { images: result, categories: categoryResult });
        setImages(result);
        setCategories(categoryResult);
      });
    return () => { cancelled = true; };
  }, [lang]);

  const visibleImages = activeCategory
    ? images.filter((image) => image.categorySlug === activeCategory)
    : images;

  return (
    <SectionWrapper className="bg-neutral-cream">
      <div className="text-center mb-10 sm:mb-14">
        <span className="inline-block text-primary font-heading font-semibold text-xs sm:text-sm uppercase tracking-[0.22em] mb-3">
          {lang === 'es' ? 'Nuestra comunidad en imágenes' : 'A look inside our table'}
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('gallery.title')}
        </h2>
        <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto">
          {t('gallery.subtitle')}
        </p>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-3 mb-7 sm:mb-9 justify-start sm:justify-center" role="group" aria-label={lang === 'es' ? 'Filtrar por categoría' : 'Filter by category'}>
        <button
          type="button"
          onClick={() => setActiveCategory('')}
          aria-pressed={!activeCategory}
          className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
            !activeCategory ? 'bg-primary text-white shadow-md' : 'bg-white text-neutral-dark hover:bg-primary/10'
          }`}
        >
          {t('gallery.allCategories')}
          <span className="ml-2 opacity-70">{images.length}</span>
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.slug)}
            aria-pressed={activeCategory === category.slug}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              activeCategory === category.slug ? 'bg-primary text-white shadow-md' : 'bg-white text-neutral-dark hover:bg-primary/10'
            }`}
          >
            {category.name}
            <span className="ml-2 opacity-70">{category.imageCount}</span>
          </button>
        ))}
      </div>

      {visibleImages.length === 0 ? (
        <div className="rounded-3xl border border-neutral-sand/50 bg-white/70 py-16 text-center text-neutral-gray">
          <ImageIcon className="mx-auto mb-3 text-primary/60" size={30} aria-hidden="true" />
          <p>{lang === 'es' ? 'Aún no hay imágenes en esta categoría.' : 'No images in this category yet.'}</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(13rem,1fr)] gap-4 sm:gap-5">
        {visibleImages.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(index, 5) * 0.06, duration: 0.45 }}
            className={`relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] group ${
              index === 0 ? 'sm:col-span-2 sm:row-span-2 min-h-[23rem] sm:min-h-[31rem]' : 'aspect-[4/3] sm:aspect-auto min-h-[14rem]'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-neutral-sand to-neutral-cream flex items-center justify-center">
              <ImageIcon className="text-primary/30" size={36} aria-hidden="true" />
            </div>
            <img
              src={image.src}
              alt={image.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
              className="w-full h-full object-cover transition-transform duration-500
                         group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
              {image.categoryName && (
                <span className="inline-flex rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-white mb-2">
                  {image.categoryName}
                </span>
              )}
              <p className="text-white font-heading font-bold text-sm sm:text-base leading-snug">
                {image.alt}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </SectionWrapper>
  );
}
