import { useScrollToTop } from '@/hooks/useScrollReveal';
import SectionWrapper from '@/components/SectionWrapper';

export default function PrivacyPolicyPage() {
  useScrollToTop();

  return (
    <SectionWrapper className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-neutral-dark mb-8">Privacy Policy</h1>
        <div className="prose prose-lg text-neutral-gray font-body space-y-6">
          
          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when booking an experience, subscribing to our newsletter, or contacting us. This may include your name, email address, phone number, dietary requirements, and payment information.</p>
          
          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process your bookings and payments.</li>
            <li>Communicate with you regarding your experience.</li>
            <li>Send you marketing communications (if you have opted in).</li>
            <li>Improve our services and website experience.</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">3. Data Sharing and Security</h2>
          <p>We do not sell your personal information. We may share your data with trusted third-party service providers (such as payment processors) only to the extent necessary to provide our services. We implement appropriate security measures to protect your personal information.</p>

          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">4. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. To exercise these rights or if you have any questions about our privacy practices, please contact us.</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
