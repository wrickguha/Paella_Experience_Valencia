import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/experience', label: t('nav.experience') },
    { to: '/booking', label: t('nav.booking') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-soft">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🥘</span>
            </div>
            <span className="font-display text-xl font-bold text-neutral-dark hidden sm:block">
              Paella Experience
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-body text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.to
                    ? 'text-primary'
                    : 'text-neutral-gray'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                         text-neutral-gray hover:text-neutral-dark hover:bg-neutral-beige transition-all"
            >
              <span className="text-base">{i18n.language === 'en' ? '🇬🇧' : '🇪🇸'}</span>
              <span className="uppercase">{i18n.language}</span>
            </button>
            <Link to="/booking" className="btn-primary !py-3 !px-6 !text-sm">
              {t('nav.bookNow')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-beige transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={`block h-0.5 w-6 bg-neutral-dark rounded transition-all ${
                  isOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-neutral-dark rounded transition-all ${
                  isOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-neutral-dark rounded transition-all ${
                  isOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-neutral-beige overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2 font-body text-base font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-primary'
                      : 'text-neutral-gray'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-4 pt-4 border-t border-neutral-beige">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                             text-neutral-gray hover:bg-neutral-beige transition-all"
                >
                  <span>{i18n.language === 'en' ? '🇬🇧' : '🇪🇸'}</span>
                  <span className="uppercase">{i18n.language}</span>
                </button>
                <Link
                  to="/booking"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary !py-3 !px-6 !text-sm flex-1 text-center"
                >
                  {t('nav.bookNow')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
