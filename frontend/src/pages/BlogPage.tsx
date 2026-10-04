import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiClock,
  FiCalendar,
  FiArrowRight,
  FiUser,
  FiMail,
  FiCheckCircle,
  FiStar,
  FiBookOpen,
  FiX,
} from 'react-icons/fi';
import {
  fetchBlogPosts,
  fetchBlogCategories,
  subscribeNewsletter,
  type BlogPost,
  type BlogCategory,
} from '@/services/api';
import SectionWrapper from '@/components/SectionWrapper';
import { useScrollToTop } from '@/hooks/useScrollReveal';

export default function BlogPage() {
  useScrollToTop();
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('es') ? 'es' : 'en';

  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  // Fetch categories on mount & language change
  useEffect(() => {
    fetchBlogCategories(lang)
      .then(setCategories)
      .catch(() => {});
  }, [lang]);

  // Fetch posts when category, search, or language changes
  useEffect(() => {
    setLoading(true);
    fetchBlogPosts({
      category: currentCategory !== 'all' ? currentCategory : undefined,
      search: activeSearch || undefined,
      lang,
    })
      .then((data) => {
        setFeaturedPost(data.featured);
        setPosts(data.posts);
      })
      .catch(() => {
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, [currentCategory, activeSearch, lang]);

  const handleCategorySelect = (slug: string) => {
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setSubscribeError(lang === 'es' ? 'Por favor introduce un correo válido.' : 'Please enter a valid email address.');
      return;
    }
    setSubscribing(true);
    setSubscribeError('');
    try {
      await subscribeNewsletter(newsletterEmail);
      setSubscribed(true);
      setNewsletterEmail('');
    } catch {
      setSubscribeError(
        lang === 'es' ? 'Hubo un error al suscribirte. Inténtalo de nuevo.' : 'Failed to subscribe. Please try again.'
      );
    } finally {
      setSubscribing(false);
    }
  };

  // Filter out featured post from the main grid if displaying "all" and no search to avoid duplicates
  const displayedPosts = useMemo(() => {
    if (!featuredPost || currentCategory !== 'all' || activeSearch) {
      return posts;
    }
    return posts.filter((p) => p.id !== featuredPost.id);
  }, [posts, featuredPost, currentCategory, activeSearch]);

  const totalArticleCount = useMemo(() => {
    return categories.reduce((sum, c) => sum + c.posts_count, 0);
  }, [categories]);

  return (
    <div className="bg-bg-main min-h-screen">
      {/* ── 1. Hero Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary text-white pt-24 pb-20 sm:pt-28 sm:pb-24">
        {/* Decorative background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-light/40 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
        </div>

        <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-accent text-xs font-semibold uppercase tracking-widest mb-6"
          >
            <FiStar className="w-3.5 h-3.5 text-accent" />
            {lang === 'es' ? 'El Cuaderno de Valencia' : 'The Valencia Journal & Stories'}
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6"
          >
            {lang === 'es'
              ? 'Historias Alrededor del Fuego: Paella, Cultura e Idiomas'
              : 'Stories from the Table: Paella, Culture & Language'}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-200 font-body max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {lang === 'es'
              ? 'Recetas tradicionales, secretos del socarrat, guías locales de Valencia y consejos para dominar el español disfrutando de la buena mesa.'
              : 'Authentic Valencian recipes, the secrets of crispy socarrat, neighborhood discoveries, and insights on mastering conversational Spanish around the table.'}
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            className="relative max-w-xl mx-auto"
          >
            <div className="relative flex items-center">
              <FiSearch className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  lang === 'es'
                    ? 'Buscar artículos por ingrediente, receta o tema...'
                    : 'Search articles, recipes, culture, socarrat...'
                }
                className="w-full pl-12 pr-24 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white/20 transition-all shadow-lg"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-24 text-gray-300 hover:text-white p-1"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-alt text-white text-sm font-semibold transition-all shadow-md active:scale-95"
              >
                {lang === 'es' ? 'Buscar' : 'Search'}
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* ── 2. Category Filter Pills ────────────────────────────────── */}
      <section className="sticky top-20 z-30 bg-bg-main/90 backdrop-blur-md border-b border-neutral-sand/60 py-4 shadow-sm">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => handleCategorySelect('all')}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                currentCategory === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-neutral-dark hover:bg-neutral-beige/60 border border-gray-200'
              }`}
            >
              <span>{lang === 'es' ? 'Todos los Artículos' : 'All Articles'}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  currentCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-neutral-gray'
                }`}
              >
                {totalArticleCount || posts.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isActive = currentCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-neutral-dark hover:bg-neutral-beige/60 border border-gray-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-neutral-gray'
                    }`}
                  >
                    {cat.posts_count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <main className="container-max px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Search Active Indicator */}
        {activeSearch && (
          <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-neutral-dark">
              {lang === 'es' ? 'Resultados para la búsqueda:' : 'Search results for:'}{' '}
              <span className="font-bold text-primary font-mono">"{activeSearch}"</span>
            </p>
            <button
              onClick={handleClearSearch}
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <FiX className="w-3.5 h-3.5" />
              {lang === 'es' ? 'Limpiar filtro' : 'Clear search'}
            </button>
          </div>
        )}

        {/* ── 3. Featured Article (Hero Card) ─────────────────────── */}
        {featuredPost && currentCategory === 'all' && !activeSearch && !loading && (
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-accent font-modern">
                  {lang === 'es' ? 'Artículo Destacado' : 'Featured Story'}
                </span>
              </div>

              <Link
                to={`/blog/${featuredPost.slug}`}
                className="group relative block bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-card hover:shadow-elevated transition-all duration-500"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Image side */}
                  <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden">
                    {featuredPost.featured_image ? (
                      <img
                        src={featuredPost.featured_image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <FiBookOpen className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                    {featuredPost.category && (
                      <span className="absolute top-4 left-4 bg-primary/90 text-white backdrop-blur-md text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                        {featuredPost.category.name}
                      </span>
                    )}
                  </div>

                  {/* Text side */}
                  <div className="lg:col-span-5 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
                    <div>
                      {/* Category & Meta */}
                      <div className="hidden lg:flex items-center gap-3 text-xs text-neutral-gray mb-4">
                        {featuredPost.category && (
                          <span className="bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full">
                            {featuredPost.category.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3.5 h-3.5 text-accent" />
                          {featuredPost.reading_time}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-primary group-hover:text-accent transition-colors duration-300 leading-snug mb-4">
                        {featuredPost.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-neutral-gray font-body text-base leading-relaxed line-clamp-3 mb-6">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    {/* Author & CTA */}
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-accent/40">
                          {featuredPost.author_avatar ? (
                            <img
                              src={featuredPost.author_avatar}
                              alt={featuredPost.author_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiUser className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-dark">{featuredPost.author_name}</p>
                          <p className="text-xs text-neutral-gray">{featuredPost.author_role}</p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-sm font-bold text-accent group-hover:translate-x-1 transition-transform duration-300">
                        <span>{lang === 'es' ? 'Leer historia' : 'Read Story'}</span>
                        <FiArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        )}

        {/* ── 4. Latest Articles Grid ───────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary">
                {currentCategory === 'all'
                  ? lang === 'es'
                    ? 'Últimos Artículos'
                    : 'Latest Articles'
                  : categories.find((c) => c.slug === currentCategory)?.name || 'Articles'}
              </h2>
              <p className="text-sm text-neutral-gray mt-1">
                {lang === 'es'
                  ? 'Explora nuestras crónicas gastronómicas y lecciones culturales'
                  : 'Explore culinary guides, local stories, and language lessons'}
              </p>
            </div>
            <span className="text-xs font-semibold text-neutral-gray bg-white px-3 py-1.5 rounded-full border border-gray-200">
              {displayedPosts.length} {lang === 'es' ? 'artículos' : 'articles'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                  <div className="h-52 bg-gray-200" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-6 bg-gray-200 rounded w-4/5" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 text-accent">
                <FiBookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-display text-primary mb-2">
                {lang === 'es' ? 'No se encontraron artículos' : 'No articles found'}
              </h3>
              <p className="text-sm text-neutral-gray mb-6">
                {lang === 'es'
                  ? 'Prueba con otra palabra de búsqueda o selecciona otra categoría.'
                  : 'Try searching for different keywords or explore other categories.'}
              </p>
              <button
                onClick={() => {
                  handleClearSearch();
                  handleCategorySelect('all');
                }}
                className="btn-primary !px-6 !py-3 !text-sm"
              >
                {lang === 'es' ? 'Ver todos los artículos' : 'View all articles'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPosts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-card hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* Article Thumbnail */}
                  <Link to={`/blog/${post.slug}`} className="relative h-52 overflow-hidden bg-gray-100 block">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/30">
                        <FiBookOpen className="w-12 h-12" />
                      </div>
                    )}
                    {post.category && (
                      <span className="absolute top-3 left-3 bg-primary/90 text-white backdrop-blur-md text-[11px] font-semibold px-2.5 py-1 rounded-full shadow">
                        {post.category.name}
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                      <FiClock className="w-3 h-3 text-accent" />
                      {post.reading_time}
                    </span>
                  </Link>

                  {/* Article Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Date */}
                      {post.published_at && (
                        <p className="text-xs text-neutral-gray flex items-center gap-1 mb-2.5">
                          <FiCalendar className="w-3 h-3" />
                          {new Date(post.published_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      )}

                      {/* Title */}
                      <Link to={`/blog/${post.slug}`}>
                        <h3 className="font-display text-xl font-bold text-primary group-hover:text-accent transition-colors duration-200 line-clamp-2 mb-3 leading-snug">
                          {post.title}
                        </h3>
                      </Link>

                      {/* Excerpt */}
                      <p className="text-sm text-neutral-gray leading-relaxed line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Bottom Author & Link */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <span className="text-xs font-medium text-neutral-dark truncate max-w-[150px]">
                        {post.author_name}
                      </span>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-accent group-hover:translate-x-1 transition-transform"
                      >
                        <span>{lang === 'es' ? 'Leer' : 'Read'}</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── 5. Newsletter / CTA Section ────────────────────────────── */}
      <section className="bg-primary text-white py-20 relative overflow-hidden mt-16">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-40 right-0 w-96 h-96 rounded-full bg-accent blur-3xl" />
          <div className="absolute -bottom-40 left-0 w-96 h-96 rounded-full bg-primary-light blur-3xl" />
        </div>

        <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 mb-6 text-accent">
            <FiMail className="w-7 h-7" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            {lang === 'es'
              ? 'Únete a la Comunidad SpeakEasy Valencia'
              : 'Join the SpeakEasy Valencia Table'}
          </h2>

          <p className="text-base sm:text-lg text-gray-300 font-body mb-8 leading-relaxed">
            {lang === 'es'
              ? 'Recibe historias exclusivas, recetas de nuestra abuela valenciana, guías gastronómicas y vocabulario conversacional directo en tu correo.'
              : 'Get our seasonal recipes, secret paella techniques, cultural stories, and conversational Spanish tips delivered straight to your inbox.'}
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400 text-emerald-200 px-6 py-4 rounded-2xl text-sm font-semibold">
              <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                {lang === 'es'
                  ? '¡Gracias por unirte! Te hemos enviado una confirmación.'
                  : 'Welcome to the table! Check your inbox for our special welcome guide.'}
              </span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={lang === 'es' ? 'Tu correo electrónico...' : 'Enter your email...'}
                  required
                  className="flex-1 px-5 py-4 rounded-xl bg-white text-neutral-dark placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="btn-primary !px-7 !py-4 !text-sm whitespace-nowrap"
                >
                  {subscribing
                    ? lang === 'es'
                      ? 'Suscribiendo...'
                      : 'Joining...'
                    : lang === 'es'
                    ? 'Suscribirme'
                    : 'Subscribe'}
                </button>
              </div>
              {subscribeError && <p className="text-xs text-red-300 mt-2">{subscribeError}</p>}
              <p className="text-xs text-gray-400 mt-3">
                {lang === 'es'
                  ? 'Cero spam. Solo auténtica pasión gastronómica y lingüística. Date de baja cuando quieras.'
                  : 'Zero spam. Only authentic culinary & language stories. Unsubscribe anytime.'}
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
