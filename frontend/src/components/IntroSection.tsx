import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

export default function IntroSection() {
  const { t } = useTranslation();

  return (
    <SectionWrapper className="bg-white pt-20 pb-12 sm:pt-24 sm:pb-16">
      <div className="max-w-4xl mx-auto text-center px-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-dark mb-6"
        >
          {t("intro.title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg sm:text-xl md:text-2xl text-neutral-gray font-body font-medium leading-relaxed"
        >
          {t("intro.subtitle")}
        </motion.p>
      </div>
    </SectionWrapper>
  );
}
