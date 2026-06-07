import { useScrollToTop } from '@/hooks/useScrollReveal';
import SectionWrapper from '@/components/SectionWrapper';

export default function PrivacyPolicyPage() {
  useScrollToTop();

  return (
    <SectionWrapper className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-neutral-dark mb-2">Privacy Policy</h1>
        <p className="text-sm text-neutral-gray mb-8">Last Updated: June 7, 2026</p>
        <div className="prose prose-lg text-neutral-gray font-body space-y-6">
          
          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when booking an experience, subscribing to our newsletter, or contacting us. This may include your name, email address, phone number, dietary requirements, and payment information.</p>
          
          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process your bookings and payments</li>
            <li>Communicate with you regarding your experience</li>
            <li>Send you marketing communications (if you have opted in)</li>
            <li>Improve our services and website experience</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">3. Data Sharing and Security</h2>
          <p>We do not sell your personal information. We may share your data with trusted third-party service providers (such as payment processors including PayPal and Stripe) only to the extent necessary to provide our services. We implement appropriate security measures to protect your personal information.</p>

          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">4. Your Rights (GDPR)</h2>
          <p>Under the General Data Protection Regulation (GDPR), you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the personal data we hold about you</li>
            <li>Correct any inaccurate or incomplete data</li>
            <li>Request deletion of your personal data</li>
            <li>Withdraw consent for marketing communications at any time</li>
            <li>Lodge a complaint with the Spanish data protection authority (AEPD) at <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.aepd.es</a></li>
          </ul>
          <p>To exercise any of these rights, please contact us at: <a href="mailto:gene@speakeasyvalencia.com" className="text-primary hover:underline">gene@speakeasyvalencia.com</a></p>

          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">5. Data Retention</h2>
          <p>We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected, or as required by law. Booking data is typically retained for up to 2 years.</p>

          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">6. Contact</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:info@speakeasyvalencia.com" className="text-primary hover:underline">info@speakeasyvalencia.com</a></p>
        </div>
      </div>
    </SectionWrapper>
  );
}

