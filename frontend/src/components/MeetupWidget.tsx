import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchSettings } from '@/services/api';

/** URL path segments that are considered payment / checkout pages. */
const PAYMENT_PATHS = ['/payment', '/checkout', '/pay', '/order'];

/** Meetup SVG logo — the modern brand "swarm" logo mark used on meetup.com */
function MeetupIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6.98.555a.518.518 0 0 0-.105.011.53.53 0 1 0 .222 1.04.533.533 0 0 0 .409-.633.531.531 0 0 0-.526-.418zm6.455.638a.984.984 0 0 0-.514.143.99.99 0 1 0 1.02 1.699.99.99 0 0 0 .34-1.36.992.992 0 0 0-.846-.482zm-3.03 2.236a5.029 5.029 0 0 0-4.668 3.248 3.33 3.33 0 0 0-1.46.551 3.374 3.374 0 0 0-.94 4.562 3.634 3.634 0 0 0-.605 4.649 3.603 3.603 0 0 0 2.465 1.597c.018.732.238 1.466.686 2.114a3.9 3.9 0 0 0 5.423.992c.068-.047.12-.106.184-.157.987.881 2.47 1.026 3.607.24a2.91 2.91 0 0 0 1.162-1.69 4.238 4.238 0 0 0 2.584-.739 4.274 4.274 0 0 0 1.19-5.789 2.466 2.466 0 0 0 .433-3.308 2.448 2.448 0 0 0-1.316-.934 4.436 4.436 0 0 0-.776-2.873 4.467 4.467 0 0 0-5.195-1.656 5.106 5.106 0 0 0-2.773-.807zm-5.603.817a.759.759 0 0 0-.423.135.758.758 0 1 0 .863 1.248.757.757 0 0 0 .193-1.055.758.758 0 0 0-.633-.328zm15.994 2.37a.842.842 0 0 0-.47.151.845.845 0 1 0 1.175.215.845.845 0 0 0-.705-.365zm-8.15 1.028c.063 0 .124.005.182.014a.901.901 0 0 1 .45.187c.169.134.273.241.432.393.24.227.414.089.534.02.208-.122.369-.219.984-.208.633.011 1.363.237 1.514 1.317.168 1.199-1.966 4.289-1.817 5.722.106 1.01 1.815.299 1.96 1.22.186 1.198-2.136.753-2.667.493-.832-.408-1.337-1.34-1.12-2.26.16-.688 1.7-3.498 1.757-3.93.059-.44-.177-.476-.324-.484-.19-.01-.34.081-.526.362-.169.255-2.082 4.085-2.248 4.398-.296.56-.67.694-1.044.674-.548-.029-.798-.32-.72-.848.047-.31 1.26-3.049 1.323-3.476.039-.265-.013-.546-.275-.68-.263-.135-.572.07-.664.227-.128.215-1.848 4.706-2.032 5.038-.316.576-.65.76-1.152.784-1.186.056-2.065-.92-1.678-2.116.173-.532 1.316-4.571 1.895-5.599.389-.69 1.468-1.216 2.217-.892.387.167.925.437 1.084.507.366.163.759-.277.913-.412.155-.134.302-.276.49-.357.142-.06.343-.095.532-.094zm10.88 2.057a.468.468 0 0 0-.093.011.467.467 0 0 0-.36.555.47.47 0 0 0 .557.36.47.47 0 0 0 .36-.557.47.47 0 0 0-.464-.37zm-22.518.81a.997.997 0 0 0-.832.434 1 1 0 1 0 1.39-.258 1 1 0 0 0-.558-.176zm21.294 2.094a.635.635 0 0 0-.127.013.627.627 0 0 0-.48.746.628.628 0 0 0 .746.483.628.628 0 0 0 .482-.746.63.63 0 0 0-.621-.496zm-18.24 6.097a.453.453 0 0 0-.092.012.464.464 0 1 0 .195.908.464.464 0 0 0 .356-.553.465.465 0 0 0-.459-.367zm13.675 1.55a1.044 1.044 0 0 0-.583.187 1.047 1.047 0 1 0 1.456.265 1.044 1.044 0 0 0-.873-.451zM11.4 22.154a.643.643 0 0 0-.36.115.646.646 0 0 0-.164.899.646.646 0 0 0 .899.164.646.646 0 0 0 .164-.898.646.646 0 0 0-.54-.28z" />
    </svg>
  );
}

export default function MeetupWidget() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
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

  const meetupUrl = settings.footer_meetup_url || 'https://meetup.com/speakeasy-valencia?member_id=399615136';
  const langSuffix = i18n.language.startsWith('es') ? 'es' : 'en';
  const meetupText = settings[`footer_meetup_text_${langSuffix}`] || (langSuffix === 'es' ? 'Únete a nuestro grupo de Meetup' : 'Join Our Meetup Group');

  return (
    <>
      <a
        id="meetup-widget-btn"
        href={meetupUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={meetupText}
        style={{
          position: 'fixed',
          zIndex: 9000,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: '#F64060',
          color: '#ffffff',
          borderRadius: 50,
          padding: '10px 18px 10px 14px',
          boxShadow:
            '0 4px 18px rgba(246, 64, 96, 0.45), 0 2px 6px rgba(0, 0, 0, 0.18)',
          textDecoration: 'none',
          fontFamily: 'Montserrat, Inter, sans-serif',
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          // smooth entrance
          animation: 'meetup-pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
          animationDelay: '0.8s',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, bottom 0.3s ease, background-color 0.2s ease',
        }}
        /* hover handled via CSS class below */
        className="meetup-widget"
      >
        <MeetupIcon size={24} />
        <span className="meetup-widget-label">{meetupText}</span>
      </a>

      <style>{`
        /* Default position for desktop and tablets (bottom-left) */
        .meetup-widget {
          left: 20px;
          bottom: 24px;
        }

        /* Pop-in entrance */
        @keyframes meetup-pop-in {
          from { opacity: 0; transform: scale(0.6) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Desktop hover lift */
        .meetup-widget:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 8px 28px rgba(246, 64, 96, 0.55), 0 4px 10px rgba(0,0,0,0.22);
          background-color: #ff5272 !important;
        }
        .meetup-widget:active {
          transform: translateY(0) scale(0.97);
        }

        /* Mobile / Small Screens: shift up to clear the StickyMobileCTA bottom bar */
        @media (max-width: 767px) {
          .meetup-widget {
            bottom: 96px;
            left: 20px;
          }
        }

        /* Extra Small Mobile: hide label text, show icon-only pill */
        @media (max-width: 480px) {
          .meetup-widget {
            padding: 10px 12px;
            bottom: 92px;
            left: 16px;
          }
          .meetup-widget-label {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

