import { useTranslation } from 'react-i18next';
import SectionWrapper from './SectionWrapper';
import { motion } from 'framer-motion';

const iconMap: Record<string, string> = {
  conversations: '🗣',
  meals: '🥘',
  sobremesa: '🍷',
  lifestyle: '☀️',
  community: '👥',
  immersive: '🌿',
};

const flowSteps = [
  { id: 1, emoji: '👋', title: 'Meet & Greet',    description: 'Welcome drink and introductions.' },
  { id: 2, emoji: '🎯', title: 'Icebreaker',      description: 'Fun games to break the ice.' },
  { id: 3, emoji: '🍳', title: 'Cook Together',   description: 'Hands-on paella preparation.' },
  { id: 4, emoji: '🥘', title: 'Eat & Connect',   description: 'Enjoy the meal and shared stories.' },
  { id: 5, emoji: '🍷', title: 'Sobremesa',       description: 'Linger at the table, share stories, and let conversations flow naturally.' },
];

function SnakeFlowchart() {
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
        {flowSteps.map((step, index) => (
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
                <h4 className="font-heading font-bold text-neutral-dark text-sm">{step.id === 5 ? <em>{step.title}</em> : step.title}</h4>
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
  const { t } = useTranslation();
  const items = t('highlights.items', { returnObjects: true }) as Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  const paragraphs = t('highlights.languageParagraphs', { returnObjects: true }) as string[];

  return (
    <SectionWrapper>
      {/* ── Top Grid: Feature Cards ── */}
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4">
          {t('highlights.title')}
        </h2>
        <p className="text-lg text-neutral-gray font-body max-w-2xl mx-auto">
          {t('highlights.subtitle')}
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
              <span className="text-3xl">{iconMap[item.icon] || '✨'}</span>
            </div>
            <h3 className="font-heading font-semibold text-lg text-neutral-dark mb-3">
              {item.title === 'Sobremesa' ? <em>{item.title}</em> : item.title}
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
            Learning
          </span>
          <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-4 leading-tight">
            {t('highlights.languageTitle')}
          </h3>
          <p className="text-xl sm:text-2xl font-heading text-primary font-semibold mb-8">
            {t('highlights.languageSubtitle')}
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
          <SnakeFlowchart />
        </motion.div>

      </div>
    </SectionWrapper>
  );
}
