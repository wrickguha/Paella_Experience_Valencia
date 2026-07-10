import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, ChevronDown, Check, Compass, Info, ListChecks, FileText } from 'lucide-react';
import { settingsApi } from '@/services/api';
import PageHeader, { Card, Button, Spinner } from '@/components/ui';
import { FormInput, FormTextarea } from '@/components/FormFields';
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

export default function LanguageTestsPageEditPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [editLang, setEditLang] = useState<'en' | 'es'>('en');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  const SECTIONS: SectionConfig[] = [
    { id: 'hero', label: 'Hero Header Section', icon: <Compass className="w-5 h-5" />, description: 'Edit main heading, subtitle scripts, descriptions, CTAs, and floating emojis.' },
    { id: 'info', label: 'Info Strip Indicators', icon: <Info className="w-5 h-5" />, description: 'Modify the four quick indicators listed below the hero section.' },
    { id: 'works', label: 'How It Works Steps', icon: <ListChecks className="w-5 h-5" />, description: 'Customize section header and the 3 step cards detail.' },
    { id: 'cta', label: 'Lead Capture Form Settings', icon: <FileText className="w-5 h-5" />, description: 'Edit titles, form descriptions, success prompts, and submit button texts.' },
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
      setSuccessMsg('Language tests page changes saved successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { /* empty */ }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <PageHeader 
        title="Language Level Tests Page Editor" 
        description="Edit and customize header scripts, indicators, how it works description steps, and form CTA settings."
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
                            Hero Header Settings ({editLang.toUpperCase()})
                          </h4>
                          <FormInput
                            label="Hero Title"
                            value={values[`langtests_hero_title_${editLang}`] || ''}
                            onChange={(e) => updateValue(`langtests_hero_title_${editLang}`, e.target.value)}
                          />
                          <FormInput
                            label="Hero Script Subtitle Tagline"
                            value={values[`langtests_hero_subtitle_${editLang}`] || ''}
                            onChange={(e) => updateValue(`langtests_hero_subtitle_${editLang}`, e.target.value)}
                            placeholder="e.g. Pruebas de Nivel"
                          />
                          <FormTextarea
                            label="Hero Description"
                            value={values[`langtests_hero_desc_${editLang}`] || ''}
                            onChange={(e) => updateValue(`langtests_hero_desc_${editLang}`, e.target.value)}
                            rows={3}
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                              label="Primary CTA Button label"
                              value={values[`langtests_hero_primary_cta_${editLang}`] || ''}
                              onChange={(e) => updateValue(`langtests_hero_primary_cta_${editLang}`, e.target.value)}
                            />
                            <FormInput
                              label="Secondary CTA Button label"
                              value={values[`langtests_hero_secondary_cta_${editLang}`] || ''}
                              onChange={(e) => updateValue(`langtests_hero_secondary_cta_${editLang}`, e.target.value)}
                            />
                          </div>

                          <div className="border-t border-gray-200/60 pt-4 mt-4 space-y-2">
                            <FormInput
                              label="Floating Hero Emojis (Comma separated)"
                              value={values.langtests_hero_emojis || ''}
                              onChange={(e) => updateValue('langtests_hero_emojis', e.target.value)}
                              placeholder="e.g. 🇪🇸,🇬🇧,🗣️,🎧,📖,✍️"
                            />
                            <p className="text-[11px] text-neutral-gray">Enter emojis separated by commas to display floating animations in the header.</p>
                          </div>
                        </div>
                      )}

                      {/* INFO STRIP SECTION */}
                      {section.id === 'info' && (
                        <div className="space-y-6">
                          <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                            📊 Info Strip Indicators ({editLang.toUpperCase()})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((num) => (
                              <div key={num} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-3">
                                <h5 className="text-xs font-bold text-neutral-dark uppercase tracking-wider">Indicator {num}</h5>
                                <FormInput
                                  label="Icon / Emoji"
                                  value={values[`langtests_info${num}_icon`] || ''}
                                  onChange={(e) => updateValue(`langtests_info${num}_icon`, e.target.value)}
                                  placeholder="e.g. 🎧"
                                />
                                <FormInput
                                  label="Label"
                                  value={values[`langtests_info${num}_text_${editLang}`] || ''}
                                  onChange={(e) => updateValue(`langtests_info${num}_text_${editLang}`, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* HOW IT WORKS SECTION */}
                      {section.id === 'works' && (
                        <div className="space-y-6">
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                              ⚙️ How It Works Title ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Section Title"
                              value={values[`langtests_works_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`langtests_works_title_${editLang}`, e.target.value)}
                            />
                          </div>

                          <div className="border-t border-gray-100 pt-6">
                            <h4 className="font-bold text-neutral-dark text-base mb-4">Step Cards (3 items)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              {[1, 2, 3].map((num) => (
                                <div key={num} className="bg-gray-50/30 p-4 rounded-xl border border-gray-200/50 space-y-3">
                                  <h5 className="text-xs font-bold text-neutral-gray uppercase tracking-wider">Step {num} ({editLang.toUpperCase()})</h5>
                                  <FormInput
                                    label="Icon / Emoji"
                                    value={values[`langtests_works${num}_icon`] || ''}
                                    onChange={(e) => updateValue(`langtests_works${num}_icon`, e.target.value)}
                                    placeholder="e.g. 🎧"
                                  />
                                  <FormInput
                                    label="Title"
                                    value={values[`langtests_works${num}_title_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`langtests_works${num}_title_${editLang}`, e.target.value)}
                                  />
                                  <FormTextarea
                                    label="Description"
                                    value={values[`langtests_works${num}_desc_${editLang}`] || ''}
                                    onChange={(e) => updateValue(`langtests_works${num}_desc_${editLang}`, e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* LEAD/CTA FORM SECTION */}
                      {section.id === 'cta' && (
                        <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                          <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                            <span>{editLang === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                            Lead Form Settings ({editLang.toUpperCase()})
                          </h4>
                          <FormInput
                            label="Form Badge Icon / Emoji"
                            value={values.langtests_cta_icon || ''}
                            onChange={(e) => updateValue('langtests_cta_icon', e.target.value)}
                            placeholder="e.g. 🎓"
                          />
                          <FormInput
                            label="Form Title"
                            value={values[`langtests_cta_title_${editLang}`] || ''}
                            onChange={(e) => updateValue(`langtests_cta_title_${editLang}`, e.target.value)}
                          />
                          <FormTextarea
                            label="Form Subtitle"
                            value={values[`langtests_cta_subtitle_${editLang}`] || ''}
                            onChange={(e) => updateValue(`langtests_cta_subtitle_${editLang}`, e.target.value)}
                            rows={2}
                          />
                          <div className="border-t border-gray-200/60 pt-4 mt-4 space-y-4">
                            <h5 className="text-xs font-bold text-neutral-dark uppercase tracking-wider">Success Submission Alert</h5>
                            <FormInput
                              label="Success Header"
                              value={values[`langtests_cta_success_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`langtests_cta_success_title_${editLang}`, e.target.value)}
                            />
                            <FormTextarea
                              label="Success Paragraph description"
                              value={values[`langtests_cta_success_desc_${editLang}`] || ''}
                              onChange={(e) => updateValue(`langtests_cta_success_desc_${editLang}`, e.target.value)}
                              rows={2}
                            />
                          </div>
                          <div className="border-t border-gray-200/60 pt-4 mt-4">
                            <FormInput
                              label="Submit Button label"
                              value={values[`langtests_cta_submit_${editLang}`] || ''}
                              onChange={(e) => updateValue(`langtests_cta_submit_${editLang}`, e.target.value)}
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
        </div>
      )}
    </div>
  );
}
