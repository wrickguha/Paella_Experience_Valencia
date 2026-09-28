import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMessageSquare } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { fetchSettings } from '@/services/api';

/** URL path segments that are considered payment / checkout pages. */
const PAYMENT_PATHS = ['/payment', '/checkout', '/pay', '/order'];

export default function CommunityCTA() {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

  // Hide on any payment / checkout related path
  const isPaymentPage = PAYMENT_PATHS.some((segment) =>
    pathname.toLowerCase().includes(segment),
  );
  if (isPaymentPage) return null;

  const langSuffix = i18n.language.startsWith('es') ? 'es' : 'en';
  const whatsappText =
    settings[`footer_whatsapp_text_${langSuffix}`] ||
    (langSuffix === 'es' ? 'Chatea con nosotros' : 'Chat with us');

  // Build WhatsApp URL from settings — strip non-digits so admin can paste in any format
  const rawPhone = settings.contact_whatsapp || '34695869040';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  return (
    <>
      <motion.a
        id="whatsapp-widget-btn"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={whatsappText}
        initial={{ opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        className="whatsapp-widget pointer-events-auto"
        style={{
          position: 'fixed',
          zIndex: 9000,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: '#25D366',
          color: '#ffffff',
          borderRadius: 50,
          padding: '10px 18px 10px 14px',
          boxShadow:
            '0 4px 18px rgba(37, 211, 102, 0.45), 0 2px 6px rgba(0, 0, 0, 0.18)',
          textDecoration: 'none',
          fontFamily: 'var(--site-font-family)',
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          animation:
            'whatsapp-pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
          animationDelay: '1s',
          transition:
            'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, bottom 0.3s ease, background-color 0.2s ease',
        }}
      >
        <FiMessageSquare size={22} fill="currentColor" />
        <span className="whatsapp-widget-label">{whatsappText}</span>

        {/* Pulse ring */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50px',
            backgroundColor: '#25D366',
            animation: 'whatsapp-ping 2s cubic-bezier(0,0,0.2,1) infinite',
            opacity: 0.25,
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
      </motion.a>

      <style>{`
        /* Position: bottom-right, same vertical alignment as Meetup widget */
        .whatsapp-widget {
          right: 20px;
          bottom: 24px;
        }

        @keyframes whatsapp-pop-in {
          from { opacity: 0; transform: scale(0.6) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes whatsapp-ping {
          75%, 100% { transform: scale(1.6); opacity: 0; }
        }

        /* Desktop hover */
        .whatsapp-widget:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 8px 28px rgba(37, 211, 102, 0.55), 0 4px 10px rgba(0,0,0,0.22);
          background-color: #2be674 !important;
        }
        .whatsapp-widget:active {
          transform: translateY(0) scale(0.97);
        }

        /* Mobile: shift up to clear StickyMobileCTA bottom bar */
        @media (max-width: 767px) {
          .whatsapp-widget {
            bottom: 96px;
            right: 20px;
          }
        }

        /* Extra small mobile: icon-only pill */
        @media (max-width: 480px) {
          .whatsapp-widget {
            padding: 10px 12px;
            bottom: 92px;
            right: 16px;
          }
          .whatsapp-widget-label {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
