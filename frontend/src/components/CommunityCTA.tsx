import { motion } from 'framer-motion';
import { FiMessageSquare } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function CommunityCTA() {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      <motion.a
        href="https://chat.whatsapp.com/GX50u60PdMn0ZEk4bWfTIT"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="pointer-events-auto flex items-center gap-3 bg-[#25D366] text-white px-6 py-3 rounded-full shadow-elevated group relative"
      >
        <span className="font-heading font-semibold text-sm hidden group-hover:block transition-all duration-300">
          {t('cta.join_whatsapp')}
        </span>
        <FiMessageSquare size={24} fill="currentColor" />

        
        {/* Pulse Effect */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 -z-10" />
      </motion.a>
    </div>
  );
}
