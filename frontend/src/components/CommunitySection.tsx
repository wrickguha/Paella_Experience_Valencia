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

interface CommunitySettings {
  community_title?: string;
  community_subtitle?: string;
  community_card1_title?: string;
  community_card1_desc?: string;
  community_card2_title?: string;
  community_card2_desc?: string;
  community_card3_title?: string;
  community_card3_desc?: string;
  community_image_1?: string;
  community_image_2?: string;
  community_image_3?: string;
}

export default function CommunitySection() {
  const { t } = useTranslation();
  const items = t('community.items', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    image: string;
  }>;

  const [settings, setSettings] = useState<CommunitySettings>(() => {
    try {
      const cached = localStorage.getItem('community_settings');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    fetchSettings('general')
      .then((s) => {
        const next: CommunitySettings = {
          community_title: s.community_title || '',
          community_subtitle: s.community_subtitle || '',
          community_card1_title: s.community_card1_title || '',
          community_card1_desc: s.community_card1_desc || '',
          community_card2_title: s.community_card2_title || '',
          community_card2_desc: s.community_card2_desc || '',
          community_card3_title: s.community_card3_title || '',
          community_card3_desc: s.community_card3_desc || '',
          community_image_1: s.community_image_1 || '',
          community_image_2: s.community_image_2 || '',
          community_image_3: s.community_image_3 || '',
        };
        setSettings(next);
        localStorage.setItem('community_settings', JSON.stringify(next));
      })
      .catch(() => {});
  }, []);

  const cardTitles = [
    settings.community_card1_title || (items[0]?.title ?? ''),
    settings.community_card2_title || (items[1]?.title ?? ''),
    settings.community_card3_title || (items[2]?.title ?? ''),
  ];

  const cardDescs = [
    settings.community_card1_desc || (items[0]?.description ?? ''),
    settings.community_card2_desc || (items[1]?.description ?? ''),
    settings.community_card3_desc || (items[2]?.description ?? ''),
  ];

  const cardImages = [
    settings.community_image_1 ? resolveImageUrl(settings.community_image_1) : (items[0]?.image ?? ''),
    settings.community_image_2 ? resolveImageUrl(settings.community_image_2) : (items[1]?.image ?? ''),
    settings.community_image_3 ? resolveImageUrl(settings.community_image_3) : (items[2]?.image ?? ''),
  ];

  const sectionTitle = settings.community_title || t('community.title');
  const sectionSubtitle = settings.community_subtitle || t('community.subtitle');

  return (
    <SectionWrapper className="bg-white">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {sectionTitle}
        </h2>
        <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto">
          {sectionSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[0, 1, 2].map((index) => (
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
                src={cardImages[index]}
                alt={cardTitles[index]}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-8 text-center">
              <h3 className="font-heading font-semibold text-xl text-neutral-dark mb-3">
                {cardTitles[index]}
              </h3>
              <p className="text-neutral-gray font-body text-sm leading-relaxed">
                {cardDescs[index]}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
