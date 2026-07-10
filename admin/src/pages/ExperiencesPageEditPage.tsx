import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, ChevronDown, Check, Compass, Eye, Info } from 'lucide-react';
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
