import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function StickyMobileCTA() {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-neutral-sand p-3">
      <Link
        to="/booking"
        className="btn-primary w-full block text-center !py-3.5 !text-base"
      >
        {t('nav.bookNow')}
      </Link>
    </div>
  );
}
