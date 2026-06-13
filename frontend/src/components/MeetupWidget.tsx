import { useLocation } from 'react-router-dom';

const MEETUP_URL =
  'https://meetup.com/speakeasy-valencia?member_id=399615136';

/** URL path segments that are considered payment / checkout pages. */
const PAYMENT_PATHS = ['/payment', '/checkout', '/pay', '/order'];

/** Meetup SVG logo — the iconic red "M" mark used on meetup.com */
function MeetupIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Circle background (white, slightly transparent) */}
      <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.18)" />
      {/* Meetup "M" swash — simplified faithful recreation */}
      <text
        x="50%"
        y="52%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="'Arial Black', 'Impact', sans-serif"
        fontWeight="900"
        fontSize="24"
        fill="white"
        letterSpacing="-1"
      >
        M
      </text>
    </svg>
  );
}

export default function MeetupWidget() {
  const { pathname } = useLocation();

  // Hide on any payment / checkout related path
  const isPaymentPage = PAYMENT_PATHS.some((segment) =>
    pathname.toLowerCase().includes(segment),
  );
  if (isPaymentPage) return null;

  return (
    <>
      <a
        id="meetup-widget-btn"
        href={MEETUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Find us on Meetup"
        style={{
          position: 'fixed',
          zIndex: 9000,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: '#ED1C40',
          color: '#ffffff',
          borderRadius: 50,
          padding: '10px 18px 10px 12px',
          boxShadow:
            '0 4px 18px rgba(237,28,64,0.45), 0 2px 6px rgba(0,0,0,0.18)',
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
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, bottom 0.2s ease',
        }}
        /* hover handled via CSS class below */
        className="meetup-widget"
      >
        <MeetupIcon size={26} />
        <span className="meetup-widget-label">Find us on Meetup</span>
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
          box-shadow: 0 8px 28px rgba(237,28,64,0.55), 0 4px 10px rgba(0,0,0,0.22);
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
