import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { fetchSettings } from '@/services/api';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ExperiencePage = lazy(() => import('@/pages/ExperiencePage'));
const BookingPage = lazy(() => import('@/pages/BookingPage'));
const PaymentPage = lazy(() => import('@/pages/PaymentPage'));
const PaymentReturnPage = lazy(() => import('@/pages/PaymentReturnPage'));
const StripeReturnPage = lazy(() => import('@/pages/StripeReturnPage'));
const PaymentCancelPage = lazy(() => import('@/pages/PaymentCancelPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('@/pages/TermsOfServicePage'));
const CookiePolicyPage = lazy(() => import('@/pages/CookiePolicyPage'));

function LoadingFallback({ tagline = 'Speak. Cook. Connect' }: { tagline?: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #032451 0%, #021a3a 50%, #0a3a75 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        {/* Orb 1 */}
        <div style={{
          position: 'absolute', width: 480, height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,162,97,0.18) 0%, transparent 70%)',
          top: '-120px', left: '-160px',
          animation: 'orb-drift 8s ease-in-out infinite alternate',
        }} />
        {/* Orb 2 */}
        <div style={{
          position: 'absolute', width: 360, height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,163,115,0.14) 0%, transparent 70%)',
          bottom: '-80px', right: '-100px',
          animation: 'orb-drift 10s ease-in-out infinite alternate-reverse',
        }} />
        {/* Orb 3 — centre glow */}
        <div style={{
          position: 'absolute', width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,162,97,0.07) 0%, transparent 65%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'pulse-slow 4s ease-in-out infinite',
        }} />
      </div>

      {/* Floating food particles */}
      {[
        { emoji: '🥘', x: '12%', y: '20%', delay: '0s',   dur: '6s',  size: 28 },
        { emoji: '🍷', x: '82%', y: '15%', delay: '1.2s', dur: '7s',  size: 24 },
        { emoji: '🫒', x: '70%', y: '75%', delay: '0.6s', dur: '8s',  size: 20 },
        { emoji: '🌿', x: '18%', y: '72%', delay: '2s',   dur: '9s',  size: 22 },
        { emoji: '🧅', x: '88%', y: '48%', delay: '1.8s', dur: '6.5s',size: 18 },
        { emoji: '🥄', x: '6%',  y: '50%', delay: '0.4s', dur: '7.5s',size: 20 },
        { emoji: '🌶️', x: '55%', y: '8%',  delay: '1.5s', dur: '8.5s',size: 22 },
        { emoji: '🧆', x: '38%', y: '85%', delay: '0.9s', dur: '7s',  size: 20 },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            fontSize: p.size,
            opacity: 0.55,
            animation: `float-particle ${p.dur} ${p.delay} ease-in-out infinite alternate`,
            filter: 'blur(0.3px)',
            userSelect: 'none',
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

        {/* Logo plate */}
        <div style={{
          width: 90, height: 90,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(8px)',
          border: '1.5px solid rgba(244,162,97,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
          boxShadow: '0 0 40px rgba(244,162,97,0.25), inset 0 0 20px rgba(255,255,255,0.04)',
          animation: 'logo-pulse 3s ease-in-out infinite',
        }}>
          {/* Paella pan icon */}
          <span style={{ fontSize: 42, lineHeight: 1, animation: 'icon-spin 12s linear infinite' }}>🥘</span>
        </div>

        {/* Brand name */}
        <div style={{
          fontFamily: '"Great Vibes", cursive',
          fontSize: 52,
          color: '#f4a261',
          letterSpacing: '0.02em',
          lineHeight: 1,
          marginBottom: 6,
          animation: 'fade-up 0.8s ease-out both',
          textShadow: '0 2px 20px rgba(244,162,97,0.4)',
        }}>
          SpeakEasy Valencia
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          marginBottom: 44,
          animation: 'fade-up 0.8s 0.2s ease-out both',
        }}>
          {tagline}
        </p>

        {/* Progress bar */}
        <div style={{
          width: 200,
          height: 3,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.1)',
          overflow: 'hidden',
          marginBottom: 18,
          animation: 'fade-up 0.6s 0.4s ease-out both',
        }}>
          <div style={{
            height: '100%',
            borderRadius: 99,
            background: 'linear-gradient(90deg, transparent, #f4a261, #d4a373, #f4a261, transparent)',
            backgroundSize: '300% 100%',
            animation: 'shimmer 1.8s ease-in-out infinite',
          }} />
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 8, animation: 'fade-up 0.6s 0.5s ease-out both' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 7, height: 7,
                borderRadius: '50%',
                background: '#f4a261',
                opacity: 0.8,
                animation: `dot-bounce 1.4s ${i * 0.22}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes orb-drift {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 20px) scale(1.08); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.06); }
        }
        @keyframes float-particle {
          0%   { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-18px) rotate(12deg); }
        }
        @keyframes logo-pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(244,162,97,0.25), inset 0 0 20px rgba(255,255,255,0.04); }
          50%       { box-shadow: 0 0 70px rgba(244,162,97,0.45), inset 0 0 30px rgba(255,255,255,0.07); }
        }
        @keyframes icon-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%            { transform: scale(1.3); opacity: 1; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}


const SPLASH_MS = 1500; // minimum splash display time in ms
const FADE_MS   = 500;  // fade-out duration in ms

/**
 * Renders children immediately (painted behind the overlay),
 * then overlays the splash screen for SPLASH_MS and fades it out.
 * This eliminates layout-shift glitches from the old approach.
 */
function SplashGate({ children }: { children: React.ReactNode }) {
  const [fading,  setFading]  = useState(false);
  const [gone,    setGone]    = useState(false);
  const [tagline, setTagline] = useState('Speak. Cook. Connect');

  useEffect(() => {
    fetchSettings('general')
      .then((s) => {
        if (s.hero_tagline) setTagline(s.hero_tagline);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // After minimum display time → start fade-out
    const fadeTimer = setTimeout(() => setFading(true), SPLASH_MS);
    // After fade completes → remove overlay entirely
    const goneTimer = setTimeout(() => setGone(true),  SPLASH_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  return (
    <>
      {/* App content renders immediately underneath — no layout shift */}
      {children}

      {/* Fixed overlay fades out, then disappears */}
      {!gone && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            opacity: fading ? 0 : 1,
            transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            pointerEvents: fading ? 'none' : 'all',
          }}
        >
          <LoadingFallback tagline={tagline} />
        </div>
      )}
    </>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  if (isLoading) return <LoadingFallback />;
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  if (user) return <Navigate to={redirectTo || '/profile'} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <SplashGate>
        <AuthProvider>
          <AuthGate>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/experience" element={<ExperiencePage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/payment/success" element={<PaymentReturnPage />} />
                <Route path="/payment/stripe/success" element={<StripeReturnPage />} />
                <Route path="/payment/cancel" element={<PaymentCancelPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              </Route>
            </Routes>
          </Suspense>
          </AuthGate>
        </AuthProvider>
      </SplashGate>
    </BrowserRouter>
  );
}
