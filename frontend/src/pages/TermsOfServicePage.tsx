import { useScrollToTop } from '@/hooks/useScrollReveal';
import SectionWrapper from '@/components/SectionWrapper';

export default function TermsOfServicePage() {
  useScrollToTop();

  return (
    <SectionWrapper className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-neutral-dark mb-8">Terms of Service</h1>
        <div className="prose prose-lg text-neutral-gray font-body space-y-6">
          
          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">1. Agreement to Terms</h2>
          <p>By accessing our website and booking an experience with Speak Easy Valencia, you agree to be bound by these Terms of Service.</p>
          
          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">2. Booking and Payments</h2>
          <p>All bookings are subject to availability. Full payment is required at the time of booking to secure your spot. We use secure third-party payment processors to handle all transactions.</p>

          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">3. Cancellations and Refunds</h2>
          <p>Cancellations made up to 48 hours before the scheduled experience will receive a full refund. Cancellations made within 48 hours of the experience are non-refundable. Speak Easy Valencia reserves the right to cancel an experience due to unforeseen circumstances, in which case a full refund or rescheduling option will be provided.</p>

          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">4. Participant Responsibilities</h2>
          <p>Participants are expected to behave respectfully towards our hosts, staff, and other guests. Please inform us of any severe food allergies or dietary restrictions at the time of booking. We are not liable for any allergic reactions or incidents arising from undisclosed conditions.</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
