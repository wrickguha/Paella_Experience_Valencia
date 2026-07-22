import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Globe, ChevronDown, Check, Compass, Eye, Info, Type } from 'lucide-react';
import { settingsApi } from '@/services/api';
import PageHeader, { Card, Button, Spinner } from '@/components/ui';
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
    family: `exp_${id}_font_family`,
    size: `exp_${id}_font_size`,
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

export default function ExperiencesPageEditPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('intro');
  const [editLang, setEditLang] = useState<'en' | 'es'>('en');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [files, setFiles] = useState<Record<string, File>>({});

  const SECTIONS: SectionConfig[] = [
    { id: 'intro', label: 'Intro Section', icon: <Compass className="w-5 h-5" />, description: 'Edit the header title and paragraph explanations of the page.' },
    { id: 'categories', label: 'Category Cards & Media', icon: <Eye className="w-5 h-5" />, description: 'Customize titles, descriptions, card backgrounds, and category emojis/icons.' },
    { id: 'buttons', label: 'Interaction Buttons', icon: <Info className="w-5 h-5" />, description: 'Modify the "Back", booking CTA and "Booking Unavailable" buttons.' },
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
        'experience_city_image',
        'experience_country_image'
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
      setSuccessMsg('Experiences page changes saved successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { /* empty */ }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <PageHeader 
        title="Experiences & Locations Editor" 
        description="Edit and customize the static titles, intros, categories and CTA button texts on the Experiences & Locations page."
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
                    <div className="p-6 sm:p-8 bg-white space-y-6">
                      <SectionTypography sectionId={section.id} values={values} onUpdate={updateValue} />
                      
                      {/* INTRO SECTION */}
                      {section.id === 'intro' && (
                        <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                          <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                            <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                            Intro Settings ({editLang.toUpperCase()})
                          </h4>
                          <FormInput
                            label="Page Title"
                            value={values[`experience_intro_title_${editLang}`] || ''}
                            onChange={(e) => updateValue(`experience_intro_title_${editLang}`, e.target.value)}
                          />
                          <FormTextarea
                            label="Intro Paragraph 1"
                            value={values[`experience_intro_desc1_${editLang}`] || ''}
                            onChange={(e) => updateValue(`experience_intro_desc1_${editLang}`, e.target.value)}
                            rows={3}
                          />
                          <FormTextarea
                            label="Intro Paragraph 2"
                            value={values[`experience_intro_desc2_${editLang}`] || ''}
                            onChange={(e) => updateValue(`experience_intro_desc2_${editLang}`, e.target.value)}
                            rows={3}
                          />
                        </div>
                      )}

                      {/* CATEGORIES SECTION */}
                      {section.id === 'categories' && (
                        <div className="space-y-8">
                          {/* City Experiences Card */}
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-5">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 border-b border-gray-200/50 pb-2">
                              🏙️ City Experience Card
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                <label className="block text-sm font-semibold text-neutral-dark mb-2">City Category Background</label>
                                <ImageUpload
                                  label="Upload City Image"
                                  preview={values.experience_city_image ? (values.experience_city_image.startsWith('blob:') || values.experience_city_image.startsWith('http') || values.experience_city_image.startsWith('/') ? values.experience_city_image : `/storage/${values.experience_city_image}`) : ''}
                                  onChange={(file) => updateFile('experience_city_image', file)}
                                />
                              </div>
                              <div className="space-y-4">
                                <FormInput
                                  label="City Card Icon / Emoji"
                                  value={values.experience_city_icon || ''}
                                  onChange={(e) => updateValue('experience_city_icon', e.target.value)}
                                  placeholder="e.g. 🏙️"
                                />
                                <FormInput
                                  label="City Title"
                                  value={values[`experience_city_title_${editLang}`] || ''}
                                  onChange={(e) => updateValue(`experience_city_title_${editLang}`, e.target.value)}
                                />
                              </div>
                            </div>

                            <FormTextarea
                              label="City Tagline / Description"
                              value={values[`experience_city_desc_${editLang}`] || ''}
                              onChange={(e) => updateValue(`experience_city_desc_${editLang}`, e.target.value)}
                              rows={3}
                            />
                          </div>

                          {/* Countryside Experiences Card */}
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-5">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 border-b border-gray-200/50 pb-2">
                              🌿 Countryside Experience Card
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                <label className="block text-sm font-semibold text-neutral-dark mb-2">Countryside Category Background</label>
                                <ImageUpload
                                  label="Upload Countryside Image"
                                  preview={values.experience_country_image ? (values.experience_country_image.startsWith('blob:') || values.experience_country_image.startsWith('http') || values.experience_country_image.startsWith('/') ? values.experience_country_image : `/storage/${values.experience_country_image}`) : ''}
                                  onChange={(file) => updateFile('experience_country_image', file)}
                                />
                              </div>
                              <div className="space-y-4">
                                <FormInput
                                  label="Countryside Card Icon / Emoji"
                                  value={values.experience_country_icon || ''}
                                  onChange={(e) => updateValue('experience_country_icon', e.target.value)}
                                  placeholder="e.g. 🌿"
                                />
                                <FormInput
                                  label="Countryside Title"
                                  value={values[`experience_country_title_${editLang}`] || ''}
                                  onChange={(e) => updateValue(`experience_country_title_${editLang}`, e.target.value)}
                                />
                              </div>
                            </div>

                            <FormTextarea
                              label="Countryside Tagline / Description"
                              value={values[`experience_country_desc_${editLang}`] || ''}
                              onChange={(e) => updateValue(`experience_country_desc_${editLang}`, e.target.value)}
                              rows={3}
                            />
                          </div>
                        </div>
                      )}

                      {/* ACTION BUTTONS */}
                      {section.id === 'buttons' && (
                        <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                          <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                            <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                            Button Labels ({editLang.toUpperCase()})
                          </h4>
                          <FormInput
                            label="Back Button Text"
                            value={values[`experience_back_btn_${editLang}`] || ''}
                            onChange={(e) => updateValue(`experience_back_btn_${editLang}`, e.target.value)}
                          />
                          <FormInput
                            label="Save seat CTA Button Text"
                            value={values[`experience_cta_btn_${editLang}`] || ''}
                            onChange={(e) => updateValue(`experience_cta_btn_${editLang}`, e.target.value)}
                          />
                          <FormInput
                            label="Booking Unavailable Button Text"
                            value={values[`experience_unavailable_btn_${editLang}`] || ''}
                            onChange={(e) => updateValue(`experience_unavailable_btn_${editLang}`, e.target.value)}
                          />
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
