import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, ChevronDown, Check, Compass, Info, Users, BookOpen, Star, Sparkles } from 'lucide-react';
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

export default function AboutPageEditPage() {
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
    { id: 'hero', label: 'Hero Header Section', icon: <Compass className="w-5 h-5" />, description: 'Edit tagline description and call-to-action buttons.' },
    { id: 'story', label: 'Our Story Section', icon: <Info className="w-5 h-5" />, description: 'Edit introduction headers, multi-paragraph content, and upload chef image.' },
    { id: 'vision', label: 'Community Vision', icon: <Users className="w-5 h-5" />, description: 'Edit titles, description paragraphs, and three highlights list items.' },
    { id: 'language', label: 'Language & Culture', icon: <BookOpen className="w-5 h-5" />, description: 'Modify description copy, upload sidebar image, and edit three features.' },
    { id: 'different', label: 'Differentiators', icon: <Star className="w-5 h-5" />, description: 'Customize titles and sub-texts for three features showing what makes us different.' },
    { id: 'cta', label: 'Final CTA block', icon: <Sparkles className="w-5 h-5" />, description: 'Edit heading titles, booking CTA buttons, and contact button labels.' },
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
      
      // Clean up local blob URLs for images
      const mediaKeys = [
        'about_story_image',
        'about_language_image'
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
      setSuccessMsg('About page changes saved successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { /* empty */ }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <PageHeader 
        title="About Page Editor" 
        description="Edit and customize static titles, visual headers, text paragraphs, images, and CTA button labels on the About Page."
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
                      
                      {/* HERO HEADER SECTION */}
                      {section.id === 'hero' && (
                        <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                          <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                            <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                            Hero Settings ({editLang.toUpperCase()})
                          </h4>
                          <FormInput
                            label="Hero Section Title"
                            value={values[`about_hero_title_${editLang}`] || ''}
                            onChange={(e) => updateValue(`about_hero_title_${editLang}`, e.target.value)}
                          />
                          <FormTextarea
                            label="Hero Section Subtitle"
                            value={values[`about_hero_subtitle_${editLang}`] || ''}
                            onChange={(e) => updateValue(`about_hero_subtitle_${editLang}`, e.target.value)}
                            rows={3}
                          />
                          <FormInput
                            label="Hero Section Button text"
                            value={values[`about_hero_cta_${editLang}`] || ''}
                            onChange={(e) => updateValue(`about_hero_cta_${editLang}`, e.target.value)}
                          />
                        </div>
                      )}

                      {/* OUR STORY SECTION */}
                      {section.id === 'story' && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-semibold text-neutral-dark mb-2">Our Story Image</label>
                            <ImageUpload
                              label="Chef Image"
                              preview={values.about_story_image ? (values.about_story_image.startsWith('blob:') || values.about_story_image.startsWith('http') || values.about_story_image.startsWith('/') ? values.about_story_image : `/storage/${values.about_story_image}`) : ''}
                              onChange={(file) => updateFile('about_story_image', file)}
                            />
                          </div>

                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                              Story Content ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Story Section Subtitle Tagline"
                              value={values[`about_story_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`about_story_subtitle_${editLang}`, e.target.value)}
                            />
                            <FormInput
                              label="Story Section Title"
                              value={values[`about_story_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`about_story_title_${editLang}`, e.target.value)}
                            />
                            <FormTextarea
                              label="Story Multi-line Content"
                              value={values[`about_story_content_${editLang}`] || ''}
                              onChange={(e) => updateValue(`about_story_content_${editLang}`, e.target.value)}
                              rows={8}
                            />
                          </div>
                        </div>
                      )}

                      {/* COMMUNITY VISION SECTION */}
                      {section.id === 'vision' && (
                        <div className="space-y-6">
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                              Vision Headers ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Vision Subtitle Tagline"
                              value={values[`about_vision_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`about_vision_subtitle_${editLang}`, e.target.value)}
                            />
                            <FormInput
                              label="Vision Title"
                              value={values[`about_vision_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`about_vision_title_${editLang}`, e.target.value)}
                            />
                            <FormTextarea
                              label="Vision Paragraph description"
                              value={values[`about_vision_content_${editLang}`] || ''}
                              onChange={(e) => updateValue(`about_vision_content_${editLang}`, e.target.value)}
                              rows={3}
                            />
                          </div>

                          <div className="border-t border-gray-100 pt-6">
                            <h4 className="font-bold text-neutral-dark text-base mb-4">Vision Highlights (3 items)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              {[1, 2, 3].map((num) => (
                                <div key={num} className="bg-gray-50/30 p-4 rounded-xl border border-gray-200/50 space-y-3">
                                  <h5 className="text-xs font-bold text-neutral-gray uppercase tracking-wider">Highlight {num} ({editLang.toUpperCase()})</h5>
                                  <FormInput
                                    label="Highlight Title"
                                    value={values[`about_vision_highlight${num}_title_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`about_vision_highlight${num}_title_${editLang}`, e.target.value)}
                                  />
                                  <FormTextarea
                                    label="Highlight Description"
                                    value={values[`about_vision_highlight${num}_desc_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`about_vision_highlight${num}_desc_${editLang}`, e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* LANGUAGE & CULTURE SECTION */}
                      {section.id === 'language' && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-semibold text-neutral-dark mb-2">Language Section Image</label>
                            <ImageUpload
                              label="Section Sidebar Image"
                              preview={values.about_language_image ? (values.about_language_image.startsWith('blob:') || values.about_language_image.startsWith('http') || values.about_language_image.startsWith('/') ? values.about_language_image : `/storage/${values.about_language_image}`) : ''}
                              onChange={(file) => updateFile('about_language_image', file)}
                            />
                          </div>

                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                              Language Headers ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Language Subtitle Tagline"
                              value={values[`about_language_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`about_language_subtitle_${editLang}`, e.target.value)}
                            />
                            <FormInput
                              label="Language Title"
                              value={values[`about_language_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`about_language_title_${editLang}`, e.target.value)}
                            />
                            <FormTextarea
                              label="Language Content Paragraph"
                              value={values[`about_language_content_${editLang}`] || ''}
                              onChange={(e) => updateValue(`about_language_content_${editLang}`, e.target.value)}
                              rows={3}
                            />
                          </div>

                          <div className="border-t border-gray-100 pt-6">
                            <h4 className="font-bold text-neutral-dark text-base mb-4">Core Feature Points (3 points)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              {[1, 2, 3].map((num) => (
                                <div key={num} className="bg-gray-50/30 p-4 rounded-xl border border-gray-200/50 space-y-3">
                                  <h5 className="text-xs font-bold text-neutral-gray uppercase tracking-wider">Point {num} ({editLang.toUpperCase()})</h5>
                                  <FormInput
                                    label="Point Title"
                                    value={values[`about_language_point${num}_title_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`about_language_point${num}_title_${editLang}`, e.target.value)}
                                  />
                                  <FormTextarea
                                    label="Point Description"
                                    value={values[`about_language_point${num}_desc_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`about_language_point${num}_desc_${editLang}`, e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* DIFFERENTIATORS SECTION */}
                      {section.id === 'different' && (
                        <div className="space-y-6">
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                              Differentiator Headers ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Section Subtitle Tagline"
                              value={values[`about_different_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`about_different_subtitle_${editLang}`, e.target.value)}
                            />
                            <FormInput
                              label="Section Title"
                              value={values[`about_different_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`about_different_title_${editLang}`, e.target.value)}
                            />
                          </div>

                          <div className="border-t border-gray-100 pt-6">
                            <h4 className="font-bold text-neutral-dark text-base mb-4">Core Differentiators (3 items)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              {[1, 2, 3].map((num) => (
                                <div key={num} className="bg-gray-50/30 p-4 rounded-xl border border-gray-200/50 space-y-3">
                                  <h5 className="text-xs font-bold text-neutral-gray uppercase tracking-wider">Item {num} ({editLang.toUpperCase()})</h5>
                                  <FormInput
                                    label="Item Title"
                                    value={values[`about_different_item${num}_title_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`about_different_item${num}_title_${editLang}`, e.target.value)}
                                  />
                                  <FormTextarea
                                    label="Item Description"
                                    value={values[`about_different_item${num}_desc_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`about_different_item${num}_desc_${editLang}`, e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* FINAL CTA SECTION */}
                      {section.id === 'cta' && (
                        <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                          <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                            <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                            Final CTA Content ({editLang.toUpperCase()})
                          </h4>
                          <FormInput
                            label="CTA Block Title"
                            value={values[`about_cta_title_${editLang}`] || ''}
                            onChange={(e) => updateValue(`about_cta_title_${editLang}`, e.target.value)}
                          />
                          <FormTextarea
                            label="CTA Block Description"
                            value={values[`about_cta_desc_${editLang}`] || ''}
                            onChange={(e) => updateValue(`about_cta_desc_${editLang}`, e.target.value)}
                            rows={3}
                          />
                          <FormInput
                            label="Primary Action Button Text (Booking)"
                            value={values[`about_cta_primary_${editLang}`] || ''}
                            onChange={(e) => updateValue(`about_cta_primary_${editLang}`, e.target.value)}
                          />
                          <FormInput
                            label="Secondary Action Button Text (Contact)"
                            value={values[`about_cta_secondary_${editLang}`] || ''}
                            onChange={(e) => updateValue(`about_cta_secondary_${editLang}`, e.target.value)}
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
