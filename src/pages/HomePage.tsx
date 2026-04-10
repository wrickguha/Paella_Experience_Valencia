import { useScrollToTop } from '@/hooks/useScrollReveal';
import HeroSection from '@/components/HeroSection';
import SocialProof from '@/components/SocialProof';
import ExperienceHighlights from '@/components/ExperienceHighlights';
import GalleryGrid from '@/components/GalleryGrid';
import HowItWorks from '@/components/HowItWorks';
import UpcomingEvents from '@/components/UpcomingEvents';
import Testimonials from '@/components/Testimonials';
import FinalCTA from '@/components/FinalCTA';

export default function HomePage() {
  useScrollToTop();

  return (
    <>
      <HeroSection />
      <SocialProof />
      <ExperienceHighlights />
      <GalleryGrid />
      <HowItWorks />
      <UpcomingEvents />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
