import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "./ui/Button";
import { fetchSettings } from "@/services/api";

export default function HeroSection() {
  const { t } = useTranslation();
  const [videoUrl, setVideoUrl] = useState("/video/hero-video.mp4");

  useEffect(() => {
    fetchSettings("general")
      .then((settings) => {
        if (settings.hero_video) {
          const path = settings.hero_video;
          const fullUrl = path.startsWith("http") || path.startsWith("/") || path.startsWith("video/")
            ? path
            : `/storage/${path}`;
          setVideoUrl(fullUrl);
        }
      })
      .catch(() => {});
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center">
      {/* Video background */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          key={videoUrl}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="container-max relative z-10 px-8 sm:px-12 lg:px-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          <motion.h1
            variants={itemVariants}
            className="font-modern text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-white/95 font-body font-medium mb-10 max-w-3xl leading-relaxed drop-shadow-md"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 items-center"
          >
            <Link to="/booking" className="btn-uiverse">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
              <span className="now">Let's Go!</span>
              <span className="play">{t("hero.cta")}</span>
            </Link>
            <Button variant="premium" href="/experience" className="!px-10 !py-5">
              {t("hero.scrollDown")}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/80 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

