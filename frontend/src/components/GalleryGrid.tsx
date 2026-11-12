import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiImage as ImageIcon } from 'react-icons/fi';
import SectionWrapper from './SectionWrapper';
import { fetchGallery, fetchGalleryCategories } from '@/services/api';
import type { GalleryCategory, GalleryImage } from '@/services/api';

// Module-level cache so gallery isn't re-fetched on every language toggle
const galleryCache = new Map<string, { images: GalleryImage[]; categories: GalleryCategory[] }>();

// Real event photos — used as fallback when API returns no data
const LOCAL_GALLERY: GalleryImage[] = [
  { id: -1, src: '/storage/gallery/chef-gene.jpg', alt: 'Chef Gene presenting the paella at Casa Magnolia', categoryId: null, categorySlug: 'paella-and-food', categoryName: 'Paella & Food' },
  { id: -2, src: '/storage/gallery/paella-valenciana.jpg', alt: 'Traditional Paella Valenciana', categoryId: null, categorySlug: 'paella-and-food', categoryName: 'Paella & Food' },
  { id: -3, src: '/storage/gallery/sobremesa.jpg', alt: 'Guests sharing stories after the meal', categoryId: null, categorySlug: 'people-and-moments', categoryName: 'People & Moments' },
  { id: -4, src: '/storage/gallery/socarrat.jpg', alt: 'The perfect socarrat — crispy caramelised rice base', categoryId: null, categorySlug: 'paella-and-food', categoryName: 'Paella & Food' },
  { id: -5, src: '/storage/assets/images/speakeasy/GPTempDownload.jpg', alt: 'The Speakeasy paella experience', categoryId: null, categorySlug: 'the-experience', categoryName: 'The Experience' },
  { id: -6, src: '/storage/gallery/paella-1.jpg', alt: 'Paella sizzling over open flame at Casa Magnolia', categoryId: null, categorySlug: 'paella-and-food', categoryName: 'Paella & Food' },
];

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'paella-and-food': '/storage/gallery/paella-valenciana.jpg',
  'people-and-moments': '/storage/gallery/sobremesa.jpg',
  'places-and-atmosphere': '/storage/assets/images/speakeasy/GPTempDownload(2).jpg',
  'the-experience': '/storage/assets/images/speakeasy/GPTempDownload.jpg',
};

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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
  const currentImageIndex = visibleImages.length > 0 ? activeImageIndex % visibleImages.length : 0;
  const currentImage = visibleImages[currentImageIndex];

  const showPreviousImage = () => {
    setActiveImageIndex((index) => (index - 1 + visibleImages.length) % visibleImages.length);
  };

  const showNextImage = () => {
    setActiveImageIndex((index) => (index + 1) % visibleImages.length);
  };

  const selectCategory = (category: string) => {
    setActiveCategory(category);
    setActiveImageIndex(0);
  };

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
          onClick={() => selectCategory('')}
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
            onClick={() => selectCategory(category.slug)}
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
      ) : currentImage ? (
        <div className="mx-auto max-w-5xl">
          <div
            className="relative aspect-[4/3] max-h-[34rem] min-h-[22rem] overflow-hidden rounded-[1.5rem] bg-neutral-sand shadow-xl sm:aspect-[16/9] sm:rounded-[2rem]"
            aria-roledescription={lang === 'es' ? 'carrusel' : 'carousel'}
            aria-label={lang === 'es' ? 'Galería de fotos' : 'Photo gallery'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentImage.id}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
                role="group"
                aria-roledescription={lang === 'es' ? 'diapositiva' : 'slide'}
                aria-label={`${currentImageIndex + 1} ${lang === 'es' ? 'de' : 'of'} ${visibleImages.length}`}
              >
                <img
                  src={currentImage.src}
                  alt={currentImage.alt}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={(event) => {
                    const img = event.currentTarget;
                    const fallback = currentImage.categorySlug
                      ? CATEGORY_FALLBACK_IMAGES[currentImage.categorySlug]
                      : undefined;

                    if (fallback && img.dataset.fallbackApplied !== 'true') {
                      img.dataset.fallbackApplied = 'true';
                      img.src = fallback;
                    } else {
                      img.style.display = 'none';
                    }
                  }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                  {currentImage.categoryName && (
                    <span className="mb-2 inline-flex rounded-full bg-white/20 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                      {currentImage.categoryName}
                    </span>
                  )}
                  <p className="max-w-3xl font-heading text-lg font-bold leading-snug text-white sm:text-2xl">
                    {currentImage.alt}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {visibleImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  aria-label={lang === 'es' ? 'Imagen anterior' : 'Previous image'}
                  className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-dark shadow-lg transition hover:scale-105 hover:bg-white sm:left-5 sm:h-12 sm:w-12"
                >
                  <FiChevronLeft size={24} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label={lang === 'es' ? 'Imagen siguiente' : 'Next image'}
                  className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-dark shadow-lg transition hover:scale-105 hover:bg-white sm:right-5 sm:h-12 sm:w-12"
                >
                  <FiChevronRight size={24} aria-hidden="true" />
                </button>
                <span
                  className="absolute right-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                  aria-live="polite"
                >
                  {currentImageIndex + 1} / {visibleImages.length}
                </span>
              </>
            )}
          </div>

          {visibleImages.length > 1 && (
            <div className="mt-5 flex items-center justify-center gap-2" role="group" aria-label={lang === 'es' ? 'Seleccionar imagen' : 'Choose image'}>
              {visibleImages.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`${lang === 'es' ? 'Mostrar imagen' : 'Show image'} ${index + 1}`}
                  aria-current={index === currentImageIndex ? 'true' : undefined}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentImageIndex ? 'w-8 bg-primary' : 'w-2.5 bg-neutral-sand hover:bg-primary/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </SectionWrapper>
  );
}
