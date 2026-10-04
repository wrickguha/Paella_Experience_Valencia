import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiClock,
  FiCalendar,
  FiUser,
  FiShare2,
  FiCheck,
  FiEye,
  FiArrowRight,
  FiBookOpen,
} from 'react-icons/fi';
import { FaTwitter, FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import { fetchBlogPostBySlug, type BlogPost } from '@/services/api';
import { useScrollToTop } from '@/hooks/useScrollReveal';

export default function BlogDetailPage() {
  useScrollToTop();
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('es') ? 'es' : 'en';

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);

    fetchBlogPostBySlug(slug, lang)
      .then((data) => {
        setPost(data.post);
        setRelated(data.related);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [slug, lang]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post?.title || '');

  // Render markdown-like content simply and safely
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = (key: string) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={key} className="space-y-2.5 my-6 pl-4">
            {listItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-neutral-dark text-base sm:text-lg leading-relaxed">
                <span className="w-2 h-2 rounded-full bg-accent mt-2.5 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const formatInline = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-neutral-dark">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-sm text-primary">$1</code>');
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Heading 2
      if (trimmed.startsWith('## ')) {
        flushList(`list-${idx}`);
        elements.push(
          <h2
            key={`h2-${idx}`}
            className="font-display text-2xl sm:text-3xl font-bold text-primary mt-12 mb-4 pt-4 border-t border-gray-100 leading-snug"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      // Heading 3
      else if (trimmed.startsWith('### ')) {
        flushList(`list-${idx}`);
        elements.push(
          <h3
            key={`h3-${idx}`}
            className="font-display text-xl sm:text-2xl font-bold text-primary mt-8 mb-3 leading-snug"
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      // Blockquote
      else if (trimmed.startsWith('> ')) {
        flushList(`list-${idx}`);
        elements.push(
          <blockquote
            key={`quote-${idx}`}
            className="my-8 pl-6 py-4 pr-6 bg-accent/5 border-l-4 border-accent rounded-r-2xl text-lg sm:text-xl font-body italic text-neutral-dark leading-relaxed"
          >
            {trimmed.replace(/^>\s*"?/, '').replace(/"?$/, '')}
          </blockquote>
        );
      }
      // Bullet list
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        listItems.push(trimmed.replace(/^[-*]\s+/, ''));
      }
      // Numbered list
      else if (/^\d+\.\s+/.test(trimmed)) {
        listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
      }
      // Horizontal Rule
      else if (trimmed === '---') {
        flushList(`list-${idx}`);
        elements.push(<hr key={`hr-${idx}`} className="my-10 border-gray-200" />);
      }
      // Paragraph
      else if (trimmed.length > 0) {
        flushList(`list-${idx}`);
        elements.push(
          <p
            key={`p-${idx}`}
            className="text-base sm:text-lg text-neutral-dark/90 font-body leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
          />
        );
      }
    });

    flushList(`list-final`);
    return elements;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center pt-24 pb-16">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-neutral-gray">
            {lang === 'es' ? 'Cargando artículo...' : 'Loading article...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center pt-24 pb-16 px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-gray-200 shadow-card">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <FiBookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-primary mb-2">
            {lang === 'es' ? 'Artículo no encontrado' : 'Article Not Found'}
          </h2>
          <p className="text-sm text-neutral-gray mb-6">
            {lang === 'es'
              ? 'El artículo que buscas no existe o ha sido movido.'
              : 'The article you are looking for does not exist or has been removed.'}
          </p>
          <Link to="/blog" className="btn-primary !px-6 !py-3 !text-sm inline-flex items-center gap-2">
            <FiArrowLeft className="w-4 h-4" />
            <span>{lang === 'es' ? 'Volver al Blog' : 'Back to Blog'}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-main min-h-screen">
      {/* ── Top Header / Breadcrumb ─────────────────────────────────── */}
      <section className="bg-primary text-white pt-28 pb-16 sm:pt-32 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute -top-32 right-1/4 w-96 h-96 rounded-full bg-accent blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-primary-light blur-3xl" />
        </div>

        <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-accent hover:text-white transition-colors mb-6 font-medium group"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{lang === 'es' ? 'Volver a todos los artículos' : 'Back to all articles'}</span>
          </Link>

          {/* Meta & Category */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300 mb-5">
            {post.category && (
              <Link
                to={`/blog?category=${post.category.slug}`}
                className="bg-accent text-white font-semibold px-3 py-1 rounded-full hover:bg-accent-alt transition-colors shadow-sm"
              >
                {post.category.name}
              </Link>
            )}
            <span className="flex items-center gap-1.5">
              <FiClock className="w-4 h-4 text-accent" />
              {post.reading_time}
            </span>
            <span>•</span>
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <FiCalendar className="w-4 h-4 text-accent" />
                {new Date(post.published_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            {post.views_count > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <FiEye className="w-4 h-4" />
                  {post.views_count} {lang === 'es' ? 'vistas' : 'views'}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg sm:text-xl text-gray-200 font-body leading-relaxed mb-8">
              {post.excerpt}
            </p>
          )}

          {/* Author & Share Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-primary font-bold overflow-hidden border-2 border-accent/40">
                {post.author_avatar ? (
                  <img src={post.author_avatar} alt={post.author_name} className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="w-6 h-6 text-accent" />
                )}
              </div>
              <div>
                <p className="text-base font-semibold text-white">{post.author_name}</p>
                <p className="text-xs text-accent">{post.author_role}</p>
              </div>
            </div>

            {/* Social Share */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300 font-medium mr-1 flex items-center gap-1">
                <FiShare2 className="w-3.5 h-3.5" /> {lang === 'es' ? 'Compartir:' : 'Share:'}
              </span>
              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent text-white flex items-center justify-center transition-colors text-xs"
                title="Share on X / Twitter"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent text-white flex items-center justify-center transition-colors text-xs"
                title="Share on Facebook"
              >
                <FaFacebookF className="w-4 h-4" />
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors text-xs"
                title="Share on WhatsApp"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Copy link"
              >
                {copied ? (
                  <>
                    <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">{lang === 'es' ? '¡Copiado!' : 'Copied!'}</span>
                  </>
                ) : (
                  <span>{lang === 'es' ? 'Copiar enlace' : 'Copy link'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Article Body ────────────────────────────────────────── */}
      <article className="container-max px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">
        {/* Featured Image */}
        {post.featured_image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-12 rounded-3xl overflow-hidden border border-gray-200/80 shadow-card -mt-16 sm:-mt-20 relative z-20 bg-white"
          >
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full max-h-[550px] object-cover"
            />
          </motion.div>
        )}

        {/* Article Body Content */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-gray-200/80 shadow-sm">
          <div className="prose max-w-none">
            {renderFormattedContent(post.content)}
          </div>

          {/* Article Footer Tags & Actions */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-gray font-semibold uppercase tracking-wider">
                {lang === 'es' ? 'Categoría:' : 'Category:'}
              </span>
              {post.category && (
                <Link
                  to={`/blog?category=${post.category.slug}`}
                  className="text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1 rounded-full transition-colors"
                >
                  #{post.category.name}
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-xs font-semibold text-neutral-dark hover:text-accent flex items-center gap-1.5 transition-colors"
              >
                <FiShare2 className="w-4 h-4" />
                {copied
                  ? lang === 'es'
                    ? '¡Enlace copiado!'
                    : 'Link copied!'
                  : lang === 'es'
                  ? 'Compartir este artículo'
                  : 'Share this story'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Author Bio Card ───────────────────────────────────────── */}
        <div className="mt-10 bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-accent/30 shrink-0">
            {post.author_avatar ? (
              <img src={post.author_avatar} alt={post.author_name} className="w-full h-full object-cover" />
            ) : (
              <FiUser className="w-10 h-10 text-primary" />
            )}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h4 className="text-lg font-bold font-display text-primary">{post.author_name}</h4>
            <p className="text-xs font-semibold text-accent mb-2">{post.author_role}</p>
            <p className="text-sm text-neutral-gray leading-relaxed mb-4">
              {lang === 'es'
                ? 'Apasionado/a por las tradiciones auténticas valencianas, la sobremesa y conectar a viajeros de todo el mundo mediante experiencias culinarias memorables.'
                : 'Passionate about authentic Valencian traditions, the timeless ritual of sobremesa, and connecting people from around the globe through unforgettable wood-fired feasts.'}
            </p>
            <Link
              to="/experience"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-accent transition-colors"
            >
              <span>{lang === 'es' ? 'Conocer nuestras experiencias' : 'Meet us at an experience'}</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Keep Reading / Related Posts ──────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-display font-bold text-primary">
                {lang === 'es' ? 'Historias Relacionadas' : 'Keep Reading'}
              </h3>
              <Link
                to="/blog"
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
              >
                <span>{lang === 'es' ? 'Ver todo el blog' : 'Explore all stories'}</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/blog/${item.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="h-44 overflow-hidden bg-gray-100 relative">
                    {item.featured_image ? (
                      <img
                        src={item.featured_image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/30">
                        <FiBookOpen className="w-8 h-8" />
                      </div>
                    )}
                    {item.category && (
                      <span className="absolute top-2.5 left-2.5 bg-primary/90 text-white backdrop-blur-md text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {item.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-display text-base font-bold text-primary group-hover:text-accent transition-colors line-clamp-2 mb-2 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-neutral-gray line-clamp-2 mb-3">
                        {item.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-gray pt-2 border-t border-gray-100">
                      <span>{item.reading_time}</span>
                      <span className="text-accent font-semibold flex items-center gap-0.5">
                        {lang === 'es' ? 'Leer' : 'Read'} <FiArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom Booking CTA ────────────────────────────────────── */}
        <div className="mt-16 bg-gradient-to-r from-primary to-primary-light text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-elevated">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent bg-white/10 px-4 py-1 rounded-full">
              {lang === 'es' ? 'La Experiencia en Persona' : 'Live the Experience'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
              {lang === 'es'
                ? '¿Listo para Saborear la Auténtica Paella en Valencia?'
                : 'Ready to Taste Authentic Paella Over Orange Wood in Valencia?'}
            </h3>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-body">
              {lang === 'es'
                ? 'No te limites a leerlo. Únete a nuestro acogedor taller gastronómico, practica español con nosotros y rasca tu propia cucharada de socarrat.'
                : 'Reading about paella is wonderful; tasting it fresh from the wood-fired pan while speaking Spanish and laughing with international friends is unforgettable.'}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/booking" className="btn-primary !px-8 !py-4 !text-base">
                {lang === 'es' ? 'Reservar Mi Experiencia' : 'Book My Experience'}
              </Link>
              <Link
                to="/blog"
                className="px-6 py-4 rounded-xl border border-white/20 text-white hover:bg-white/10 text-sm font-semibold transition-colors"
              >
                {lang === 'es' ? 'Más Artículos' : 'Explore More Stories'}
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
