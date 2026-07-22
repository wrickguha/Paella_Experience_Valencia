import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Globe, ChevronDown, Check, Compass, Info, ListChecks, FileText, 
  Plus, Trash2, GraduationCap, Type 
} from 'lucide-react';
import { settingsApi } from '@/services/api';
import PageHeader, { Card, Button, Spinner } from '@/components/ui';
import { FormInput, FormTextarea } from '@/components/FormFields';
import { Modal } from '@/components/Modal';
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

interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
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
    family: `langtest_${id}_font_family`,
    size: `langtest_${id}_font_size`,
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


// ── Questions Editor Modal ────────────────────────────────────────────────────────
function QuestionsEditorModal({
  open,
  onClose,
  questions,
  setQuestions,
  onSave,
  testLabel,
}: {
  open: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  setQuestions: (qs: QuizQuestion[]) => void;
  onSave: () => void;
  testLabel: string;
}) {
  const addQuestion = () => {
    setQuestions([...questions, { q: '', options: ['', '', '', ''], answer: 0 }]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx: number, text: string) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], q: text };
    setQuestions(updated);
  };

  const updateOptionText = (qIdx: number, oIdx: number, text: string) => {
    const updated = [...questions];
    const opts = [...(updated[qIdx].options || ['', '', '', ''])];
    opts[oIdx] = text;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    setQuestions(updated);
  };

  const updateAnswer = (qIdx: number, val: number) => {
    const updated = [...questions];
    updated[qIdx] = { ...updated[qIdx], answer: val };
    setQuestions(updated);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Manage Questions: ${testLabel}`}
      size="xl"
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1 pr-3">
        {questions.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <p className="text-sm text-neutral-gray">No questions in this test yet. Click below to add one!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-205 relative group space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                  <span className="text-xs font-bold text-primary uppercase">Question {qIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIdx)}
                    className="p-1 rounded-md text-neutral-gray hover:bg-red-50 hover:text-danger transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <FormInput
                  label="Question Text"
                  value={q.q || ''}
                  onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                  placeholder="e.g. Hola, ¿Cómo _______?"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((oIdx) => (
                    <FormInput
                      key={oIdx}
                      label={`Option ${oIdx + 1}`}
                      value={q.options?.[oIdx] || ''}
                      onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                      placeholder={`Option ${oIdx + 1}`}
                    />
                  ))}
                </div>

                <FormSelect
                  label="Correct Answer"
                  value={q.answer ?? 0}
                  onChange={(e) => updateAnswer(qIdx, parseInt(e.target.value) || 0)}
                  options={[
                    { value: 0, label: 'Option 1' },
                    { value: 1, label: 'Option 2' },
                    { value: 2, label: 'Option 3' },
                    { value: 3, label: 'Option 4' },
                  ]}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button type="button" variant="secondary" onClick={addQuestion} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Question
          </Button>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onSave}>
          Apply Changes
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

  // Quiz Questions builder state
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false);
  const [editingQuestionsKey, setEditingQuestionsKey] = useState<string>(''); // 'spanishTest' or 'englishTest'
  const [tempQuestions, setTempQuestions] = useState<QuizQuestion[]>([]);

  const SECTIONS: SectionConfig[] = [
    { id: 'hero', label: 'Hero Header Section', icon: <Compass className="w-5 h-5" />, description: 'Edit main heading, subtitle scripts, descriptions, CTAs, and floating emojis.' },
    { id: 'info', label: 'Info Strip Indicators', icon: <Info className="w-5 h-5" />, description: 'Modify the four quick indicators listed below the hero section.' },
    { id: 'cta', label: 'Lead Capture Form Settings', icon: <FileText className="w-5 h-5" />, description: 'Edit titles, form descriptions, success prompts, and submit button texts.' },
    { id: 'cards', label: 'Placement Test Intro Cards', icon: <GraduationCap className="w-5 h-5" />, description: 'Edit titles and descriptions for the Spanish and English placement test entry cards.' },
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

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

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

  // Questions editor state helper methods
  const openQuestionsEditor = (key: string) => {
    setEditingQuestionsKey(key);
    let qList: QuizQuestion[] = [];
    try {
      const stored = values[`${key}_questions`];
      if (stored) qList = JSON.parse(stored);
    } catch {}
    setTempQuestions(qList);
    setQuestionsModalOpen(true);
  };

  const handleSaveQuestions = () => {
    const cleaned = tempQuestions.map(q => ({
      q: q.q || '',
      options: (q.options || ['', '', '', '']).map(o => o || ''),
      answer: typeof q.answer === 'number' ? q.answer : 0
    }));
    updateValue(`${editingQuestionsKey}_questions`, JSON.stringify(cleaned));
    setQuestionsModalOpen(false);
    toast.success('Questions list updated! Don\'t forget to click "Save Page Content" at the top to save changes.');
  };

  const getQuestionsCount = (key: string) => {
    try {
      const q = values[`${key}_questions`];
      if (q) return JSON.parse(q).length;
    } catch {}
    return 0;
  };
  const spanishQuestionsCount = getQuestionsCount('spanishTest');
  const englishQuestionsCount = getQuestionsCount('englishTest');

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
                      <SectionTypography sectionId={section.id} values={values} onUpdate={updateValue} />
                      
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

                      {/* PLACEMENT TEST INTRO CARDS SECTION */}
                      {section.id === 'cards' && (
                        <div className="space-y-6">
                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>🇪🇸</span> Spanish Placement Test Card ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Card Title"
                              value={values[`spanishTest_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`spanishTest_title_${editLang}`, e.target.value)}
                            />
                            <FormTextarea
                              label="Card Description"
                              value={values[`spanishTest_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`spanishTest_subtitle_${editLang}`, e.target.value)}
                              rows={3}
                            />
                            <div className="pt-2">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => openQuestionsEditor('spanishTest')}
                                className="flex items-center gap-1.5 text-xs"
                              >
                                <ListChecks className="w-3.5 h-3.5" /> Edit Spanish Questions ({spanishQuestionsCount} questions)
                              </Button>
                            </div>
                          </div>

                          <div className="bg-gray-50/50 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
                              <span>🇬🇧</span> English Placement Test Card ({editLang.toUpperCase()})
                            </h4>
                            <FormInput
                              label="Card Title"
                              value={values[`englishTest_title_${editLang}`] || ''}
                              onChange={(e) => updateValue(`englishTest_title_${editLang}`, e.target.value)}
                            />
                            <FormTextarea
                              label="Card Description"
                              value={values[`englishTest_subtitle_${editLang}`] || ''}
                              onChange={(e) => updateValue(`englishTest_subtitle_${editLang}`, e.target.value)}
                              rows={3}
                            />
                            <div className="pt-2">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => openQuestionsEditor('englishTest')}
                                className="flex items-center gap-1.5 text-xs"
                              >
                                <ListChecks className="w-3.5 h-3.5" /> Edit English Questions ({englishQuestionsCount} questions)
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* MANAGE LEVEL TESTS SECTION REMOVED */}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals & Dialogs */}
      <QuestionsEditorModal
        open={questionsModalOpen}
        onClose={() => setQuestionsModalOpen(false)}
        questions={tempQuestions}
        setQuestions={setTempQuestions}
        onSave={handleSaveQuestions}
        testLabel={editingQuestionsKey === 'spanishTest' ? 'Spanish Test' : 'English Test'}
      />
    </div>
  );
}
