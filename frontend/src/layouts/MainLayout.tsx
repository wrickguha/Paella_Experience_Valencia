import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyMobileCTA from '@/components/StickyMobileCTA';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
