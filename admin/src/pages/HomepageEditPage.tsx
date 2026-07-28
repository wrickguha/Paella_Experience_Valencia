import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Globe, ChevronDown, Check, Video, FileText, Calendar, Compass, Users, Type } from 'lucide-react';
import { settingsApi } from '@/services/api';
import PageHeader, { Button, Spinner } from '@/components/ui';
import { FormInput, FormTextarea, ImageUpload } from '@/components/FormFields';
import { cn } from '@/lib/utils';

interface Setting {
  key: string;
  value: string;
  group: string;
}

interface SectionConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

// ─── Curated Google Fonts (same list as SettingsPage) ───────────────────────
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

// ─── Per-section typography key helper ──────────────────────────────────────
function sectionFontKey(sectionId: string) {
  const id = sectionId.replace(/-/g, '_');
  return {
    family: `hp_${id}_font_family`,
    size: `hp_${id}_font_size`,
  };
}

// ─── SectionTypography component ────────────────────────────────────────────
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
    <div className="border border-dashed border-indigo-200 rounded-2xl overflow-hidden bg-indigo-50/30">
      {/* Toggle header */}
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

      {/* Expandable body */}
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

              {/* ── Font Family ─────────────────────── */}
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

                {/* Live preview */}
                <div className="rounded-xl border border-indigo-100 bg-white p-4">
                  <p className="text-[10px] text-indigo-300 mb-2 uppercase tracking-widest font-medium">Live Preview</p>
                  <p style={{ fontFamily: previewFont, fontSize: 20, fontWeight: 700, color: '#032451', lineHeight: 1.3, marginBottom: 4 }}>
                    SpeakEasy Valencia
                  </p>
                  <p style={{ fontFamily: previewFont, fontSize: 13, color: '#4b5563', lineHeight: 1.65 }}>
                    The quick brown fox jumps over the lazy dog. Descubre Valencia a través de la comida y la conversación.
                  </p>
                </div>
                <p className="text-xs text-indigo-400">
                  {selectedFont
                    ? `✅ "${selectedFont}" will override the global font for this section only.`
                    : '💡 Set to "Inherit" to use the global font family from Typography settings.'}
                </p>
              </div>

              {/* ── Font Size ───────────────────────── */}
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

                {/* Slider */}
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

                {/* Manual input */}
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

                {/* Size live preview */}
                <div className="rounded-xl border border-indigo-100 bg-white p-4">
                  <p className="text-[10px] text-indigo-300 mb-2 uppercase tracking-widest font-medium">Size Preview</p>
                  <p style={{ fontFamily: previewFont, fontSize: size * 1.6, fontWeight: 700, color: '#032451', lineHeight: 1.2, marginBottom: 4 }}>
                    Heading Text
                  </p>
                  <p style={{ fontFamily: previewFont, fontSize: size, color: '#4b5563', lineHeight: 1.7 }}>
                    This is how your section body text will look on the website.
                  </p>
                  <p style={{ fontFamily: previewFont, fontSize: size * 0.85, color: '#9ca3af', marginTop: 6 }}>
                    Small caption / label text
                  </p>
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

