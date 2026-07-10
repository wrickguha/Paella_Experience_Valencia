import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';
import { motion } from 'framer-motion';
import { fetchSettings } from '@/services/api';

const iconMap: Record<string, string> = {
  conversations: '🗣',
  meals: '🥘',
  sobremesa: '🍷',
  lifestyle: '☀️',
  community: '👥',
  immersive: '🌿',
};

const DEFAULT_FLOW_STEPS = [
  { id: 1, emoji: '👋', title: 'Meet & Connect',          description: 'Meet people from around the world.' },
  { id: 2, emoji: '🗣️', title: 'Language Experience',      description: 'Practice Spanish and English naturally.' },
  { id: 3, emoji: '🥟', title: 'Food & Drinks',            description: 'Enjoy Argentine empanadas, wine, and beer.' },
  { id: 4, emoji: '🌍', title: 'Culture & Conversation',   description: 'Share stories, experiences, and perspectives.' },
  { id: 5, emoji: '🤝', title: 'Build New Connections',    description: 'Leave with new friends and memorable conversations.' },
];

interface SnakeFlowStep {
  id: number;
  emoji: string;
  title: string;
  description: string;
}

function SnakeFlowchart({ steps }: { steps: SnakeFlowStep[] }) {
  return (
    <div className="relative">
      {/* Continuous vertical line through all nodes */}
      <motion.div
        className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/30 origin-top"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />

      <div className="space-y-5">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex items-start gap-4 relative"
          >
            {/* Node circle (sits on the vertical line) */}
            <div className="relative z-10 shrink-0 w-10 h-10 rounded-full bg-primary text-white font-heading font-bold text-base flex items-center justify-center shadow-md border-2 border-accent/50">
              {step.id}
            </div>

            {/* Content card */}
            <div className="flex-1 bg-white border border-neutral-sand/30 rounded-2xl px-5 py-4 shadow-card">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{step.emoji}</span>
                <h4 className="font-heading font-bold text-neutral-dark text-sm">{step.title}</h4>
              </div>
              <p className="text-neutral-gray text-sm leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function ExperienceHighlights() {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings('general')
      .then(setSettings)
      .catch(() => {});
  }, []);

  const langSuffix = i18n.language.startsWith('es') ? 'es' : 'en';

  // Section Core Headers
  const sectionTitle = settings[`highlights_title_${langSuffix}`] || t('highlights.title');
  const sectionSubtitle = settings[`highlights_subtitle_${langSuffix}`] || t('highlights.subtitle');

  // Load items (1 to 6)
  const fallbackItems = t('highlights.items', { returnObjects: true }) as Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  const items = [1, 2, 3, 4, 5, 6].map((num, idx) => {
    const fallback = fallbackItems[idx] || { icon: 'immersive', title: '', description: '' };
    return {
      icon: settings[`highlights_feat${num}_icon`] || fallback.icon,
      title: settings[`highlights_feat${num}_title_${langSuffix}`] || fallback.title,
      description: settings[`highlights_feat${num}_desc_${langSuffix}`] || fallback.description,
    };
  });

  // Load language paragraphs
  const fallbackParagraphs = t('highlights.languageParagraphs', { returnObjects: true }) as string[];
  const paragraphsSetting = settings[`highlights_languageParagraphs_${langSuffix}`];
  const paragraphs = paragraphsSetting
    ? paragraphsSetting.split('\n').map(p => p.trim()).filter(Boolean)
    : fallbackParagraphs;

  const languageTitle = settings[`highlights_languageTitle_${langSuffix}`] || t('highlights.languageTitle');
  const languageSubtitle = settings[`highlights_languageSubtitle_${langSuffix}`] || t('highlights.languageSubtitle');

  // Load flowchart steps
  const flowSteps = [1, 2, 3, 4, 5].map((num, idx) => {
    const fallback = DEFAULT_FLOW_STEPS[idx];
    return {
      id: num,
      emoji: settings[`flow_step${num}_emoji`] || fallback.emoji,
      title: settings[`flow_step${num}_title_${langSuffix}`] || fallback.title,
      description: settings[`flow_step${num}_desc_${langSuffix}`] || fallback.description,
    };
  });

  return (
    <SectionWrapper>
      {/* ── Top Grid: Feature Cards ── */}
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {sectionTitle}
        </h2>
        <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto">
          {sectionSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="card text-center hover:shadow-elevated transition-shadow duration-300"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">{iconMap[item.icon] || item.icon || '✨'}</span>
            </div>
            <h3 className="font-heading font-semibold text-lg text-neutral-dark mb-3">
              {item.title === 'Sobremesa' || item.title === 'Sobremesa' ? <em>{item.title}</em> : item.title}
            </h3>
            <p className="text-neutral-gray font-body text-sm leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Bottom Split: Language Text LEFT + Snake Flow RIGHT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

        {/* LEFT — Language learning content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-primary font-heading font-semibold text-sm uppercase tracking-widest mb-4 block">
            {i18n.language.startsWith('es') ? 'Aprendizaje' : 'Learning'}
          </span>
          <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4 leading-tight">
            {languageTitle}
          </h3>
          <p className="text-xl sm:text-2xl font-heading text-primary font-semibold mb-8">
            {languageSubtitle}
          </p>
          <div className="space-y-4 text-neutral-gray font-body text-base sm:text-lg leading-relaxed">
            {paragraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Decorative accent */}
          <div className="mt-10 flex items-center gap-3">
            <div className="h-1 w-12 bg-primary rounded-full" />
            <div className="h-1 w-6 bg-accent rounded-full" />
            <div className="h-1 w-3 bg-primary/30 rounded-full" />
          </div>
        </motion.div>

        {/* RIGHT — Snake experience flowchart */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <SnakeFlowchart steps={flowSteps} />
        </motion.div>

      </div>
    </SectionWrapper>
  );
}
