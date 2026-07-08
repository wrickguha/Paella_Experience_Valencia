import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Globe, ChevronDown, Check, Video, Image, FileText, Calendar, Compass, Users } from 'lucide-react';
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
        description="Easily customize and change any static content, texts, images, and videos on the Homepage."
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

                          <FormInput
                            label="Splash Screen Tagline"
                            value={values.hero_tagline || ''}
                            onChange={(e) => updateValue('hero_tagline', e.target.value)}
                            placeholder="e.g. Speak. Cook. Connect"
                          />

                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                              Hero Content ({editLang.toUpperCase()})
                            </h4>
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
