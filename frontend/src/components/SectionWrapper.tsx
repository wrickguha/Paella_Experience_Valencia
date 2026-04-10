import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { ReactNode } from 'react';

interface SectionWrapperProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly id?: string;
}

export default function SectionWrapper({ children, className = '', id }: SectionWrapperProps) {
  const { ref, isInView } = useScrollReveal();

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`section-padding ${className}`}
    >
      <div className="container-max">
        {children}
      </div>
    </motion.section>
  );
}
