import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function IntroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] bg-primary/5 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[10%] w-[40%] h-[50%] bg-accent/5 rounded-full blur-[100px]" 
        />
      </div>

      <div className="container-max relative z-10 px-6 sm:px-12 lg:px-16">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.5 }}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-primary/5 text-primary rounded-full flex items-center justify-center mb-8 border border-primary/10 shadow-sm"
          >
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </motion.div>
          
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-dark mb-8 tracking-tight leading-tight">
            {t("intro.title")}
          </h2>
          
          <p className="text-xl sm:text-2xl lg:text-3xl text-neutral-gray font-body font-medium leading-relaxed max-w-3xl mx-auto">
            {t("intro.subtitle")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
