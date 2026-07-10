import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, Globe, ChevronDown, Check, Compass, Info, ListChecks, FileText, 
  FlaskConical, Plus, Pencil, Trash2, Volume2, VolumeX, Upload, X 
} from 'lucide-react';
import { settingsApi, languageSessionsApi } from '@/services/api';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import { FormInput, FormTextarea, FormSelect, FormToggle } from '@/components/FormFields';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

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

interface LangSession {
  id: number;
  title_en: string;
  title_es: string;
  description_en: string;
  description_es: string;
  language_type: string;
  skill_level: string | null;
  is_active: boolean;
  sort_order: number;
  test_type: 'session' | 'level_test';
  audio_url: string | null;
}

const EMPTY_TEST: Partial<LangSession> = {
  title_en: '', title_es: '', description_en: '', description_es: '',
  language_type: 'both', skill_level: null, is_active: true, sort_order: 0,
  test_type: 'level_test', audio_url: null,
};

// ── Audio Upload Component ─────────────────────────────────────────────────────
function AudioUpload({
  existingUrl,
  onFileChange,
  onRemove,
}: {
  existingUrl: string | null;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(existingUrl);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onFileChange(null);
    onRemove();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-dark mb-1.5">
        Audio Introduction <span className="text-neutral-gray font-normal">(MP3, WAV, M4A — max 20 MB)</span>
      </label>

      {preview ? (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-neutral-dark font-medium flex-1 truncate">Audio uploaded</span>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded-full hover:bg-red-50 text-neutral-gray hover:text-danger transition-colors"
              title="Remove audio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <audio controls src={preview} className="w-full h-8" style={{ height: 36 }} />
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
        >
          <Upload className="w-6 h-6 text-neutral-gray mx-auto mb-2" />
          <p className="text-sm text-neutral-gray">
            <span className="text-primary font-medium">Click to upload</span> or drag & drop
          </p>
          <p className="text-xs text-neutral-gray mt-1">MP3, WAV, M4A, OGG up to 20 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/ogg,audio/webm,.mp3,.wav,.m4a,.ogg"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
        </div>
      )}
    </div>
  );
}

