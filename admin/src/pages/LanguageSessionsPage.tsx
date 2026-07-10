import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Languages, FlaskConical, Volume2, VolumeX, Upload, X } from 'lucide-react';
import { languageSessionsApi } from '@/services/api';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable from '@/components/DataTable';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { FormInput, FormTextarea, FormSelect, FormToggle } from '@/components/FormFields';
import toast from 'react-hot-toast';

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

const EMPTY_SESSION: Partial<LangSession> = {
  title_en: '', title_es: '', description_en: '', description_es: '',
  language_type: 'both', skill_level: null, is_active: true, sort_order: 0,
  test_type: 'session', audio_url: null,
};

const EMPTY_TEST: Partial<LangSession> = {
  title_en: '', title_es: '', description_en: '', description_es: '',
  language_type: 'both', skill_level: null, is_active: true, sort_order: 0,
  test_type: 'level_test', audio_url: null,
};

const LANG_BADGE: Record<string, 'info' | 'success' | 'warning'> = {
  spanish: 'warning', english: 'info', both: 'success',
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

// ── Session Form Modal ───────────────────────────────────────────────────────
function SessionModal({
  open,
  onClose,
  editing,
  setEditing,
  onSave,
  saving,
  isLevelTest,
}: {
  open: boolean;
  onClose: () => void;
  editing: Partial<LangSession>;
  setEditing: (s: Partial<LangSession>) => void;
  onSave: (audioFile: File | null, removeAudio: boolean) => void;
  saving: boolean;
  isLevelTest: boolean;
}) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [removeAudio, setRemoveAudio] = useState(false);

  const handleRemove = () => {
    setRemoveAudio(true);
    setAudioFile(null);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        editing.id
          ? isLevelTest ? 'Edit Level Test' : 'Edit Session'
          : isLevelTest ? 'New Level Test (Prueba de Nivel)' : 'New Language Session'
      }
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Title (EN)" value={editing.title_en || ''} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} />
          <FormInput label="Title (ES)" value={editing.title_es || ''} onChange={(e) => setEditing({ ...editing, title_es: e.target.value })} />
        </div>
        <FormTextarea label="Description (EN)" value={editing.description_en || ''} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} />
        <FormTextarea label="Description (ES)" value={editing.description_es || ''} onChange={(e) => setEditing({ ...editing, description_es: e.target.value })} />
        <div className={`grid gap-4 ${isLevelTest ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {!isLevelTest && (
            <FormSelect
              label="Language"
              value={editing.language_type || 'both'}
              onChange={(e) => setEditing({ ...editing, language_type: e.target.value })}
              options={[
                { value: 'both', label: 'Both' },
                { value: 'spanish', label: 'Spanish' },
                { value: 'english', label: 'English' },
              ]}
            />
          )}
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

        {/* Audio upload — only for level tests */}
        {isLevelTest && (
          <AudioUpload
            existingUrl={removeAudio ? null : (editing.audio_url || null)}
            onFileChange={(f) => { setAudioFile(f); if (f) setRemoveAudio(false); }}
            onRemove={handleRemove}
          />
        )}

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
export default function LanguageSessionsPage() {
  const [activeTab, setActiveTab] = useState<'session' | 'level_test'>('session');
  const [data, setData] = useState<LangSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<LangSession>>(EMPTY_SESSION);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LangSession | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await languageSessionsApi.list();
      setData(res.data.data || res.data);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const visibleData = data.filter((d) => d.test_type === activeTab);
  const isLevelTest = activeTab === 'level_test';

  const openCreate = () => {
    setEditing(isLevelTest ? { ...EMPTY_TEST } : { ...EMPTY_SESSION });
    setModalOpen(true);
  };
  const openEdit = (s: LangSession) => { setEditing(s); setModalOpen(true); };

  const handleSave = async (audioFile: File | null, removeAudio: boolean) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title_en', editing.title_en || '');
      fd.append('title_es', editing.title_es || '');
      fd.append('description_en', editing.description_en || '');
      fd.append('description_es', editing.description_es || '');
      fd.append('language_type', editing.language_type || 'both');
      fd.append('skill_level', editing.skill_level || '');
      fd.append('is_active', editing.is_active ? '1' : '0');
      fd.append('sort_order', String(editing.sort_order || 0));
      fd.append('test_type', editing.test_type || activeTab);
      if (audioFile) fd.append('audio', audioFile);
      if (removeAudio) fd.append('remove_audio', '1');

      if (editing.id) {
        await languageSessionsApi.update(editing.id, fd);
        toast.success('Updated successfully');
      } else {
        await languageSessionsApi.create(fd);
        toast.success('Created successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to save. Please try again.');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await languageSessionsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
      toast.success('Deleted successfully');
    } catch { /* empty */ }
    setDeleting(false);
  };

  const sessionColumns = [
    { key: 'sort_order', header: '#', className: 'w-12 text-center' },
    {
      key: 'title_en', header: 'Session',
      render: (r: LangSession) => (
        <div>
          <p className="font-medium">{r.title_en}</p>
          <p className="text-xs text-neutral-gray">{r.title_es}</p>
        </div>
      ),
    },
    {
      key: 'language_type', header: 'Language',
      render: (r: LangSession) => <Badge variant={LANG_BADGE[r.language_type] || 'default'}>{r.language_type}</Badge>,
    },
    {
      key: 'skill_level', header: 'Level',
      render: (r: LangSession) => r.skill_level ? <Badge>{r.skill_level}</Badge> : <span className="text-neutral-gray text-sm">All levels</span>,
    },
    {
      key: 'is_active', header: 'Status',
      render: (r: LangSession) => <Badge variant={r.is_active ? 'success' : 'default'}>{r.is_active ? 'Active' : 'Hidden'}</Badge>,
    },
    {
      key: 'actions', header: '', className: 'w-24',
      render: (r: LangSession) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  const levelTestColumns = [
    { key: 'sort_order', header: '#', className: 'w-12 text-center' },
    {
      key: 'title_en', header: 'Test',
      render: (r: LangSession) => (
        <div>
          <p className="font-medium">{r.title_en}</p>
          <p className="text-xs text-neutral-gray">{r.title_es}</p>
        </div>
      ),
    },
    {
      key: 'skill_level', header: 'Level',
      render: (r: LangSession) => r.skill_level ? <Badge>{r.skill_level}</Badge> : <span className="text-neutral-gray text-sm">All levels</span>,
    },
    {
      key: 'audio_url', header: 'Audio',
      render: (r: LangSession) => r.audio_url ? (
        <div className="flex items-center gap-1.5 text-primary">
          <Volume2 className="w-4 h-4" />
          <span className="text-xs font-medium">Has audio</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-neutral-gray">
          <VolumeX className="w-4 h-4" />
          <span className="text-xs">No audio</span>
        </div>
      ),
    },
    {
      key: 'is_active', header: 'Status',
      render: (r: LangSession) => <Badge variant={r.is_active ? 'success' : 'default'}>{r.is_active ? 'Active' : 'Hidden'}</Badge>,
    },
    {
      key: 'actions', header: '', className: 'w-24',
      render: (r: LangSession) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Language Sessions & Level Tests"
        description="Manage language sessions and Spanish-English level tests (Pruebas de Nivel)"
      >
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          {isLevelTest ? 'Add Level Test' : 'Add Session'}
        </Button>
      </PageHeader>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('session')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'session'
              ? 'bg-white shadow text-primary'
              : 'text-neutral-gray hover:text-neutral-dark'
          }`}
        >
          <Languages className="w-4 h-4" />
          Language Sessions
        </button>
        <button
          onClick={() => setActiveTab('level_test')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'level_test'
              ? 'bg-white shadow text-primary'
              : 'text-neutral-gray hover:text-neutral-dark'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          Level Tests
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full uppercase tracking-wide">
            Pruebas de Nivel
          </span>
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={activeTab}>
        <Card>
          {loading ? (
            <Spinner />
          ) : visibleData.length === 0 ? (
            <EmptyState
              icon={isLevelTest ? <FlaskConical className="w-10 h-10" /> : <Languages className="w-10 h-10" />}
              title={isLevelTest ? 'No level tests yet' : 'No sessions yet'}
              action={
                <Button onClick={openCreate}>
                  <Plus className="w-4 h-4" />
                  {isLevelTest ? 'Add Level Test' : 'Add'}
                </Button>
              }
            />
          ) : (
            <DataTable
              columns={isLevelTest ? levelTestColumns : sessionColumns}
              data={visibleData}
            />
          )}
        </Card>
      </motion.div>

      <SessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        setEditing={setEditing}
        onSave={handleSave}
        saving={saving}
        isLevelTest={editing.test_type === 'level_test'}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={isLevelTest ? 'Delete Level Test' : 'Delete Session'}
        message={`Delete "${deleteTarget?.title_en}"?`}
        loading={deleting}
      />
    </div>
  );
}
