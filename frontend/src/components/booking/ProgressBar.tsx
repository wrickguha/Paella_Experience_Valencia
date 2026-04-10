import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { WizardStep } from '@/hooks/useBooking';

interface Props {
  steps: WizardStep[];
  currentIndex: number;
}

export default function ProgressBar({ steps, currentIndex }: Props) {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto mb-10">
      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={step} className="flex flex-col items-center flex-1">
              {/* Connector line + dot */}
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div className="flex-1 h-0.5 mx-1">
                    <motion.div
                      className="h-full"
                      initial={false}
                      animate={{
                        backgroundColor: isCompleted || isCurrent ? '#E67E22' : '#E8DFD0',
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                    backgroundColor: isCompleted
                      ? '#E67E22'
                      : isCurrent
                        ? '#E67E22'
                        : '#E8DFD0',
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    i === 0 ? '' : ''
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-neutral-gray'}`}>
                      {i + 1}
                    </span>
                  )}
                </motion.div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1">
                    <motion.div
                      className="h-full"
                      initial={false}
                      animate={{
                        backgroundColor: isCompleted ? '#E67E22' : '#E8DFD0',
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
              {/* Label */}
              <span
                className={`text-[10px] sm:text-xs mt-2 font-medium text-center transition-colors ${
                  isCompleted || isCurrent ? 'text-primary' : 'text-neutral-gray'
                }`}
              >
                {t(`booking.steps.${step}`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
