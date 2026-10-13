import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Globe, ChevronDown, Check, Compass, Sparkles, BookOpen, Mail, Flame, Type } from 'lucide-react';
import { settingsApi } from '@/services/api';
import PageHeader, { Button, Spinner } from '@/components/ui';
import { FormInput, FormTextarea } from '@/components/FormFields';
import { cn } from '@/lib/utils';

interface Setting {
  key: string;
  value: string;
  group?: string;
}

interface SectionConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

// ─── Curated Google Fonts ────────────────────────────────────────────────────
const GOOGLE_FONTS = [
  { label: 'Inherit (Global Default)', value: '', category: 'Default' },
  { label: 'Montserrat', value: 'Montserrat', category: 'Sans-serif' },
  { label: 'Inter', value: 'Inter', category: 'Sans-serif' },
  { label: 'Roboto', value: 'Roboto', category: 'Sans-serif' },
  { label: 'Lato', value: 'Lato', category: 'Sans-serif' },
  { label: 'Open Sans', value: 'Open Sans', category: 'Sans-serif' },
  { label: 'Nunito', value: 'Nunito', category: 'Sans-serif' },
  { label: 'Poppins', value: 'Poppins', category: 'Sans-serif' },
  { label: 'Raleway', value: 'Raleway', category: 'Sans-serif' },
  { label: 'Outfit', value: 'Outfit', category: 'Sans-serif' },
  { label: 'DM Sans', value: 'DM Sans', category: 'Sans-serif' },
  { label: 'Source Sans 3', value: 'Source Sans 3', category: 'Sans-serif' },
  { label: 'Playfair Display', value: 'Playfair Display', category: 'Serif' },
  { label: 'Merriweather', value: 'Merriweather', category: 'Serif' },
  { label: 'Lora', value: 'Lora', category: 'Serif' },
  { label: 'Cormorant Garamond', value: 'Cormorant Garamond', category: 'Serif' },
  { label: 'EB Garamond', value: 'EB Garamond', category: 'Serif' },
  { label: 'PT Serif', value: 'PT Serif', category: 'Serif' },
  { label: 'Libre Baskerville', value: 'Libre Baskerville', category: 'Serif' },
  { label: 'Georgia (system)', value: 'Georgia', category: 'System Serif' },
  { label: 'Courier Prime', value: 'Courier Prime', category: 'Monospace' },
];

const FONT_SIZE_MIN = 12;
const FONT_SIZE_MAX = 28;

function sectionFontKey(sectionId: string) {
  const id = sectionId.replace(/-/g, '_');
  return {
    family: `blog_${id}_font_family`,
    size: `blog_${id}_font_size`,
  };
}

interface SectionTypographyProps {
  sectionId: string;
  values: Record<string, string>;
  onUpdate: (key: string, value: string) => void;
}