// ─── Main Component ──────────────────────────────────────────────────────────
export default function HomepageEditPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [editLang, setEditLang] = useState<'en' | 'es'>('en');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [files, setFiles] = useState<Record<string, File>>({});

  const SECTIONS: SectionConfig[] = [
    { id: 'hero', label: 'Hero Section', icon: <Compass className="w-5 h-5" />, description: 'Edit tagline, background video, titles and call-to-actions.' },
    { id: 'highlights', label: 'Experience Highlights', icon: <Compass className="w-5 h-5" />, description: 'Modify the grid of 6 core values, bottom details, and snake experience timeline.' },
    { id: 'community', label: 'Community Section', icon: <Users className="w-5 h-5" />, description: 'Control the "Meet the Community" section heading and three image cards.' },
    { id: 'testimonials', label: 'Video Testimonials', icon: <Video className="w-5 h-5" />, description: 'Edit section texts and link the three YouTube customer video links.' },
    { id: 'level-test', label: 'Spanish Level Test', icon: <FileText className="w-5 h-5" />, description: 'Customize introductory texts and buttons for Spanish and English quizzes.' },
    { id: 'how-it-works', label: 'How It Works', icon: <Compass className="w-5 h-5" />, description: 'Edit page subtitles, step badges and the scheduling link button labels.' },
    { id: 'events', label: 'Upcoming Events', icon: <Calendar className="w-5 h-5" />, description: 'Modify the header content above the events grid.' },
  ];

  const fetch = useCallback(async () => {
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
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateValue = (key: string, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    setHasChanges(JSON.stringify(next) !== JSON.stringify(originalValues));
  };

  const updateFile = (key: string, file: File | null) => {
    const nextFiles = { ...files };
    if (file) {
      nextFiles[key] = file;
      updateValue(key, URL.createObjectURL(file));
    } else {
      delete nextFiles[key];
      updateValue(key, '');
    }
    setFiles(nextFiles);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      const cleanValues = { ...values };
      
      // Clean up local blob URLs for images & videos
      const mediaKeys = [
        'hero_video', 
        'community_image_1', 
        'community_image_2', 
        'community_image_3'
      ];
      mediaKeys.forEach(k => {
        if (cleanValues[k] && cleanValues[k].startsWith('blob:')) {
          delete cleanValues[k];
        }
      });

      fd.append('settings', JSON.stringify(cleanValues));
      Object.entries(files).forEach(([k, file]) => {
        fd.append(k, file);
      });

      await settingsApi.update(fd);

      const res = await settingsApi.list();
      const map: Record<string, string> = {};
      const settings = res.data.data || res.data;
      (Array.isArray(settings) ? settings : Object.entries(settings).map(([key, value]) => ({ key, value }))).forEach((s: Setting) => {
        map[s.key] = s.value || '';
      });
      setValues(map);
      setOriginalValues(map);
      setFiles({});
      setHasChanges(false);
      setSuccessMsg('Homepage changes saved successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { /* empty */ }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <PageHeader 
        title="Homepage Content Editor" 
        description="Easily customize and change any static content, texts, images, videos, and per-section typography on the Homepage."
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
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5", 
                  editLang === 'en' ? "bg-white text-primary shadow-sm" : "text-neutral-gray hover:text-neutral-dark"
                )}
              >
                <span>🇺🇸</span> English (EN)
              </button>
              <button 
                type="button"
                onClick={() => setEditLang('es')} 
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5", 
                  editLang === 'es' ? "bg-white text-primary shadow-sm" : "text-neutral-gray hover:text-neutral-dark"
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
                    "bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
                    isOpen 
                      ? "border-primary/20 shadow-[0_10px_30px_-5px_rgba(232,111,44,0.06)] ring-1 ring-primary/5" 
                      : "border-gray-200/70 hover:border-gray-300/80 shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
                  )}
                >
                  {/* Accordion Header */}
                  <button
                    type="button"
                    onClick={() => setActiveSection(isOpen ? '' : section.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-5 sm:px-6 py-5 text-left transition-colors font-semibold text-neutral-dark border-b",
                      isOpen ? "bg-primary/5 border-primary/10 text-primary" : "bg-white border-transparent hover:bg-gray-50/20"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        isOpen ? "bg-primary/20 text-primary" : "bg-gray-100 text-neutral-gray"
                      )}>
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
                      <ChevronDown className={cn("w-5 h-5 text-neutral-gray transition-transform duration-300", isOpen && "transform rotate-180 text-primary")} />
                    </div>
                  </button>

                  {/* Collapsible Content Section */}
                  {isOpen && (
                    <div className="p-6 sm:p-8 bg-white space-y-8">
                      
                      {/* 1. HERO SECTION FIELDS */}
                      {section.id === 'hero' && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-semibold text-neutral-dark mb-2">Hero Background Video</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary/40 transition-colors bg-gray-50/30">
                              {values.hero_video ? (
                                <div className="relative max-w-md mx-auto bg-black rounded-xl overflow-hidden shadow-md border border-gray-100">
                                  <video 
                                    src={values.hero_video.startsWith('blob:') ? values.hero_video : `/storage/${values.hero_video}`} 
                                    controls 
                                    className="max-h-48 mx-auto object-cover w-full" 
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateFile('hero_video', null)}
                                    className="absolute top-2 right-2 w-7 h-7 bg-danger hover:bg-danger/90 text-white rounded-full text-sm flex items-center justify-center shadow transition-colors"
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : (
                                <label className="cursor-pointer block py-6">
                                  <div className="text-neutral-gray text-sm">
                                    <span className="text-primary font-semibold">Click to upload video</span> or drag and drop
                                  </div>
                                  <p className="text-xs text-neutral-gray mt-1.5">MP4 up to 20MB</p>
                                  <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => updateFile('hero_video', e.target.files?.[0] || null)}
                                  />
                                </label>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                              label="Splash Screen Tagline (English)"
                              value={values.hero_tagline_en || values.hero_tagline || ''}
                              onChange={(e) => {
                                updateValue('hero_tagline_en', e.target.value);
                                updateValue('hero_tagline', e.target.value);
                              }}
                              placeholder="e.g. Speak. Cook. Connect"
                            />
                            <FormInput
                              label="Splash Screen Tagline (Spanish)"
                              value={values.hero_tagline_es || ''}
                              onChange={(e) => updateValue('hero_tagline_es', e.target.value)}
                              placeholder="e.g. Habla. Cocina. Conecta"
                            />
                          </div>

                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                              Hero Content ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label={`Splash Screen Tagline (${editLang.toUpperCase()})`}
                              value={editLang === 'en' ? (values.hero_tagline_en || values.hero_tagline || '') : (values.hero_tagline_es || '')}
                              onChange={(e) => {
                                if (editLang === 'en') {
                                  updateValue('hero_tagline_en', e.target.value);
                                  updateValue('hero_tagline', e.target.value);
                                } else {
                                  updateValue('hero_tagline_es', e.target.value);
                                }
                              }}
                              placeholder={editLang === 'en' ? 'e.g. Speak. Cook. Connect' : 'e.g. Habla. Cocina. Conecta'}
                            />
                            <FormInput
                              label="Hero Title"
                              value={values[`hero_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`hero_title_${editLang}`, e.target.value)}
                            />
                            <FormTextarea
                              label="Hero Subtitle / Description"
                              value={values[`hero_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`hero_subtitle_${editLang}`, e.target.value)}
                              rows={4}
                            />
                            <FormInput
                              label="CTA Button Text"
                              value={values[`hero_cta_${editLang}`] || ''}
                              onChange={(e) => updateValue(`hero_cta_${editLang}`, e.target.value)}
                            />
                            <FormInput
                              label="Scroll/Secondary Button Text"
                              value={values[`hero_scroll_${editLang}`] || ''}
                              onChange={(e) => updateValue(`hero_scroll_${editLang}`, e.target.value)}
                            />
                          </div>

                          {/* ── Section Typography ── */}
                          <SectionTypography sectionId={section.id} values={values} onUpdate={updateValue} />
                        </div>
                      )}

                      {/* 2. EXPERIENCE HIGHLIGHTS */}
                      {section.id === 'highlights' && (
                        <div className="space-y-8">
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                              Highlights Header ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values[`highlights_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`highlights_title_${editLang}`, e.target.value)}
                            />
                            <FormTextarea
                              label="Section Subtitle"
                              value={values[`highlights_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`highlights_subtitle_${editLang}`, e.target.value)}
                            />
                          </div>

                          <div className="border-t border-gray-100 pt-6">
                            <h4 className="font-bold text-neutral-dark text-base mb-4">Highlights cards (6 items)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              {[1, 2, 3, 4, 5, 6].map((num) => (
                                <div key={num} className="bg-gray-50/30 p-4 rounded-xl border border-gray-200/50 space-y-3">
                                  <h5 className="text-xs font-bold text-neutral-gray uppercase tracking-wider">Card {num} ({editLang.toUpperCase()})</h5>
                                  <FormInput
                                    label="Card Icon / Emoji"
                                    value={values[`highlights_feat${num}_icon`] || ''}
                                    onChange={(e) => updateValue(`highlights_feat${num}_icon`, e.target.value)}
                                    placeholder="e.g. 🥘, 🗣, 🍷, etc."
                                  />
                                  <FormInput
                                    label="Card Title"
                                    value={values[`highlights_feat${num}_title_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`highlights_feat${num}_title_${editLang}`, e.target.value)}
                                  />
                                  <FormTextarea
                                    label="Card Description"
                                    value={values[`highlights_feat${num}_desc_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`highlights_feat${num}_desc_${editLang}`, e.target.value)}
                                    rows={2}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-6 space-y-4">
                            <h4 className="font-bold text-neutral-dark text-base">Bottom Section: Language learning details</h4>
                            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4">
                              <h5 className="text-sm font-bold text-primary flex items-center gap-1">
                                <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                                Language Details ({editLang.toUpperCase()})
                              </h5>
                              <FormInput
                                label="Language Header"
                                value={values[`highlights_languageTitle_${editLang}`] || ''}
                                onChange={(e) => updateValue(`highlights_languageTitle_${editLang}`, e.target.value)}
                              />
                              <FormInput
                                label="Language Subtitle"
                                value={values[`highlights_languageSubtitle_${editLang}`] || ''}
                                onChange={(e) => updateValue(`highlights_languageSubtitle_${editLang}`, e.target.value)}
                              />
                              <FormTextarea
                                label="Language Paragraphs (One paragraph per line)"
                                value={values[`highlights_languageParagraphs_${editLang}`] || ''}
                                onChange={(e) => updateValue(`highlights_languageParagraphs_${editLang}`, e.target.value)}
                                rows={8}
                              />
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-6 space-y-4">
                            <h4 className="font-bold text-neutral-dark text-base">Snake Flowchart steps</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              {[1, 2, 3, 4, 5].map((num) => (
                                <div key={num} className="bg-gray-50/30 p-4 rounded-xl border border-gray-200/50 space-y-3">
                                  <h5 className="text-xs font-bold text-neutral-gray uppercase tracking-wider">Step {num} ({editLang.toUpperCase()})</h5>
                                  <FormInput
                                    label="Step Emoji / Icon"
                                    value={values[`flow_step${num}_emoji`] || ''}
                                    onChange={(e) => updateValue(`flow_step${num}_emoji`, e.target.value)}
                                    placeholder="e.g. 👋"
                                  />
                                  <FormInput
                                    label="Step Title"
                                    value={values[`flow_step${num}_title_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`flow_step${num}_title_${editLang}`, e.target.value)}
                                  />
                                  <FormInput
                                    label="Step Description"
                                    value={values[`flow_step${num}_desc_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`flow_step${num}_desc_${editLang}`, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ── Section Typography ── */}
                          <SectionTypography sectionId={section.id} values={values} onUpdate={updateValue} />
                        </div>
                      )}

                      {/* 3. COMMUNITY SECTION */}
                      {section.id === 'community' && (
                        <div className="space-y-8">
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                              Community Headers ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values[`community_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`community_title_${editLang}`, e.target.value)}
                            />
                            <FormTextarea
                              label="Section Subtitle"
                              value={values[`community_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`community_subtitle_${editLang}`, e.target.value)}
                            />
                          </div>

                          <div className="border-t border-gray-100 pt-6">
                            <h4 className="font-bold text-neutral-dark text-base mb-4">Community Cards (3 cards)</h4>
                            <div className="space-y-6">
                              {[1, 2, 3].map((num) => {
                                const imagePreview = values[`community_image_${num}`]
                                  ? (values[`community_image_${num}`].startsWith('blob:') || values[`community_image_${num}`].startsWith('http') || values[`community_image_${num}`].startsWith('/')
                                    ? values[`community_image_${num}`]
                                    : `/storage/${values[`community_image_${num}`]}`)
                                  : '';
                                return (
                                  <div key={num} className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/50 flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-1/4">
                                      <ImageUpload
                                        label={`Card Image ${num}`}
                                        preview={imagePreview}
                                        onChange={(file) => updateFile(`community_image_${num}`, file)}
                                      />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                      <h5 className="text-xs font-bold text-neutral-gray uppercase tracking-wider">Card {num} Content ({editLang.toUpperCase()})</h5>
                                      <FormInput
                                        label="Card Title"
                                        value={values[`community_card${num}_title_${editLang}`] || ''}
                                        onChange={(e) => updateValue(`community_card${num}_title_${editLang}`, e.target.value)}
                                      />
                                      <FormTextarea
                                        label="Card Description"
                                        value={values[`community_card${num}_desc_${editLang}`] || ''}
                                        onChange={(e) => updateValue(`community_card${num}_desc_${editLang}`, e.target.value)}
                                        rows={3}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* ── Section Typography ── */}
                          <SectionTypography sectionId={section.id} values={values} onUpdate={updateValue} />
                        </div>
                      )}

                      {/* 4. VIDEO TESTIMONIALS */}
                      {section.id === 'testimonials' && (
                        <div className="space-y-8">
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                              Testimonial Headers ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values[`video_testimonials_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`video_testimonials_title_${editLang}`, e.target.value)}
                            />
                            <FormInput
                              label="Section Subtitle"
                              value={values[`video_testimonials_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`video_testimonials_subtitle_${editLang}`, e.target.value)}
                            />
                            <FormInput
                              label="See More Button Text"
                              value={values[`video_testimonials_seeMore_${editLang}`] || ''}
                              onChange={(e) => updateValue(`video_testimonials_seeMore_${editLang}`, e.target.value)}
                            />
                          </div>

                          <div className="border-t border-gray-100 pt-6">
                            <h4 className="font-bold text-neutral-dark text-base mb-4">YouTube Video links</h4>
                            <div className="space-y-4">
                              {[1, 2, 3].map((num) => (
                                <div key={num} className="bg-gray-50/50 p-4 rounded-xl border border-gray-200/50 flex flex-col md:flex-row gap-4 items-center">
                                  <div className="flex-1 w-full">
                                    <FormInput
                                      label={`YouTube Video Link ${num}`}
                                      value={values[`testimonial_video_${num}`] || ''}
                                      onChange={(e) => updateValue(`testimonial_video_${num}`, e.target.value)}
                                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                                    />
                                  </div>
                                  {values[`testimonial_video_${num}`] && (
                                    <div className="w-36 h-20 bg-neutral-cream rounded-lg overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center shadow-sm">
                                      <img 
                                        src={`https://img.youtube.com/vi/${
                                          values[`testimonial_video_${num}`].includes('v=')
                                            ? values[`testimonial_video_${num}`].split('v=')[1]?.split('&')[0]
                                            : values[`testimonial_video_${num}`].split('/').pop()?.split('?')[0]
                                        }/mqdefault.jpg`}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ── Section Typography ── */}
                          <SectionTypography sectionId={section.id} values={values} onUpdate={updateValue} />
                        </div>
                      )}

                      {/* 5. SPANISH/ENGLISH LEVEL TEST */}
                      {section.id === 'level-test' && (
                        <div className="space-y-6">
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-6">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                              <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                              Level Test Configurations ({editLang.toUpperCase()})
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Spanish Quiz */}
                              <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200/50 shadow-sm">
                                <h5 className="font-bold text-neutral-dark text-sm flex items-center gap-2">
                                  <span>🇪🇸</span> Spanish Level Test Card
                                </h5>
                                <FormInput
                                  label="Title"
                                  value={values[`spanishTest_title_${editLang}`] || ''}
                                  onChange={(e) => updateValue(`spanishTest_title_${editLang}`, e.target.value)}
                                />
                                <FormTextarea
                                  label="Subtitle"
                                  value={values[`spanishTest_subtitle_${editLang}`] || ''}
                                  onChange={(e) => updateValue(`spanishTest_subtitle_${editLang}`, e.target.value)}
                                  rows={3}
                                />
                                <FormInput
                                  label="Start Button text"
                                  value={values[`spanishTest_startBtn_${editLang}`] || ''}
                                  onChange={(e) => updateValue(`spanishTest_startBtn_${editLang}`, e.target.value)}
                                />
                              </div>

                              {/* English Quiz */}
                              <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200/50 shadow-sm">
                                <h5 className="font-bold text-neutral-dark text-sm flex items-center gap-2">
                                  <span>🇬🇧</span> English Level Test Card
                                </h5>
                                <FormInput
                                  label="Title"
                                  value={values[`englishTest_title_${editLang}`] || ''}
                                  onChange={(e) => updateValue(`englishTest_title_${editLang}`, e.target.value)}
                                />
                                <FormTextarea
                                  label="Subtitle"
                                  value={values[`englishTest_subtitle_${editLang}`] || ''}
                                  onChange={(e) => updateValue(`englishTest_subtitle_${editLang}`, e.target.value)}
                                  rows={3}
                                />
                                <FormInput
                                  label="Start Button text"
                                  value={values[`englishTest_startBtn_${editLang}`] || ''}
                                  onChange={(e) => updateValue(`englishTest_startBtn_${editLang}`, e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          {/* ── Section Typography ── */}
                          <SectionTypography sectionId={section.id} values={values} onUpdate={updateValue} />
                        </div>
                      )}

                      {/* 6. HOW IT WORKS */}
                      {section.id === 'how-it-works' && (
                        <div className="space-y-8">
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                              How It Works Headers ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values[`howItWorks_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`howItWorks_title_${editLang}`, e.target.value)}
                            />
                            <FormTextarea
                              label="Section Subtitle"
                              value={values[`howItWorks_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`howItWorks_subtitle_${editLang}`, e.target.value)}
                            />
                            <FormInput
                              label="CTA Button Text"
                              value={values[`howItWorks_cta_${editLang}`] || ''}
                              onChange={(e) => updateValue(`howItWorks_cta_${editLang}`, e.target.value)}
                            />
                          </div>

                          <div className="border-t border-gray-100 pt-6">
                            <h4 className="font-bold text-neutral-dark text-base mb-4">Steps (3 steps)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              {[1, 2, 3].map((num) => (
                                <div key={num} className="bg-gray-50/30 p-4 rounded-xl border border-gray-200/50 space-y-3">
                                  <h5 className="text-xs font-bold text-neutral-gray uppercase tracking-wider">Step {num} ({editLang.toUpperCase()})</h5>
                                  <FormInput
                                    label="Step Emoji / Icon"
                                    value={values[`howItWorks_step${num}_emoji`] || ''}
                                    onChange={(e) => updateValue(`howItWorks_step${num}_emoji`, e.target.value)}
                                    placeholder="e.g. 📅 (empty uses default SVG)"
                                  />
                                  <FormInput
                                    label="Step Title"
                                    value={values[`howItWorks_step${num}_title_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`howItWorks_step${num}_title_${editLang}`, e.target.value)}
                                  />
                                  <FormTextarea
                                    label="Step Description"
                                    value={values[`howItWorks_step${num}_desc_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`howItWorks_step${num}_desc_${editLang}`, e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ── Section Typography ── */}
                          <SectionTypography sectionId={section.id} values={values} onUpdate={updateValue} />
                        </div>
                      )}

                      {/* 7. UPCOMING EVENTS */}
                      {section.id === 'events' && (
                        <div className="space-y-6">
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                              Upcoming Events Headers ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values[`upcomingEvents_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`upcomingEvents_title_${editLang}`, e.target.value)}
                            />
                            <FormTextarea
                              label="Section Subtitle"
                              value={values[`upcomingEvents_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`upcomingEvents_subtitle_${editLang}`, e.target.value)}
                            />
                          </div>

                          {/* ── Section Typography ── */}
                          <SectionTypography sectionId={section.id} values={values} onUpdate={updateValue} />
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
                setFiles({});
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
