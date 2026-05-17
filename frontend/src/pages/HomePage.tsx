import { useScrollToTop } from '@/hooks/useScrollReveal';
import HeroSection from '@/components/HeroSection';
import SocialProof from '@/components/SocialProof';
import ExperienceHighlights from '@/components/ExperienceHighlights';
import GalleryGrid from '@/components/GalleryGrid';
import HowItWorks from '@/components/HowItWorks';
import UpcomingEvents from '@/components/UpcomingEvents';
import Testimonials from '@/components/Testimonials';
import FinalCTA from '@/components/FinalCTA';
import CommunitySection from '@/components/CommunitySection';
import VideoTestimonialsSection from '@/components/VideoTestimonialsSection';
import LanguageSection from '@/components/LanguageSection';
import ActivitiesSection from '@/components/ActivitiesSection';
import SpanishLevelTest from '@/components/SpanishLevelTest';
import ExperienceFlowSection from '@/components/ExperienceFlowSection';
import CommunityCTA from '@/components/CommunityCTA';
import FancyButton from '@/components/ui/FancyButton';

export default function HomePage() {
  useScrollToTop();

  return (
    <>
      <HeroSection />
      <SocialProof />
      <ExperienceHighlights />
      <CommunitySection />
      <VideoTestimonialsSection />
      <LanguageSection />
      <ActivitiesSection />
      <SpanishLevelTest />
      <ExperienceFlowSection />
      <GalleryGrid />
      <HowItWorks />
      <UpcomingEvents />
      <Testimonials />
      <FinalCTA />

      <CommunityCTA />


      <div className="fixed bottom-6 right-6 z-50">
        <FancyButton />
      </div>

    </>
  );
}
