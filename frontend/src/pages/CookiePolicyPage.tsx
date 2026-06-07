import { useScrollToTop } from '@/hooks/useScrollReveal';
import SectionWrapper from '@/components/SectionWrapper';

export default function CookiePolicyPage() {
  useScrollToTop();

  return (
    <SectionWrapper className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-neutral-dark mb-2">Cookie Policy</h1>
        <p className="text-sm text-neutral-gray mb-8">Last Updated: June 7, 2026</p>
        <div className="prose prose-lg text-neutral-gray font-body space-y-6">
          
          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">1. What Are Cookies</h2>
          <p>Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the website owners.</p>
          
          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">2. How We Use Cookies</h2>
          <p>SpeakEasy Valencia uses cookies to enhance your browsing experience. We use them to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Remember your language and regional preferences</li>
            <li>Understand how you interact with our website (analytics)</li>
            <li>Keep your session secure during the booking process</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">3. Types of Cookies We Use</h2>
          <p><strong>Essential Cookies:</strong> Necessary for the website to function properly, such as secure login and booking processing. These cannot be disabled.</p>
          <p><strong>Analytics Cookies:</strong> Help us understand how visitors use our site so we can improve its performance and layout. These are only placed with your consent.</p>

          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">4. Managing Cookies</h2>
          <p>Most web browsers allow you to control cookies through their settings preferences. Please note that if you choose to disable cookies, some parts of our website may not function properly. You can also withdraw your consent at any time by clicking the cookie settings option at the bottom of our website.</p>

          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">5. Third-Party Cookies</h2>
          <p>We may use third-party services such as Google Analytics and payment processors (PayPal, Stripe) that place their own cookies. These are governed by their respective privacy policies.</p>

          <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4">6. Contact</h2>
          <p>If you have any questions about our Cookie Policy, please contact us at: <a href="mailto:info@speakeasyvalencia.com" className="text-primary hover:underline">info@speakeasyvalencia.com</a></p>
        </div>
      </div>
    </SectionWrapper>
  );
}

