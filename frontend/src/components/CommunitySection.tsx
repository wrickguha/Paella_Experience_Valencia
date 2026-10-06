import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';
import { motion } from 'framer-motion';
import { fetchSettings } from '@/services/api';
import { useSectionStyle } from '@/context/SettingsContext';

const resolveImageUrl = (path: string) => {
  if (!path) return '';
  return path.startsWith('http') || path.startsWith('/')
    ? path
    : `/storage/${path}`;
};

// Collect all uploaded images for a given card (1-based card number).
// Slot 1 uses the legacy key `community_image_<n>`;
// Slots 2-5 use `community_image_<n>_<slot>`.
function buildImagePool(
  cardNum: number,
  settings: Record<string, string>,
  fallback: string
): string[] {
  const pool: string[] = [];

  const primary = settings[`community_image_${cardNum}`];
  if (primary) pool.push(resolveImageUrl(primary));

  for (let slot = 2; slot <= 5; slot++) {
    const extra = settings[`community_image_${cardNum}_${slot}`];
    if (extra) pool.push(resolveImageUrl(extra));
  }

  if (pool.length === 0 && fallback) pool.push(fallback);
  return pool;
}

// Pick a purely random image from the pool every time it's called.
// No caching — so every page refresh gives a new result.
function pickRandom(pool: string[]): string {
  if (pool.length === 0) return '';
  if (pool.length === 1) return pool[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function CommunitySection() {
  const { t, i18n } = useTranslation();
  const sectionStyle = useSectionStyle('community');
  const items = t('community.items', { returnObjects: true }) as Array<{
    title: string;
    description: string;
    image: string;
  }>;

  const [settings, setSettings] = useState<Record<string, string>>(() => {
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
        setSettings(s);
        localStorage.setItem('community_settings', JSON.stringify(s));
      })
      .catch(() => {});
  }, []);

  const langSuffix = i18n.language.startsWith('es') ? 'es' : 'en';

  const cardTitles = [
    settings[`community_card1_title_${langSuffix}`] || settings.community_card1_title || (items[0]?.title ?? ''),
    settings[`community_card2_title_${langSuffix}`] || settings.community_card2_title || (items[1]?.title ?? ''),
    settings[`community_card3_title_${langSuffix}`] || settings.community_card3_title || (items[2]?.title ?? ''),
  ];

  const cardDescs = [
    settings[`community_card1_desc_${langSuffix}`] || settings.community_card1_desc || (items[0]?.description ?? ''),
    settings[`community_card2_desc_${langSuffix}`] || settings.community_card2_desc || (items[1]?.description ?? ''),
    settings[`community_card3_desc_${langSuffix}`] || settings.community_card3_desc || (items[2]?.description ?? ''),
  ];

  // Pick random images immediately on mount (covers initial render after refresh).
  const [cardImages, setCardImages] = useState<string[]>(() => {
    // Settings may already be in localStorage from previous visit — use them now
    let cached: Record<string, string> = {};
    try {
      const raw = localStorage.getItem('community_settings');
      if (raw) cached = JSON.parse(raw);
    } catch { /* ignore */ }

    return [1, 2, 3].map((cardNum, idx) =>
      pickRandom(buildImagePool(cardNum, cached, items[idx]?.image ?? ''))
    );
  });

  // Re-roll random picks once the fresh API response arrives.
  useEffect(() => {
    const pools = [1, 2, 3].map((cardNum, idx) =>
      buildImagePool(cardNum, settings, items[idx]?.image ?? '')
    );
    setCardImages(pools.map((pool) => pickRandom(pool)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const sectionTitle =
    settings[`community_title_${langSuffix}`] ||
    settings.community_title ||
    t('community.title');
  const sectionSubtitle =
    settings[`community_subtitle_${langSuffix}`] ||
    settings.community_subtitle ||
    t('community.subtitle');

  return (
    <SectionWrapper className="bg-white" style={sectionStyle}>
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {sectionTitle}
        </h2>
        <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto whitespace-pre-line">
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
              <p className="text-neutral-gray font-body text-sm leading-relaxed whitespace-pre-line">
                {cardDescs[index]}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
