import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaInstagram, FaFacebookF, FaYoutube, FaTiktok } from 'react-icons/fa';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary text-white">
      <div className="container-max px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/speakeasylogo.jpeg" alt="SpeakEasy Valencia Logo" className="w-12 h-12 object-cover rounded-xl" />
              <span className="font-script text-3xl font-bold">SpeakEasy Valencia</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-modern font-semibold text-sm uppercase tracking-wider mb-4">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/experience', label: t('nav.experience') },
                { to: '/language-tests', label: t('nav.languageTests') },
                { to: '/booking', label: t('nav.booking') },
                { to: '/contact', label: t('nav.contact') },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 text-sm hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-modern font-semibold text-sm uppercase tracking-wider mb-4">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className="text-gray-400 text-sm hover:text-accent transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-gray-400 text-sm hover:text-accent transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-gray-400 text-sm hover:text-accent transition-colors">
                  {t('footer.cookies')}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-cookie-settings'));
                  }}
                  className="text-gray-400 text-sm hover:text-accent transition-colors text-left font-modern focus:outline-none"
                >
                  {t('cookieConsent.settings')}
                </button>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-modern font-semibold text-sm uppercase tracking-wider mb-4">
              {t('footer.followUs')}
            </h4>
            <div className="flex gap-4">
              {[
                {
                  name: 'Instagram',
                  url: 'https://www.instagram.com/speakeasyvalencia?igsh=MWpmbjAwZjN5cjZsYg==',
                  icon: <FaInstagram className="w-5 h-5" />
                },
                {
                  name: 'Facebook',
                  url: 'https://www.facebook.com/share/18aMiVTDqF/',
                  icon: <FaFacebookF className="w-5 h-5" />
                },
                {
                  name: 'TikTok',
                  url: 'https://www.tiktok.com/@speakeasyvalencia?is_from_webapp=1&sender_device=pc',
                  icon: <FaTiktok className="w-5 h-5" />
                },
                {
                  name: 'YouTube',
                  url: 'https://youtube.com/@speakeasyvalencia?si=Lr6AeePW3zitpCNN',
                  icon: <FaYoutube className="w-5 h-5" />
                }
              ].map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center
                             hover:bg-accent hover:text-white transition-colors"
                  aria-label={platform.name}
                >
                  {platform.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
