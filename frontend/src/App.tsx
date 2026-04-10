import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ExperiencePage = lazy(() => import('@/pages/ExperiencePage'));
const BookingPage = lazy(() => import('@/pages/BookingPage'));
const PaymentPage = lazy(() => import('@/pages/PaymentPage'));
const PaymentReturnPage = lazy(() => import('@/pages/PaymentReturnPage'));
const PaymentCancelPage = lazy(() => import('@/pages/PaymentCancelPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-gray font-body text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/success" element={<PaymentReturnPage />} />
            <Route path="/payment/cancel" element={<PaymentCancelPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
