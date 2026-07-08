import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Globe, Info, RefreshCw, ChevronDown } from 'lucide-react';
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
  icon: string;
}

const SECTIONS: SectionConfig[] = [
  { id: 'hero', label: 'Hero Section', icon: '✨' },
  { id: 'highlights', label: 'Experience Highlights', icon: '⭐' },
  { id: 'community', label: 'Community Section', icon: '👥' },
  { id: 'testimonials', label: 'Video Testimonials', icon: '🎥' },
  { id: 'level-test', label: 'Spanish Level Test', icon: '📝' },
  { id: 'how-it-works', label: 'How It Works', icon: '⚙️' },
  { id: 'events', label: 'Upcoming Events', icon: '📅' },
];

export default function HomepageEditPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [files, setFiles] = useState<Record<string, File>>({});

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
        description="Edit and customize all texts, images, and videos visible on the Homepage."
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
          className="p-3 rounded-lg bg-success/10 text-success text-sm font-medium border border-success/20 shadow-sm"
        >
          {successMsg}
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          {SECTIONS.map((section) => {
            const isOpen = activeSection === section.id;
            return (
              <div 
                key={section.id} 
                className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden transition-all duration-200"
              >
                {/* Accordion header */}
                <button
                  type="button"
                  onClick={() => setActiveSection(isOpen ? '' : section.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4.5 text-left transition-colors font-semibold text-neutral-dark text-base border-b",
                    isOpen ? "bg-primary/5 border-primary/10 text-primary" : "bg-white border-transparent hover:bg-gray-50/50"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-xl leading-none">{section.icon}</span>
                    <span className="font-heading font-bold tracking-tight text-[15px] sm:text-base">{section.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {isOpen && (
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full font-semibold">
                        <Globe className="w-3.5 h-3.5" />
                        <span>English & Spanish Active</span>
                      </div>
                    )}
                    <ChevronDown className={cn("w-5 h-5 text-neutral-gray transition-transform duration-200", isOpen && "transform rotate-180 text-primary")} />
                  </div>
                </button>

                {/* Collapsible body content */}
                {isOpen && (
                  <div className="p-6 sm:p-8 bg-white space-y-8 animate-fade-in">
                    
                    {/* HERO SECTION FIELDS */}
                    {section.id === 'hero' && (
                      <div className="space-y-8">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-dark mb-2">Hero Background Video</label>
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary/40 transition-colors bg-gray-50/30">
                            {values.hero_video ? (
                              <div className="relative max-w-md mx-auto bg-black rounded-lg overflow-hidden shadow-sm">
                                <video 
                                  src={values.hero_video.startsWith('blob:') ? values.hero_video : `/storage/${values.hero_video}`} 
                                  controls 
                                  className="max-h-48 mx-auto object-cover w-full" 
                                />
                                <button
                                  type="button"
                                  onClick={() => updateFile('hero_video', null)}
                                  className="absolute top-2 right-2 w-7 h-7 bg-danger/90 hover:bg-danger text-white rounded-full text-sm flex items-center justify-center shadow transition-colors"
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

                        <FormInput
                          label="Splash Screen Tagline"
                          value={values.hero_tagline || ''}
                          onChange={(e) => updateValue('hero_tagline', e.target.value)}
                          placeholder="e.g. Speak. Cook. Connect"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                          <div className="space-y-5 bg-neutral-cream/20 p-5 rounded-2xl border border-neutral-sand/20">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇬🇧</span> English Content (EN)
                            </h4>
                            <FormInput
                              label="Hero Title"
                              value={values.hero_title_en || ''}
                              onChange={(e) => updateValue('hero_title_en', e.target.value)}
                            />
                            <FormTextarea
                              label="Hero Subtitle / Description"
                              value={values.hero_subtitle_en || ''}
                              onChange={(e) => updateValue('hero_subtitle_en', e.target.value)}
                              rows={4}
                            />
                            <FormInput
                              label="CTA Button Text"
                              value={values.hero_cta_en || ''}
                              onChange={(e) => updateValue('hero_cta_en', e.target.value)}
                            />
                            <FormInput
                              label="Scroll/Secondary Button Text"
                              value={values.hero_scroll_en || ''}
                              onChange={(e) => updateValue('hero_scroll_en', e.target.value)}
                            />
                          </div>

                          <div className="space-y-5 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇪🇸</span> Spanish Content (ES)
                            </h4>
                            <FormInput
                              label="Hero Title"
                              value={values.hero_title_es || ''}
                              onChange={(e) => updateValue('hero_title_es', e.target.value)}
                            />
                            <FormTextarea
                              label="Hero Subtitle / Description"
                              value={values.hero_subtitle_es || ''}
                              onChange={(e) => updateValue('hero_subtitle_es', e.target.value)}
                              rows={4}
                            />
                            <FormInput
                              label="CTA Button Text"
                              value={values.hero_cta_es || ''}
                              onChange={(e) => updateValue('hero_cta_es', e.target.value)}
                            />
                            <FormInput
                              label="Scroll/Secondary Button Text"
                              value={values.hero_scroll_es || ''}
                              onChange={(e) => updateValue('hero_scroll_es', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* EXPERIENCE HIGHLIGHTS FIELDS */}
                    {section.id === 'highlights' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4 bg-neutral-cream/20 p-5 rounded-2xl border border-neutral-sand/20">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇬🇧</span> English Header Content
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values.highlights_title_en || ''}
                              onChange={(e) => updateValue('highlights_title_en', e.target.value)}
                            />
                            <FormTextarea
                              label="Section Subtitle"
                              value={values.highlights_subtitle_en || ''}
                              onChange={(e) => updateValue('highlights_subtitle_en', e.target.value)}
                            />
                          </div>
                          <div className="space-y-4 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇪🇸</span> Spanish Header Content
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values.highlights_title_es || ''}
                              onChange={(e) => updateValue('highlights_title_es', e.target.value)}
                            />
                            <FormTextarea
                              label="Section Subtitle"
                              value={values.highlights_subtitle_es || ''}
                              onChange={(e) => updateValue('highlights_subtitle_es', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                          <h4 className="font-bold text-neutral-dark text-base mb-5">Feature Highlights (6 Items)</h4>
                          <div className="space-y-6">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <div key={num} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/60">
                                <h5 className="text-sm font-bold text-neutral-dark mb-4">Highlight Item {num}</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <FormInput
                                      label={`Title (EN)`}
                                      value={values[`highlights_feat${num}_title_en`] || ''}
                                      onChange={(e) => updateValue(`highlights_feat${num}_title_en`, e.target.value)}
                                    />
                                    <FormTextarea
                                      label={`Description (EN)`}
                                      value={values[`highlights_feat${num}_desc_en`] || ''}
                                      onChange={(e) => updateValue(`highlights_feat${num}_desc_en`, e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-4">
                                    <FormInput
                                      label={`Title (ES)`}
                                      value={values[`highlights_feat${num}_title_es`] || ''}
                                      onChange={(e) => updateValue(`highlights_feat${num}_title_es`, e.target.value)}
                                    />
                                    <FormTextarea
                                      label={`Description (ES)`}
                                      value={values[`highlights_feat${num}_desc_es`] || ''}
                                      onChange={(e) => updateValue(`highlights_feat${num}_desc_es`, e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                          <h4 className="font-bold text-neutral-dark text-base mb-5">Bottom Section: Language learning details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 bg-neutral-cream/20 p-5 rounded-2xl border border-neutral-sand/20">
                              <h5 className="text-sm font-bold text-primary flex items-center gap-1">🇬🇧 English Details</h5>
                              <FormInput
                                label="Language Header"
                                value={values.highlights_languageTitle_en || ''}
                                onChange={(e) => updateValue('highlights_languageTitle_en', e.target.value)}
                              />
                              <FormInput
                                label="Language Subtitle"
                                value={values.highlights_languageSubtitle_en || ''}
                                onChange={(e) => updateValue('highlights_languageSubtitle_en', e.target.value)}
                              />
                              <FormTextarea
                                label="Language Paragraphs (One paragraph per line)"
                                value={values.highlights_languageParagraphs_en || ''}
                                onChange={(e) => updateValue('highlights_languageParagraphs_en', e.target.value)}
                                rows={8}
                              />
                            </div>
                            <div className="space-y-4 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                              <h5 className="text-sm font-bold text-primary flex items-center gap-1">🇪🇸 Spanish Details</h5>
                              <FormInput
                                label="Language Header"
                                value={values.highlights_languageTitle_es || ''}
                                onChange={(e) => updateValue('highlights_languageTitle_es', e.target.value)}
                              />
                              <FormInput
                                label="Language Subtitle"
                                value={values.highlights_languageSubtitle_es || ''}
                                onChange={(e) => updateValue('highlights_languageSubtitle_es', e.target.value)}
                              />
                              <FormTextarea
                                label="Language Paragraphs (One paragraph per line)"
                                value={values.highlights_languageParagraphs_es || ''}
                                onChange={(e) => updateValue('highlights_languageParagraphs_es', e.target.value)}
                                rows={8}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                          <h4 className="font-bold text-neutral-dark text-base mb-5">Snake Flowchart Steps</h4>
                          <div className="space-y-6">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <div key={num} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/60">
                                <h5 className="text-sm font-bold text-neutral-dark mb-4">Step {num}</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <FormInput
                                      label={`Step Title (EN)`}
                                      value={values[`flow_step${num}_title_en`] || ''}
                                      onChange={(e) => updateValue(`flow_step${num}_title_en`, e.target.value)}
                                    />
                                    <FormInput
                                      label={`Step Description (EN)`}
                                      value={values[`flow_step${num}_desc_en`] || ''}
                                      onChange={(e) => updateValue(`flow_step${num}_desc_en`, e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-4">
                                    <FormInput
                                      label={`Step Title (ES)`}
                                      value={values[`flow_step${num}_title_es`] || ''}
                                      onChange={(e) => updateValue(`flow_step${num}_title_es`, e.target.value)}
                                    />
                                    <FormInput
                                      label={`Step Description (ES)`}
                                      value={values[`flow_step${num}_desc_es`] || ''}
                                      onChange={(e) => updateValue(`flow_step${num}_desc_es`, e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* COMMUNITY SECTION FIELDS */}
                    {section.id === 'community' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4 bg-neutral-cream/20 p-5 rounded-2xl border border-neutral-sand/20">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇬🇧</span> English Core Headers
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values.community_title_en || ''}
                              onChange={(e) => updateValue('community_title_en', e.target.value)}
                            />
                            <FormTextarea
                              label="Section Subtitle"
                              value={values.community_subtitle_en || ''}
                              onChange={(e) => updateValue('community_subtitle_en', e.target.value)}
                            />
                          </div>
                          <div className="space-y-4 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇪🇸</span> Spanish Core Headers
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values.community_title_es || ''}
                              onChange={(e) => updateValue('community_title_es', e.target.value)}
                            />
                            <FormTextarea
                              label="Section Subtitle"
                              value={values.community_subtitle_es || ''}
                              onChange={(e) => updateValue('community_subtitle_es', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                          <h4 className="font-bold text-neutral-dark text-base mb-5">Community Cards (3 items)</h4>
                          <div className="space-y-8">
                            {[1, 2, 3].map((num) => {
                              const imagePreview = values[`community_image_${num}`]
                                ? (values[`community_image_${num}`].startsWith('blob:') || values[`community_image_${num}`].startsWith('http') || values[`community_image_${num}`].startsWith('/')
                                  ? values[`community_image_${num}`]
                                  : `/storage/${values[`community_image_${num}`]}`)
                                : '';
                              return (
                                <div key={num} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200/60">
                                  <h5 className="text-sm font-bold text-neutral-dark mb-4">Card {num} Details</h5>
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1">
                                      <ImageUpload
                                        label={`Card Image`}
                                        preview={imagePreview}
                                        onChange={(file) => updateFile(`community_image_${num}`, file)}
                                      />
                                    </div>
                                    <div className="lg:col-span-2 space-y-4">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput
                                          label={`Card Title (EN)`}
                                          value={values[`community_card${num}_title_en`] || ''}
                                          onChange={(e) => updateValue(`community_card${num}_title_en`, e.target.value)}
                                        />
                                        <FormInput
                                          label={`Card Title (ES)`}
                                          value={values[`community_card${num}_title_es`] || ''}
                                          onChange={(e) => updateValue(`community_card${num}_title_es`, e.target.value)}
                                        />
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormTextarea
                                          label={`Card Description (EN)`}
                                          value={values[`community_card${num}_desc_en`] || ''}
                                          onChange={(e) => updateValue(`community_card${num}_desc_en`, e.target.value)}
                                        />
                                        <FormTextarea
                                          label={`Card Description (ES)`}
                                          value={values[`community_card${num}_desc_es`] || ''}
                                          onChange={(e) => updateValue(`community_card${num}_desc_es`, e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VIDEO TESTIMONIALS FIELDS */}
                    {section.id === 'testimonials' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4 bg-neutral-cream/20 p-5 rounded-2xl border border-neutral-sand/20">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇬🇧</span> English Core Headers
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values.video_testimonials_title_en || ''}
                              onChange={(e) => updateValue('video_testimonials_title_en', e.target.value)}
                            />
                            <FormInput
                              label="Section Subtitle"
                              value={values.video_testimonials_subtitle_en || ''}
                              onChange={(e) => updateValue('video_testimonials_subtitle_en', e.target.value)}
                            />
                            <FormInput
                              label="See More Button Text"
                              value={values.video_testimonials_seeMore_en || ''}
                              onChange={(e) => updateValue('video_testimonials_seeMore_en', e.target.value)}
                            />
                          </div>
                          <div className="space-y-4 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇪🇸</span> Spanish Core Headers
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values.video_testimonials_title_es || ''}
                              onChange={(e) => updateValue('video_testimonials_title_es', e.target.value)}
                            />
                            <FormInput
                              label="Section Subtitle"
                              value={values.video_testimonials_subtitle_es || ''}
                              onChange={(e) => updateValue('video_testimonials_subtitle_es', e.target.value)}
                            />
                            <FormInput
                              label="See More Button Text"
                              value={values.video_testimonials_seeMore_es || ''}
                              onChange={(e) => updateValue('video_testimonials_seeMore_es', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                          <h4 className="font-bold text-neutral-dark text-base mb-5">YouTube Videos</h4>
                          <div className="space-y-4">
                            {[1, 2, 3].map((num) => (
                              <div key={num} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/60 flex flex-col md:flex-row gap-5 items-center">
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
                      </div>
                    )}

                    {/* SPANISH LEVEL TEST FIELDS */}
                    {section.id === 'level-test' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-5 bg-neutral-cream/20 p-5 rounded-2xl border border-neutral-sand/20">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇪🇸</span> Spanish Test Configuration
                            </h4>
                            <FormInput
                              label="Title (English UI)"
                              value={values.spanishTest_title_en || ''}
                              onChange={(e) => updateValue('spanishTest_title_en', e.target.value)}
                            />
                            <FormInput
                              label="Title (Spanish UI)"
                              value={values.spanishTest_title_es || ''}
                              onChange={(e) => updateValue('spanishTest_title_es', e.target.value)}
                            />
                            <FormTextarea
                              label="Subtitle (English UI)"
                              value={values.spanishTest_subtitle_en || ''}
                              onChange={(e) => updateValue('spanishTest_subtitle_en', e.target.value)}
                            />
                            <FormTextarea
                              label="Subtitle (Spanish UI)"
                              value={values.spanishTest_subtitle_es || ''}
                              onChange={(e) => updateValue('spanishTest_subtitle_es', e.target.value)}
                            />
                            <FormInput
                              label="Start Button (English UI)"
                              value={values.spanishTest_startBtn_en || ''}
                              onChange={(e) => updateValue('spanishTest_startBtn_en', e.target.value)}
                            />
                            <FormInput
                              label="Start Button (Spanish UI)"
                              value={values.spanishTest_startBtn_es || ''}
                              onChange={(e) => updateValue('spanishTest_startBtn_es', e.target.value)}
                            />
                          </div>

                          <div className="space-y-5 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇬🇧</span> English Test Configuration
                            </h4>
                            <FormInput
                              label="Title (English UI)"
                              value={values.englishTest_title_en || ''}
                              onChange={(e) => updateValue('englishTest_title_en', e.target.value)}
                            />
                            <FormInput
                              label="Title (Spanish UI)"
                              value={values.englishTest_title_es || ''}
                              onChange={(e) => updateValue('englishTest_title_es', e.target.value)}
                            />
                            <FormTextarea
                              label="Subtitle (English UI)"
                              value={values.englishTest_subtitle_en || ''}
                              onChange={(e) => updateValue('englishTest_subtitle_en', e.target.value)}
                            />
                            <FormTextarea
                              label="Subtitle (Spanish UI)"
                              value={values.englishTest_subtitle_es || ''}
                              onChange={(e) => updateValue('englishTest_subtitle_es', e.target.value)}
                            />
                            <FormInput
                              label="Start Button (English UI)"
                              value={values.englishTest_startBtn_en || ''}
                              onChange={(e) => updateValue('englishTest_startBtn_en', e.target.value)}
                            />
                            <FormInput
                              label="Start Button (Spanish UI)"
                              value={values.englishTest_startBtn_es || ''}
                              onChange={(e) => updateValue('englishTest_startBtn_es', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* HOW IT WORKS FIELDS */}
                    {section.id === 'how-it-works' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4 bg-neutral-cream/20 p-5 rounded-2xl border border-neutral-sand/20">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇬🇧</span> English Core Headers
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values.howItWorks_title_en || ''}
                              onChange={(e) => updateValue('howItWorks_title_en', e.target.value)}
                            />
                            <FormTextarea
                              label="Section Subtitle"
                              value={values.howItWorks_subtitle_en || ''}
                              onChange={(e) => updateValue('howItWorks_subtitle_en', e.target.value)}
                            />
                            <FormInput
                              label="CTA Button Text"
                              value={values.howItWorks_cta_en || ''}
                              onChange={(e) => updateValue('howItWorks_cta_en', e.target.value)}
                            />
                          </div>
                          <div className="space-y-4 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇪🇸</span> Spanish Core Headers
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values.howItWorks_title_es || ''}
                              onChange={(e) => updateValue('howItWorks_title_es', e.target.value)}
                            />
                            <FormTextarea
                              label="Section Subtitle"
                              value={values.howItWorks_subtitle_es || ''}
                              onChange={(e) => updateValue('howItWorks_subtitle_es', e.target.value)}
                            />
                            <FormInput
                              label="CTA Button Text"
                              value={values.howItWorks_cta_es || ''}
                              onChange={(e) => updateValue('howItWorks_cta_es', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                          <h4 className="font-bold text-neutral-dark text-base mb-5">Step Cards (3 steps)</h4>
                          <div className="space-y-6">
                            {[1, 2, 3].map((num) => (
                              <div key={num} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/60">
                                <h5 className="text-sm font-bold text-neutral-dark mb-4">Step {num} Details</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <FormInput
                                      label={`Step ${num} Title (EN)`}
                                      value={values[`howItWorks_step${num}_title_en`] || ''}
                                      onChange={(e) => updateValue(`howItWorks_step${num}_title_en`, e.target.value)}
                                    />
                                    <FormTextarea
                                      label={`Step ${num} Description (EN)`}
                                      value={values[`howItWorks_step${num}_desc_en`] || ''}
                                      onChange={(e) => updateValue(`howItWorks_step${num}_desc_en`, e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-4">
                                    <FormInput
                                      label={`Step ${num} Title (ES)`}
                                      value={values[`howItWorks_step${num}_title_es`] || ''}
                                      onChange={(e) => updateValue(`howItWorks_step${num}_title_es`, e.target.value)}
                                    />
                                    <FormTextarea
                                      label={`Step ${num} Description (ES)`}
                                      value={values[`howItWorks_step${num}_desc_es`] || ''}
                                      onChange={(e) => updateValue(`howItWorks_step${num}_desc_es`, e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UPCOMING EVENTS FIELDS */}
                    {section.id === 'events' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4 bg-neutral-cream/20 p-5 rounded-2xl border border-neutral-sand/20">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇬🇧</span> English Core Headers
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values.upcomingEvents_title_en || ''}
                              onChange={(e) => updateValue('upcomingEvents_title_en', e.target.value)}
                            />
                            <FormTextarea
                              label="Section Subtitle"
                              value={values.upcomingEvents_subtitle_en || ''}
                              onChange={(e) => updateValue('upcomingEvents_subtitle_en', e.target.value)}
                            />
                          </div>
                          <div className="space-y-4 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                              <span>🇪🇸</span> Spanish Core Headers
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values.upcomingEvents_title_es || ''}
                              onChange={(e) => updateValue('upcomingEvents_title_es', e.target.value)}
                            />
                            <FormTextarea
                              label="Section Subtitle"
                              value={values.upcomingEvents_subtitle_es || ''}
                              onChange={(e) => updateValue('upcomingEvents_subtitle_es', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}

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