// ── Level Test Form Modal ───────────────────────────────────────────────────────
function LevelTestModal({
  open,
  onClose,
  editing,
  setEditing,
  onSave,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  editing: Partial<LangSession>;
  setEditing: (s: Partial<LangSession>) => void;
  onSave: (audioFile: File | null, removeAudio: boolean) => void;
  saving: boolean;
}) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [removeAudio, setRemoveAudio] = useState(false);

  useEffect(() => {
    if (open) {
      setAudioFile(null);
      setRemoveAudio(false);
    }
  }, [open]);

  const handleRemove = () => {
    setRemoveAudio(true);
    setAudioFile(null);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing.id ? 'Edit Level Test' : 'New Level Test (Prueba de Nivel)'}
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Title (EN)" value={editing.title_en || ''} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} />
          <FormInput label="Title (ES)" value={editing.title_es || ''} onChange={(e) => setEditing({ ...editing, title_es: e.target.value })} />
        </div>
        <FormTextarea label="Description (EN)" value={editing.description_en || ''} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} />
        <FormTextarea label="Description (ES)" value={editing.description_es || ''} onChange={(e) => setEditing({ ...editing, description_es: e.target.value })} />
        
        <div className="grid grid-cols-3 gap-4">
          <FormSelect
            label="Language"
            value={editing.language_type || 'both'}
            onChange={(e) => setEditing({ ...editing, language_type: e.target.value })}
            options={[
              { value: 'both', label: 'Bilingual' },
              { value: 'spanish', label: 'Spanish' },
              { value: 'english', label: 'English' },
            ]}
          />
          <FormSelect
            label="Skill Level"
            value={editing.skill_level || ''}
            onChange={(e) => setEditing({ ...editing, skill_level: e.target.value || null })}
            options={[
              { value: '', label: 'All Levels' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
          />
          <FormInput
            label="Sort Order"
            type="number"
            value={editing.sort_order || 0}
            onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
          />
        </div>

        <AudioUpload
          existingUrl={removeAudio ? null : (editing.audio_url || null)}
          onFileChange={(f) => { setAudioFile(f); if (f) setRemoveAudio(false); }}
          onRemove={handleRemove}
        />

        <FormToggle label="Active" checked={editing.is_active ?? true} onChange={(v) => setEditing({ ...editing, is_active: v })} />
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(audioFile, removeAudio)} loading={saving}>
          {editing.id ? 'Update' : 'Create'}
        </Button>
      </div>
    </Modal>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LanguageTestsPageEditPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [editLang, setEditLang] = useState<'en' | 'es'>('en');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  // Level Tests Management state
  const [levelTests, setLevelTests] = useState<LangSession[]>([]);
  const [testLoading, setTestLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Partial<LangSession>>(EMPTY_TEST);
  const [savingTest, setSavingTest] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LangSession | null>(null);
  const [deletingTest, setDeletingTest] = useState(false);

  const SECTIONS: SectionConfig[] = [
    { id: 'hero', label: 'Hero Header Section', icon: <Compass className="w-5 h-5" />, description: 'Edit main heading, subtitle scripts, descriptions, CTAs, and floating emojis.' },
    { id: 'info', label: 'Info Strip Indicators', icon: <Info className="w-5 h-5" />, description: 'Modify the four quick indicators listed below the hero section.' },
    { id: 'works', label: 'How It Works Steps', icon: <ListChecks className="w-5 h-5" />, description: 'Customize section header and the 3 step cards detail.' },
    { id: 'cta', label: 'Lead Capture Form Settings', icon: <FileText className="w-5 h-5" />, description: 'Edit titles, form descriptions, success prompts, and submit button texts.' },
    { id: 'tests', label: 'Manage Level Tests List', icon: <FlaskConical className="w-5 h-5" />, description: 'Create, edit, delete, and upload audio files for individual level tests.' },
  ];

  const fetchSettings = useCallback(async () => {
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

  const fetchLevelTests = useCallback(async () => {
    setTestLoading(true);
    try {
      const res = await languageSessionsApi.list();
      const allData: LangSession[] = res.data.data || res.data || [];
      const filtered = allData.filter(d => d.test_type === 'level_test');
      setLevelTests(filtered);
    } catch { /* empty */ }
    setTestLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchLevelTests();
  }, [fetchSettings, fetchLevelTests]);

  const updateValue = (key: string, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    setHasChanges(JSON.stringify(next) !== JSON.stringify(originalValues));
  };

  const handleSaveSettings = async () => {
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

  // CRUD level tests
  const openCreateTest = () => {
    setEditingTest({ ...EMPTY_TEST });
    setModalOpen(true);
  };

  const openEditTest = (test: LangSession) => {
    setEditingTest(test);
    setModalOpen(true);
  };

  const handleSaveTest = async (audioFile: File | null, removeAudio: boolean) => {
    setSavingTest(true);
    try {
      const fd = new FormData();
      fd.append('title_en', editingTest.title_en || '');
      fd.append('title_es', editingTest.title_es || '');
      fd.append('description_en', editingTest.description_en || '');
      fd.append('description_es', editingTest.description_es || '');
      fd.append('language_type', editingTest.language_type || 'both');
      fd.append('skill_level', editingTest.skill_level || '');
      fd.append('is_active', editingTest.is_active ? '1' : '0');
      fd.append('sort_order', String(editingTest.sort_order || 0));
      fd.append('test_type', 'level_test');
      if (audioFile) fd.append('audio', audioFile);
      if (removeAudio) fd.append('remove_audio', '1');

      if (editingTest.id) {
        await languageSessionsApi.update(editingTest.id, fd);
        toast.success('Level test updated successfully');
      } else {
        await languageSessionsApi.create(fd);
        toast.success('Level test created successfully');
      }
      setModalOpen(false);
      fetchLevelTests();
    } catch {
      toast.error('Failed to save level test. Please try again.');
    }
    setSavingTest(false);
  };

  const handleDeleteTest = async () => {
    if (!deleteTarget) return;
    setDeletingTest(true);
    try {
      await languageSessionsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchLevelTests();
      toast.success('Deleted level test successfully');
    } catch { 
      toast.error('Failed to delete level test.');
    }
    setDeletingTest(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <PageHeader 
        title="Language Level Tests Page Editor" 
        description="Edit and customize header scripts, indicators, how it works description steps, and managing level test audio files."
      >
        <div className="flex gap-2">
          <Button onClick={handleSaveSettings} loading={saving} disabled={!hasChanges}>
            <Save className="w-4 h-4" /> Save Page Content
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
                      {isOpen && section.id !== 'tests' && (
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

                      {/* MANAGE LEVEL TESTS SECTION */}
                      {section.id === 'tests' && (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-150">
                            <div>
                              <h4 className="text-sm font-bold text-neutral-dark">Level Test List</h4>
                              <p className="text-xs text-neutral-gray mt-0.5">Manage the tests displayed on the Language Tests page.</p>
                            </div>
                            <Button size="sm" onClick={openCreateTest}>
                              <Plus className="w-4 h-4 mr-1" /> Add Level Test
                            </Button>
                          </div>

                          {testLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Spinner />
                            </div>
                          ) : levelTests.length === 0 ? (
                            <EmptyState
                              icon={<FlaskConical className="w-10 h-10" />}
                              title="No level tests created yet"
                              action={
                                <Button onClick={openCreateTest}>
                                  <Plus className="w-4 h-4 mr-1" /> Add Level Test
                                </Button>
                              }
                            />
                          ) : (
                            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-gray uppercase tracking-wider w-16">Sort</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-gray uppercase tracking-wider">Test Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-gray uppercase tracking-wider">Level</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-gray uppercase tracking-wider">Audio</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-gray uppercase tracking-wider w-24">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-gray uppercase tracking-wider w-24">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {levelTests.map((test) => (
                                    <tr key={test.id} className="hover:bg-gray-50/60 transition-colors">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-dark text-center">{test.sort_order}</td>
                                      <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-neutral-dark">{test.title_en}</div>
                                        <div className="text-xs text-neutral-gray italic">{test.title_es}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge>{test.skill_level || 'All Levels'}</Badge>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        {test.audio_url ? (
                                          <div className="flex items-center gap-1 text-primary">
                                            <Volume2 className="w-4 h-4 shrink-0" />
                                            <span className="text-xs font-semibold">Has audio</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1 text-neutral-gray">
                                            <VolumeX className="w-4 h-4 shrink-0" />
                                            <span className="text-xs">No audio</span>
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={test.is_active ? 'success' : 'default'}>{test.is_active ? 'Active' : 'Hidden'}</Badge>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                          <button 
                                            type="button" 
                                            onClick={() => openEditTest(test)} 
                                            className="p-1 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary transition-colors"
                                          >
                                            <Pencil className="w-4 h-4" />
                                          </button>
                                          <button 
                                            type="button" 
                                            onClick={() => setDeleteTarget(test)} 
                                            className="p-1 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger transition-colors"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
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

      {/* Modals & Dialogs */}
      <LevelTestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editingTest}
        setEditing={setEditingTest}
        onSave={handleSaveTest}
        saving={savingTest}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Level Test"
        message={`Are you sure you want to delete "${deleteTarget?.title_en}"? This action cannot be undone.`}
        onConfirm={handleDeleteTest}
        onCancel={() => setDeleteTarget(null)}
        confirmLoading={deletingTest}
      />
    </div>
  );
}
