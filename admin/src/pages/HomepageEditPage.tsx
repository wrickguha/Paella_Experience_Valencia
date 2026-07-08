import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, Info, RefreshCw } from 'lucide-react';
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
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { /* empty */ }
    setSaving(false);
  };

  return (
    <div>
      <PageHeader 
        title="Homepage Content Editor" 
        description="Edit and customize all texts, images, and videos visible on the Homepage."
      >
        <Button onClick={handleSave} loading={saving} disabled={!hasChanges}>
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </PageHeader>

      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-4 p-3 rounded-lg bg-success/10 text-success text-sm font-medium border border-success/20"
        >
          {successMsg}
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner />
        </div>
      ) : (
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Navigation Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <Card className="p-2 sticky top-6">
              <nav className="space-y-0.5">
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors text-left',
                      activeSection === s.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-neutral-gray hover:bg-gray-100 hover:text-neutral-dark',
                    )}
                  >
                    <span className="text-base">{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Form Content Editor */}
          <div className="flex-1">
            <Card className="p-6">
              {/* Active Section Header */}
              <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-neutral-dark flex items-center gap-2">
                  <span>{SECTIONS.find(s => s.id === activeSection)?.icon}</span>
                  {SECTIONS.find(s => s.id === activeSection)?.label}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-neutral-gray bg-neutral-cream px-2.5 py-1 rounded-full">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Multilingual Support Active</span>
                </div>
              </div>

              {/* Form Fields according to active section */}
              {activeSection === 'hero' && (
                <div className="space-y-6">
                  {/* Hero Video Upload */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1.5">Hero Background Video</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-primary/40 transition-colors">
                      {values.hero_video ? (
                        <div className="relative max-w-md mx-auto">
                          <video 
                            src={values.hero_video.startsWith('blob:') ? values.hero_video : `/storage/${values.hero_video}`} 
                            controls 
                            className="max-h-40 mx-auto rounded-lg object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => updateFile('hero_video', null)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full text-xs flex items-center justify-center shadow"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block py-4">
                          <div className="text-neutral-gray text-sm">
                            <span className="text-primary font-medium">Click to upload video</span> or drag and drop
                          </div>
                          <p className="text-xs text-neutral-gray mt-1">MP4 up to 20MB</p>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary">English Content (EN)</h4>
                      <FormInput
                        label="Hero Title (English)"
                        value={values.hero_title_en || ''}
                        onChange={(e) => updateValue('hero_title_en', e.target.value)}
                      />
                      <FormTextarea
                        label="Hero Subtitle / description (English)"
                        value={values.hero_subtitle_en || ''}
                        onChange={(e) => updateValue('hero_subtitle_en', e.target.value)}
                        rows={4}
                      />
                      <FormInput
                        label="CTA Button Text (English)"
                        value={values.hero_cta_en || ''}
                        onChange={(e) => updateValue('hero_cta_en', e.target.value)}
                      />
                      <FormInput
                        label="Scroll/Secondary Button Text (English)"
                        value={values.hero_scroll_en || ''}
                        onChange={(e) => updateValue('hero_scroll_en', e.target.value)}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary">Spanish Content (ES)</h4>
                      <FormInput
                        label="Hero Title (Spanish)"
                        value={values.hero_title_es || ''}
                        onChange={(e) => updateValue('hero_title_es', e.target.value)}
                      />
                      <FormTextarea
                        label="Hero Subtitle / description (Spanish)"
                        value={values.hero_subtitle_es || ''}
                        onChange={(e) => updateValue('hero_subtitle_es', e.target.value)}
                        rows={4}
                      />
                      <FormInput
                        label="CTA Button Text (Spanish)"
                        value={values.hero_cta_es || ''}
                        onChange={(e) => updateValue('hero_cta_es', e.target.value)}
                      />
                      <FormInput
                        label="Scroll/Secondary Button Text (Spanish)"
                        value={values.hero_scroll_es || ''}
                        onChange={(e) => updateValue('hero_scroll_es', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'highlights' && (
                <div className="space-y-8">
                  {/* General highlights headers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary">English Core Headers</h4>
                      <FormInput
                        label="Section Title (EN)"
                        value={values.highlights_title_en || ''}
                        onChange={(e) => updateValue('highlights_title_en', e.target.value)}
                      />
                      <FormTextarea
                        label="Section Subtitle (EN)"
                        value={values.highlights_subtitle_en || ''}
                        onChange={(e) => updateValue('highlights_subtitle_en', e.target.value)}
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary">Spanish Core Headers</h4>
                      <FormInput
                        label="Section Title (ES)"
                        value={values.highlights_title_es || ''}
                        onChange={(e) => updateValue('highlights_title_es', e.target.value)}
                      />
                      <FormTextarea
                        label="Section Subtitle (ES)"
                        value={values.highlights_subtitle_es || ''}
                        onChange={(e) => updateValue('highlights_subtitle_es', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Highlights feature items (1-6) */}
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-semibold text-neutral-dark mb-4">Feature Highlights Items (6 Cards)</h4>
                    
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <div key={num} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-6">
                        <h5 className="text-sm font-semibold text-primary mb-3">Item {num} Details</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <FormInput
                              label={`Title (EN) — Card ${num}`}
                              value={values[`highlights_feat${num}_title_en`] || ''}
                              onChange={(e) => updateValue(`highlights_feat${num}_title_en`, e.target.value)}
                            />
                            <FormTextarea
                              label={`Description (EN) — Card ${num}`}
                              value={values[`highlights_feat${num}_desc_en`] || ''}
                              onChange={(e) => updateValue(`highlights_feat${num}_desc_en`, e.target.value)}
                            />
                          </div>
                          <div className="space-y-3">
                            <FormInput
                              label={`Title (ES) — Card ${num}`}
                              value={values[`highlights_feat${num}_title_es`] || ''}
                              onChange={(e) => updateValue(`highlights_feat${num}_title_es`, e.target.value)}
                            />
                            <FormTextarea
                              label={`Description (ES) — Card ${num}`}
                              value={values[`highlights_feat${num}_desc_es`] || ''}
                              onChange={(e) => updateValue(`highlights_feat${num}_desc_es`, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Split - Language section */}
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-semibold text-neutral-dark mb-4">Bottom Section: Language learning details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h5 className="text-sm font-semibold text-primary">English details</h5>
                        <FormInput
                          label="Language Header (EN)"
                          value={values.highlights_languageTitle_en || ''}
                          onChange={(e) => updateValue('highlights_languageTitle_en', e.target.value)}
                        />
                        <FormInput
                          label="Language Subtitle (EN)"
                          value={values.highlights_languageSubtitle_en || ''}
                          onChange={(e) => updateValue('highlights_languageSubtitle_en', e.target.value)}
                        />
                        <FormTextarea
                          label="Language Paragraphs (EN) — Use new line for each paragraph"
                          value={values.highlights_languageParagraphs_en || ''}
                          onChange={(e) => updateValue('highlights_languageParagraphs_en', e.target.value)}
                          rows={8}
                        />
                      </div>
                      <div className="space-y-4">
                        <h5 className="text-sm font-semibold text-primary">Spanish details</h5>
                        <FormInput
                          label="Language Header (ES)"
                          value={values.highlights_languageTitle_es || ''}
                          onChange={(e) => updateValue('highlights_languageTitle_es', e.target.value)}
                        />
                        <FormInput
                          label="Language Subtitle (ES)"
                          value={values.highlights_languageSubtitle_es || ''}
                          onChange={(e) => updateValue('highlights_languageSubtitle_es', e.target.value)}
                        />
                        <FormTextarea
                          label="Language Paragraphs (ES) — Use new line for each paragraph"
                          value={values.highlights_languageParagraphs_es || ''}
                          onChange={(e) => updateValue('highlights_languageParagraphs_es', e.target.value)}
                          rows={8}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Snake steps flowchart */}
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-semibold text-neutral-dark mb-4">Snake Flowchart steps (1-5)</h4>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-6">
                        <h5 className="text-sm font-semibold text-primary mb-3">Step {num} Details</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <FormInput
                              label={`Step ${num} Title (EN)`}
                              value={values[`flow_step${num}_title_en`] || ''}
                              onChange={(e) => updateValue(`flow_step${num}_title_en`, e.target.value)}
                            />
                            <FormInput
                              label={`Step ${num} Description (EN)`}
                              value={values[`flow_step${num}_desc_en`] || ''}
                              onChange={(e) => updateValue(`flow_step${num}_desc_en`, e.target.value)}
                            />
                          </div>
                          <div className="space-y-3">
                            <FormInput
                              label={`Step ${num} Title (ES)`}
                              value={values[`flow_step${num}_title_es`] || ''}
                              onChange={(e) => updateValue(`flow_step${num}_title_es`, e.target.value)}
                            />
                            <FormInput
                              label={`Step ${num} Description (ES)`}
                              value={values[`flow_step${num}_desc_es`] || ''}
                              onChange={(e) => updateValue(`flow_step${num}_desc_es`, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'community' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary">English Core Headers</h4>
                      <FormInput
                        label="Section Title (EN)"
                        value={values.community_title_en || ''}
                        onChange={(e) => updateValue('community_title_en', e.target.value)}
                      />
                      <FormTextarea
                        label="Section Subtitle (EN)"
                        value={values.community_subtitle_en || ''}
                        onChange={(e) => updateValue('community_subtitle_en', e.target.value)}
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary">Spanish Core Headers</h4>
                      <FormInput
                        label="Section Title (ES)"
                        value={values.community_title_es || ''}
                        onChange={(e) => updateValue('community_title_es', e.target.value)}
                      />
                      <FormTextarea
                        label="Section Subtitle (ES)"
                        value={values.community_subtitle_es || ''}
                        onChange={(e) => updateValue('community_subtitle_es', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-semibold text-neutral-dark mb-4">Community Cards (3 Cards)</h4>
                    {[1, 2, 3].map((num) => {
                      const imagePreview = values[`community_image_${num}`]
                        ? (values[`community_image_${num}`].startsWith('blob:') || values[`community_image_${num}`].startsWith('http') || values[`community_image_${num}`].startsWith('/')
                          ? values[`community_image_${num}`]
                          : `/storage/${values[`community_image_${num}`]}`)
                        : '';
                      return (
                        <div key={num} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-6">
                          <h5 className="text-sm font-semibold text-primary mb-3">Community Card {num}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                              <ImageUpload
                                label={`Card ${num} Image`}
                                preview={imagePreview}
                                onChange={(file) => updateFile(`community_image_${num}`, file)}
                              />
                            </div>
                            <div className="md:col-span-2 space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                  label={`Card ${num} Title (EN)`}
                                  value={values[`community_card${num}_title_en`] || ''}
                                  onChange={(e) => updateValue(`community_card${num}_title_en`, e.target.value)}
                                />
                                <FormInput
                                  label={`Card ${num} Title (ES)`}
                                  value={values[`community_card${num}_title_es`] || ''}
                                  onChange={(e) => updateValue(`community_card${num}_title_es`, e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormTextarea
                                  label={`Card ${num} Description (EN)`}
                                  value={values[`community_card${num}_desc_en`] || ''}
                                  onChange={(e) => updateValue(`community_card${num}_desc_en`, e.target.value)}
                                />
                                <FormTextarea
                                  label={`Card ${num} Description (ES)`}
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
              )}

              {activeSection === 'testimonials' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary">English Core Headers</h4>
                      <FormInput
                        label="Section Title (EN)"
                        value={values.video_testimonials_title_en || ''}
                        onChange={(e) => updateValue('video_testimonials_title_en', e.target.value)}
                      />
                      <FormInput
                        label="Section Subtitle (EN)"
                        value={values.video_testimonials_subtitle_en || ''}
                        onChange={(e) => updateValue('video_testimonials_subtitle_en', e.target.value)}
                      />
                      <FormInput
                        label="See More Button Text (EN)"
                        value={values.video_testimonials_seeMore_en || ''}
                        onChange={(e) => updateValue('video_testimonials_seeMore_en', e.target.value)}
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary">Spanish Core Headers</h4>
                      <FormInput
                        label="Section Title (ES)"
                        value={values.video_testimonials_title_es || ''}
                        onChange={(e) => updateValue('video_testimonials_title_es', e.target.value)}
                      />
                      <FormInput
                        label="Section Subtitle (ES)"
                        value={values.video_testimonials_subtitle_es || ''}
                        onChange={(e) => updateValue('video_testimonials_subtitle_es', e.target.value)}
                      />
                      <FormInput
                        label="See More Button Text (ES)"
                        value={values.video_testimonials_seeMore_es || ''}
                        onChange={(e) => updateValue('video_testimonials_seeMore_es', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-semibold text-neutral-dark mb-4">YouTube Testimonial Videos</h4>
                    <div className="space-y-4">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                          <div className="flex-1 w-full">
                            <FormInput
                              label={`YouTube Video ${num} (URL, Short or ID)`}
                              value={values[`testimonial_video_${num}`] || ''}
                              onChange={(e) => updateValue(`testimonial_video_${num}`, e.target.value)}
                              placeholder="e.g. https://www.youtube.com/watch?v=..."
                            />
                          </div>
                          {values[`testimonial_video_${num}`] && (
                            <div className="w-32 h-18 bg-neutral-cream rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                              {/* Simple YouTube Thumbnail check */}
                              <img 
                                src={`https://img.youtube.com/vi/${
                                  values[`testimonial_video_${num}`].includes('v=')
                                    ? values[`testimonial_video_${num}`].split('v=')[1]?.split('&')[0]
                                    : values[`testimonial_video_${num}`].split('/').pop()?.split('?')[0]
                                }/mqdefault.jpg`}
                                alt="Video Thumbnail"
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

              {activeSection === 'level-test' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 border-r border-gray-100 pr-6">
                      <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                        <span>🇪🇸</span> Spanish Test Intro Configuration
                      </h4>
                      <div className="space-y-3">
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
                          label="Description (English UI)"
                          value={values.spanishTest_subtitle_en || ''}
                          onChange={(e) => updateValue('spanishTest_subtitle_en', e.target.value)}
                        />
                        <FormTextarea
                          label="Description (Spanish UI)"
                          value={values.spanishTest_subtitle_es || ''}
                          onChange={(e) => updateValue('spanishTest_subtitle_es', e.target.value)}
                        />
                        <FormInput
                          label="Start Button Text (English UI)"
                          value={values.spanishTest_startBtn_en || ''}
                          onChange={(e) => updateValue('spanishTest_startBtn_en', e.target.value)}
                        />
                        <FormInput
                          label="Start Button Text (Spanish UI)"
                          value={values.spanishTest_startBtn_es || ''}
                          onChange={(e) => updateValue('spanishTest_startBtn_es', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                        <span>🇬🇧</span> English Test Intro Configuration
                      </h4>
                      <div className="space-y-3">
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
                          label="Description (English UI)"
                          value={values.englishTest_subtitle_en || ''}
                          onChange={(e) => updateValue('englishTest_subtitle_en', e.target.value)}
                        />
                        <FormTextarea
                          label="Description (Spanish UI)"
                          value={values.englishTest_subtitle_es || ''}
                          onChange={(e) => updateValue('englishTest_subtitle_es', e.target.value)}
                        />
                        <FormInput
                          label="Start Button Text (English UI)"
                          value={values.englishTest_startBtn_en || ''}
                          onChange={(e) => updateValue('englishTest_startBtn_en', e.target.value)}
                        />
                        <FormInput
                          label="Start Button Text (Spanish UI)"
                          value={values.englishTest_startBtn_es || ''}
                          onChange={(e) => updateValue('englishTest_startBtn_es', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'how-it-works' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary">English Core Headers</h4>
                      <FormInput
                        label="Section Title (EN)"
                        value={values.howItWorks_title_en || ''}
                        onChange={(e) => updateValue('howItWorks_title_en', e.target.value)}
                      />
                      <FormTextarea
                        label="Section Subtitle (EN)"
                        value={values.howItWorks_subtitle_en || ''}
                        onChange={(e) => updateValue('howItWorks_subtitle_en', e.target.value)}
                      />
                      <FormInput
                        label="CTA Button Text (EN)"
                        value={values.howItWorks_cta_en || ''}
                        onChange={(e) => updateValue('howItWorks_cta_en', e.target.value)}
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary">Spanish Core Headers</h4>
                      <FormInput
                        label="Section Title (ES)"
                        value={values.howItWorks_title_es || ''}
                        onChange={(e) => updateValue('howItWorks_title_es', e.target.value)}
                      />
                      <FormTextarea
                        label="Section Subtitle (ES)"
                        value={values.howItWorks_subtitle_es || ''}
                        onChange={(e) => updateValue('howItWorks_subtitle_es', e.target.value)}
                      />
                      <FormInput
                        label="CTA Button Text (ES)"
                        value={values.howItWorks_cta_es || ''}
                        onChange={(e) => updateValue('howItWorks_cta_es', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-semibold text-neutral-dark mb-4">Step Cards (3 Steps)</h4>
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-6">
                        <h5 className="text-sm font-semibold text-primary mb-3">Step {num} Details</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
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
                          <div className="space-y-3">
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
              )}

              {activeSection === 'events' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary">English Core Headers</h4>
                      <FormInput
                        label="Section Title (EN)"
                        value={values.upcomingEvents_title_en || ''}
                        onChange={(e) => updateValue('upcomingEvents_title_en', e.target.value)}
                      />
                      <FormTextarea
                        label="Section Subtitle (EN)"
                        value={values.upcomingEvents_subtitle_en || ''}
                        onChange={(e) => updateValue('upcomingEvents_subtitle_en', e.target.value)}
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-primary">Spanish Core Headers</h4>
                      <FormInput
                        label="Section Title (ES)"
                        value={values.upcomingEvents_title_es || ''}
                        onChange={(e) => updateValue('upcomingEvents_title_es', e.target.value)}
                      />
                      <FormTextarea
                        label="Section Subtitle (ES)"
                        value={values.upcomingEvents_subtitle_es || ''}
                        onChange={(e) => updateValue('upcomingEvents_subtitle_es', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions inside editor Card */}
              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setValues(originalValues);
                    setFiles({});
                    setHasChanges(false);
                  }}
                  disabled={!hasChanges || saving}
                >
                  Discard Changes
                </Button>
                <Button onClick={handleSave} loading={saving} disabled={!hasChanges}>
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
