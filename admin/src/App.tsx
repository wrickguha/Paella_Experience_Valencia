import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/layouts/AdminLayout';
import { Spinner } from '@/components/ui';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ExperiencesPage = lazy(() => import('@/pages/ExperiencesPage'));
const LocationsPage = lazy(() => import('@/pages/LocationsPage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const BookingsPage = lazy(() => import('@/pages/BookingsPage'));
const PaymentsPage = lazy(() => import('@/pages/PaymentsPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const TestimonialsPage = lazy(() => import('@/pages/TestimonialsPage'));
const FaqsPage = lazy(() => import('@/pages/FaqsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner /></div>}>
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="experiences" element={<ExperiencesPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="faqs" element={<FaqsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </Suspense>
  );
}