function SectionTypography({ sectionId, values, onUpdate }: SectionTypographyProps) {
  const [open, setOpen] = useState(false);
  const keys = sectionFontKey(sectionId);

  const selectedFont = values[keys.family] || '';
  const previewFont = selectedFont || 'Montserrat';

  const rawSize = parseInt(values[keys.size] || '0', 10);
  const hasCustomSize = !isNaN(rawSize) && rawSize >= FONT_SIZE_MIN;
  const size = hasCustomSize ? Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, rawSize)) : 16;
  const pct = ((size - FONT_SIZE_MIN) / (FONT_SIZE_MAX - FONT_SIZE_MIN)) * 100;

  const fontsByCategory = GOOGLE_FONTS.reduce<Record<string, typeof GOOGLE_FONTS>>((acc, f) => {
    acc[f.category] = acc[f.category] || [];
    acc[f.category].push(f);
    return acc;
  }, {});

  return (
    <div className="border border-dashed border-indigo-200 rounded-2xl overflow-hidden bg-indigo-50/30 mb-6">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-indigo-50/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Type className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-sm font-bold text-indigo-800">Section Typography</span>
            <span className="text-xs text-indigo-400 ml-2">
              {selectedFont ? selectedFont : 'Global default'}{' '}
              {hasCustomSize ? `· ${size}px` : '· Auto size'}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-indigo-400 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="typography-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 pt-1 space-y-6 border-t border-indigo-100">
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-neutral-dark">
                  Font Family
                </label>
                <select
                  value={selectedFont}
                  onChange={(e) => onUpdate(keys.family, e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 bg-white text-sm text-neutral-dark transition-colors focus:outline-none focus:border-indigo-400"
                  style={{ fontFamily: previewFont }}
                >
                  {Object.entries(fontsByCategory).map(([cat, fonts]) => (
                    <optgroup key={cat} label={cat}>
                      {fonts.map((f) => (
                        <option key={f.value} value={f.value} style={{ fontFamily: f.value || 'inherit' }}>
                          {f.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                <div className="rounded-xl border border-indigo-100 bg-white p-4">
                  <p className="text-[10px] text-indigo-300 mb-2 uppercase tracking-widest font-medium">Live Preview</p>
                  <p style={{ fontFamily: previewFont, fontSize: 20, fontWeight: 700, color: '#032451', lineHeight: 1.3, marginBottom: 4 }}>
                    SpeakEasy Valencia Blog
                  </p>
                  <p style={{ fontFamily: previewFont, fontSize: 13, color: '#4b5563', lineHeight: 1.65 }}>
                    The secrets of crispy socarrat, recipes, and insights on mastering conversational Spanish around the table.
                  </p>
                </div>
                <p className="text-xs text-indigo-400">
                  {selectedFont
                    ? `✅ "${selectedFont}" will override the global font for this section only.`
                    : '💡 Set to "Inherit" to use the global font family from Typography settings.'}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-neutral-dark">Base Font Size</label>
                  <div className="flex items-center gap-2">
                    {hasCustomSize && (
                      <button
                        type="button"
                        onClick={() => onUpdate(keys.size, '')}
                        className="text-[10px] text-red-400 hover:text-red-600 underline font-medium"
                      >
                        Reset
                      </button>
                    )}
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                      {hasCustomSize ? `${size}px` : 'Auto'}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="range"
                    min={FONT_SIZE_MIN}
                    max={FONT_SIZE_MAX}
                    step={1}
                    value={size}
                    onChange={(e) => onUpdate(keys.size, e.target.value)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #6366f1 ${pct}%, #e5e7eb ${pct}%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-neutral-400 mt-1">
                    <span>{FONT_SIZE_MIN}px (Small)</span>
                    <span>16px (Default)</span>
                    <span>{FONT_SIZE_MAX}px (Large)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">Or type a value:</span>
                  <input
                    type="number"
                    min={FONT_SIZE_MIN}
                    max={FONT_SIZE_MAX}
                    value={hasCustomSize ? size : ''}
                    placeholder="Auto"
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!e.target.value) {
                        onUpdate(keys.size, '');
                      } else {
                        onUpdate(keys.size, String(Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, isNaN(v) ? FONT_SIZE_MIN : v))));
                      }
                    }}
                    className="w-20 px-3 py-1.5 rounded-lg border-2 border-neutral-200 text-sm text-center focus:outline-none focus:border-indigo-400"
                  />
                  <span className="text-sm text-neutral-400">px</span>
                </div>
                <p className="text-xs text-indigo-400">
                  {hasCustomSize
                    ? `✅ Custom ${size}px will override the global base font size for this section.`
                    : '💡 Leave as "Auto" to use the global base font size from Typography settings.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BlogPageEditPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [editLang, setEditLang] = useState<'en' | 'es'>('en');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  const SECTIONS: SectionConfig[] = [
    {
      id: 'hero',
      label: 'Hero Header Section',
      icon: <Compass className="w-5 h-5" />,
      description: 'Edit badge tagline, hero main titles, subtitles, search bar placeholder, and search button label.',
    },
    {
      id: 'categories',
      label: 'Category Filters & Featured Story',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Customize category navigation pill labels, featured article badge, and read story button text.',
    },
    {
      id: 'grid',
      label: 'Articles Grid & Search Results',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Modify latest articles section heading, read more button text, counter suffix, and empty state prompts.',
    },
    {
      id: 'newsletter',
      label: 'Newsletter & Community Section',
      icon: <Mail className="w-5 h-5" />,
      description: 'Customize newsletter headings, subscription pitch copy, input placeholders, button text, and anti-spam note.',
    },
    {
      id: 'detail',
      label: 'Article Detail Booking Invitation',
      icon: <Flame className="w-5 h-5" />,
      description: 'Edit the bottom booking invitation banner, titles, and CTA action buttons displayed inside individual articles.',
    },
  ];

  const fetchSettingsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsApi.list();
      const map: Record<string, string> = {};
      const settings = res.data.data || res.data;
      (Array.isArray(settings) ? settings : Object.entries(settings).map(([key, value]) => ({ key, value }))).forEach((s: Setting) => {
        map[s.key] = s.value || '';
      });
      setValues(map);
      setOriginalValues(map);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettingsData();
  }, [fetchSettingsData]);

  const updateValue = (key: string, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    setHasChanges(JSON.stringify(next) !== JSON.stringify(originalValues));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('settings', JSON.stringify(values));
      await settingsApi.update(fd);

      const res = await settingsApi.list();
      const map: Record<string, string> = {};
      const settings = res.data.data || res.data;
      (Array.isArray(settings) ? settings : Object.entries(settings).map(([key, value]) => ({ key, value }))).forEach((s: Setting) => {
        map[s.key] = s.value || '';
      });
      setValues(map);
      setOriginalValues(map);
      setHasChanges(false);
      setSuccessMsg('Blog page content saved successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      /* ignore */
    }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="Blog Page Editor"
        description="Edit and customize hero banners, search bar prompts, category navigation, newsletter copy, and article section headers for the public blog."
      >
        <div className="flex gap-2">
          <Button onClick={handleSave} loading={saving} disabled={!hasChanges}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </PageHeader>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-semibold border border-emerald-100 shadow-sm flex items-center gap-2"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          {successMsg}
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Header language switcher panel */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 gap-4 shadow-sm">
            <div>
              <p className="text-sm font-bold text-neutral-dark">Language Mode</p>
              <p className="text-xs text-neutral-gray mt-0.5">Toggle between English & Spanish layouts to customize local translations.</p>
            </div>
            <div className="flex bg-gray-200/60 p-1 rounded-xl shrink-0 border border-gray-200/30">
              <button
                type="button"
                onClick={() => setEditLang('en')}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
                  editLang === 'en' ? 'bg-white text-primary shadow-sm' : 'text-neutral-gray hover:text-neutral-dark'
                )}
              >
                <span>🇺🇸</span> English (EN)
              </button>
              <button
                type="button"
                onClick={() => setEditLang('es')}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
                  editLang === 'es' ? 'bg-white text-primary shadow-sm' : 'text-neutral-gray hover:text-neutral-dark'
                )}
              >
                <span>🇪🇸</span> Spanish (ES)
              </button>
            </div>
          </div>

          {/* Collapsible Accordion sections */}
          <div className="space-y-4">
            {SECTIONS.map((section) => {
              const isOpen = activeSection === section.id;
              return (
                <div
                  key={section.id}
                  className={cn(
                    'bg-white rounded-2xl border transition-all duration-300 overflow-hidden',
                    isOpen
                      ? 'border-primary/20 shadow-[0_10px_30px_-5px_rgba(232,111,44,0.06)] ring-1 ring-primary/5'
                      : 'border-gray-200/70 hover:border-gray-300/80 shadow-[0_4px_12px_rgba(0,0,0,0.02)]'
                  )}
                >
                  {/* Accordion Header */}
                  <button
                    type="button"
                    onClick={() => setActiveSection(isOpen ? '' : section.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-5 sm:px-6 py-5 text-left transition-colors font-semibold text-neutral-dark border-b',
                      isOpen ? 'bg-primary/5 border-primary/10 text-primary' : 'bg-white border-transparent hover:bg-gray-50/20'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                          isOpen ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-neutral-gray'
                        )}
                      >
                        {section.icon}
                      </div>
                      <div>
                        <span className="font-heading font-bold tracking-tight text-base sm:text-lg block">
                          {section.label}
                        </span>
                        <span className="text-xs text-neutral-gray font-normal mt-0.5 line-clamp-1 max-w-xl">
                          {section.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {isOpen && (
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full font-bold">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Editing: {editLang === 'en' ? 'English' : 'Spanish'}</span>
                        </div>
                      )}
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 text-neutral-gray transition-transform duration-300',
                          isOpen && 'transform rotate-180 text-primary'
                        )}
                      />
                    </div>
                  </button>

                  {/* Collapsible Content Section */}
                  {isOpen && (
                    <div className="p-6 sm:p-8 bg-white space-y-6">
                      <SectionTypography sectionId={section.id} values={values} onUpdate={updateValue} />

                      {/* 1. HERO HEADER SECTION */}
                      {section.id === 'hero' && (
                        <div className="space-y-6">
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                              Hero Header Settings ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Hero Badge / Tagline"
                              value={values[`blog_hero_badge_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_hero_badge_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'El Cuaderno de Valencia' : 'The Valencia Journal & Stories'}
                            />
                            <FormInput
                              label="Hero Main Heading"
                              value={values[`blog_hero_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_hero_title_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Historias Alrededor del Fuego: Paella, Cultura e Idiomas' : 'Stories from the Table: Paella, Culture & Language'}
                            />
                            <FormTextarea
                              label="Hero Subtitle / Description"
                              value={values[`blog_hero_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_hero_subtitle_${editLang}`, e.target.value)}
                              placeholder={
                                editLang === 'es'
                                  ? 'Recetas tradicionales, secretos del socarrat, guías locales de Valencia y consejos para dominar el español disfrutando de la buena mesa.'
                                  : 'Authentic Valencian recipes, the secrets of crispy socarrat, neighborhood discoveries, and insights on mastering conversational Spanish around the table.'
                              }
                              rows={3}
                            />
                          </div>

                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>🔍</span>
                              Search Bar Settings ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Search Input Placeholder"
                              value={values[`blog_search_placeholder_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_search_placeholder_${editLang}`, e.target.value)}
                              placeholder={
                                editLang === 'es'
                                  ? 'Buscar artículos por ingrediente, receta o tema...'
                                  : 'Search articles, recipes, culture, socarrat...'
                              }
                            />
                            <FormInput
                              label="Search Submit Button Label"
                              value={values[`blog_search_btn_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_search_btn_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Buscar' : 'Search'}
                            />
                          </div>
                        </div>
                      )}

                      {/* 2. CATEGORIES & FEATURED STORY */}
                      {section.id === 'categories' && (
                        <div className="space-y-6">
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>🏷️</span>
                              Category Navigation Tab ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="All Articles Tab Label"
                              value={values[`blog_filter_all_label_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_filter_all_label_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Todos los Artículos' : 'All Articles'}
                            />
                          </div>

                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>⭐</span>
                              Featured Story Block ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Featured Badge Label"
                              value={values[`blog_featured_badge_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_featured_badge_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Artículo Destacado' : 'Featured Story'}
                            />
                            <FormInput
                              label="Featured Story Read CTA Button Text"
                              value={values[`blog_featured_cta_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_featured_cta_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Leer historia' : 'Read Story'}
                            />
                          </div>
                        </div>
                      )}

                      {/* 3. ARTICLES GRID & EMPTY STATE */}
                      {section.id === 'grid' && (
                        <div className="space-y-6">
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>📰</span>
                              Latest Articles Section Headers ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values[`blog_articles_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_articles_title_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Últimos Artículos' : 'Latest Articles'}
                            />
                            <FormTextarea
                              label="Section Subtitle"
                              value={values[`blog_articles_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_articles_subtitle_${editLang}`, e.target.value)}
                              placeholder={
                                editLang === 'es'
                                  ? 'Explora nuestras crónicas gastronómicas y lecciones culturales'
                                  : 'Explore culinary guides, local stories, and language lessons'
                              }
                              rows={2}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <FormInput
                                label="Card Read Link Text"
                                value={values[`blog_card_read_more_${editLang}`] || ''}
                                onChange={(e) => updateValue(`blog_card_read_more_${editLang}`, e.target.value)}
                                placeholder={editLang === 'es' ? 'Leer' : 'Read'}
                              />
                              <FormInput
                                label="Articles Counter Suffix"
                                value={values[`blog_articles_counter_${editLang}`] || ''}
                                onChange={(e) => updateValue(`blog_articles_counter_${editLang}`, e.target.value)}
                                placeholder={editLang === 'es' ? 'artículos' : 'articles'}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <FormInput
                                label="Search Results Label"
                                value={values[`blog_search_results_label_${editLang}`] || ''}
                                onChange={(e) => updateValue(`blog_search_results_label_${editLang}`, e.target.value)}
                                placeholder={editLang === 'es' ? 'Resultados para la búsqueda:' : 'Search results for:'}
                              />
                              <FormInput
                                label="Clear Search Filter Label"
                                value={values[`blog_clear_search_label_${editLang}`] || ''}
                                onChange={(e) => updateValue(`blog_clear_search_label_${editLang}`, e.target.value)}
                                placeholder={editLang === 'es' ? 'Limpiar filtro' : 'Clear search'}
                              />
                            </div>
                          </div>

                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>🔎</span>
                              Empty State Prompts ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Empty State Heading"
                              value={values[`blog_empty_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_empty_title_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'No se encontraron artículos' : 'No articles found'}
                            />
                            <FormTextarea
                              label="Empty State Subtitle / Guidance"
                              value={values[`blog_empty_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_empty_subtitle_${editLang}`, e.target.value)}
                              placeholder={
                                editLang === 'es'
                                  ? 'Prueba con otra palabra de búsqueda o selecciona otra categoría.'
                                  : 'Try searching for different keywords or explore other categories.'
                              }
                              rows={2}
                            />
                            <FormInput
                              label="Empty State Reset Button Text"
                              value={values[`blog_empty_btn_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_empty_btn_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Ver todos los artículos' : 'View all articles'}
                            />
                          </div>
                        </div>
                      )}

                      {/* 4. NEWSLETTER & COMMUNITY SECTION */}
                      {section.id === 'newsletter' && (
                        <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                          <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                            <span>📧</span>
                            Newsletter Block Settings ({editLang.toUpperCase()})
                          </h4>
                          <FormInput
                            label="Newsletter Header Title"
                            value={values[`blog_newsletter_title_${editLang}`] || ''}
                            onChange={(e) => updateValue(`blog_newsletter_title_${editLang}`, e.target.value)}
                            placeholder={editLang === 'es' ? 'Únete a la Comunidad SpeakEasy Valencia' : 'Join the SpeakEasy Valencia Table'}
                          />
                          <FormTextarea
                            label="Newsletter Pitch / Description"
                            value={values[`blog_newsletter_subtitle_${editLang}`] || ''}
                            onChange={(e) => updateValue(`blog_newsletter_subtitle_${editLang}`, e.target.value)}
                            placeholder={
                              editLang === 'es'
                                ? 'Recibe historias exclusivas, recetas de nuestra abuela valenciana, guías gastronómicas y vocabulario conversacional directo en tu correo.'
                                : 'Get our seasonal recipes, secret paella techniques, cultural stories, and conversational Spanish tips delivered straight to your inbox.'
                            }
                            rows={3}
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                              label="Email Input Placeholder"
                              value={values[`blog_newsletter_placeholder_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_newsletter_placeholder_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Tu correo electrónico...' : 'Enter your email...'}
                            />
                            <FormInput
                              label="Subscribe Button Label"
                              value={values[`blog_newsletter_btn_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_newsletter_btn_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Suscribirme' : 'Subscribe'}
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                              label="Submitting State Label"
                              value={values[`blog_newsletter_subscribing_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_newsletter_subscribing_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Suscribiendo...' : 'Joining...'}
                            />
                            <FormInput
                              label="Success Confirmation Message"
                              value={values[`blog_newsletter_success_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_newsletter_success_${editLang}`, e.target.value)}
                              placeholder={
                                editLang === 'es'
                                  ? '¡Gracias por unirte! Te hemos enviado una confirmación.'
                                  : 'Welcome to the table! Check your inbox for our special welcome guide.'
                              }
                            />
                          </div>
                          <FormTextarea
                            label="Anti-Spam Disclaimer Note"
                            value={values[`blog_newsletter_disclaimer_${editLang}`] || ''}
                            onChange={(e) => updateValue(`blog_newsletter_disclaimer_${editLang}`, e.target.value)}
                            placeholder={
                              editLang === 'es'
                                ? 'Cero spam. Solo auténtica pasión gastronómica y lingüística. Date de baja cuando quieras.'
                                : 'Zero spam. Only authentic culinary & language stories. Unsubscribe anytime.'
                            }
                            rows={2}
                          />
                        </div>
                      )}

                      {/* 5. ARTICLE DETAIL BOOKING INVITATION CTA */}
                      {section.id === 'detail' && (
                        <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                          <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                            <span>🥘</span>
                            Article Detail Bottom Banner ({editLang.toUpperCase()})
                          </h4>
                          <FormInput
                            label="Banner Badge Label"
                            value={values[`blog_detail_cta_badge_${editLang}`] || ''}
                            onChange={(e) => updateValue(`blog_detail_cta_badge_${editLang}`, e.target.value)}
                            placeholder={editLang === 'es' ? 'La Experiencia en Persona' : 'Live the Experience'}
                          />
                          <FormInput
                            label="Banner Main Heading"
                            value={values[`blog_detail_cta_title_${editLang}`] || ''}
                            onChange={(e) => updateValue(`blog_detail_cta_title_${editLang}`, e.target.value)}
                            placeholder={
                              editLang === 'es'
                                ? '¿Listo para Saborear la Auténtica Paella en Valencia?'
                                : 'Ready to Taste Authentic Paella Over Orange Wood in Valencia?'
                            }
                          />
                          <FormTextarea
                            label="Banner Description / Invitation"
                            value={values[`blog_detail_cta_desc_${editLang}`] || ''}
                            onChange={(e) => updateValue(`blog_detail_cta_desc_${editLang}`, e.target.value)}
                            placeholder={
                              editLang === 'es'
                                ? 'No te limites a leerlo. Únete a nuestro acogedor taller gastronómico, practica español con nosotros y rasca tu propia cucharada de socarrat.'
                                : 'Reading about paella is wonderful; tasting it fresh from the wood-fired pan while speaking Spanish and laughing with international friends is unforgettable.'
                            }
                            rows={3}
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                              label="Primary CTA Button (Book Experience)"
                              value={values[`blog_detail_cta_primary_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_detail_cta_primary_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Reservar Mi Experiencia' : 'Book My Experience'}
                            />
                            <FormInput
                              label="Secondary CTA Button (Explore More Stories)"
                              value={values[`blog_detail_cta_secondary_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_detail_cta_secondary_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Más Artículos' : 'Explore More Stories'}
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <FormInput
                              label="Back to Blog Link Text"
                              value={values[`blog_detail_back_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_detail_back_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Volver al blog' : 'Back to all stories'}
                            />
                            <FormInput
                              label="Share Article Label"
                              value={values[`blog_detail_share_${editLang}`] || ''}
                              onChange={(e) => updateValue(`blog_detail_share_${editLang}`, e.target.value)}
                              placeholder={editLang === 'es' ? 'Compartir historia' : 'Share this story'}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Persistent Discard / Save actions at the bottom */}
          <div className="flex justify-end gap-3.5 pt-6 mt-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setValues(originalValues);
                setHasChanges(false);
              }}
              disabled={!hasChanges || saving}
              className="px-5 py-2.5 text-sm font-medium"
            >
              Discard Changes
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges}
              className="px-6 py-2.5 text-sm font-semibold"
            >
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
