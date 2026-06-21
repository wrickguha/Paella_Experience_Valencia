import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';
import { motion } from 'framer-motion';
import { fetchSettings } from '@/services/api';

const resolveImageUrl = (path: string) => {
  if (!path) return '';
  return path.startsWith('http') || path.startsWith('/')
    ? path
    : `/storage/${path}`;
};

export default function CommunitySection() {
  const { t } = useTranslation();
  const items = t('community.items', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    image: string;
  }>;

  const [loadedImages, setLoadedImages] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem('community_settings');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    fetchSettings('general')
      .then((settings) => {
        const nextImages: Record<string, string> = {
          community_image_1: settings.community_image_1 || '',
          community_image_2: settings.community_image_2 || '',
          community_image_3: settings.community_image_3 || '',
        };
        setLoadedImages(nextImages);
        localStorage.setItem('community_settings', JSON.stringify(nextImages));
      })
      .catch(() => {});
  }, []);

  return (
    <SectionWrapper className="bg-white">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('community.title')}
        </h2>
        <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto">
          {t('community.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, index) => {
          const settingKey = `community_image_${index + 1}`;
          const customPath = loadedImages[settingKey];
          const imageSrc = customPath ? resolveImageUrl(customPath) : item.image;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="card group overflow-hidden p-0"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={imageSrc}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-8 text-center">
                <h3 className="font-heading font-semibold text-xl text-neutral-dark mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-gray font-body text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

