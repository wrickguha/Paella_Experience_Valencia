import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Languages } from 'lucide-react';
import { languageSessionsApi } from '@/services/api';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable from '@/components/DataTable';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { FormInput, FormTextarea, FormSelect, FormToggle } from '@/components/FormFields';

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
}

const EMPTY: Partial<LangSession> = {
  title_en: '', title_es: '', description_en: '', description_es: '',
  language_type: 'both', skill_level: null, is_active: true, sort_order: 0,
};

const LANG_BADGE: Record<string, 'info' | 'success' | 'warning'> = {
  spanish: 'warning', english: 'info', both: 'success',
};

export default function LanguageSessionsPage() {
  const [data, setData] = useState<LangSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<LangSession>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LangSession | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await languageSessionsApi.list();
      setData(res.data.data || res.data);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditing({ ...EMPTY }); setModalOpen(true); };
  const openEdit = (s: LangSession) => { setEditing(s); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing.id) {
        await languageSessionsApi.update(editing.id, editing);
      } else {
        await languageSessionsApi.create(editing);
      }
      setModalOpen(false);
      fetch();
    } catch { /* empty */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await languageSessionsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetch();
    } catch { /* empty */ }
    setDeleting(false);
  };

  const columns = [
    { key: 'sort_order', header: '#', className: 'w-12 text-center' },
    {
      key: 'title_en', header: 'Session',
      render: (r: LangSession) => (<div><p className="font-medium">{r.title_en}</p><p className="text-xs text-neutral-gray">{r.title_es}</p></div>),
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

  return (
    <div>
      <PageHeader title="Language Sessions" description="Manage language learning sessions">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Session</Button>
      </PageHeader>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          {loading ? <Spinner /> : data.length === 0 ? (
            <EmptyState icon={<Languages className="w-10 h-10" />} title="No sessions yet" action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add</Button>} />
          ) : (<DataTable columns={columns} data={data} />)}
        </Card>
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing.id ? 'Edit Session' : 'New Session'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Title (EN)" value={editing.title_en || ''} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} />
            <FormInput label="Title (ES)" value={editing.title_es || ''} onChange={(e) => setEditing({ ...editing, title_es: e.target.value })} />
          </div>
          <FormTextarea label="Description (EN)" value={editing.description_en || ''} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} />
          <FormTextarea label="Description (ES)" value={editing.description_es || ''} onChange={(e) => setEditing({ ...editing, description_es: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <FormSelect label="Language" value={editing.language_type || 'both'} onChange={(e) => setEditing({ ...editing, language_type: e.target.value })} options={[{ value: 'both', label: 'Both' }, { value: 'spanish', label: 'Spanish' }, { value: 'english', label: 'English' }]} />
            <FormSelect label="Skill Level" value={editing.skill_level || ''} onChange={(e) => setEditing({ ...editing, skill_level: e.target.value || null })} options={[{ value: '', label: 'All Levels' }, { value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }]} />
            <FormInput label="Sort Order" type="number" value={editing.sort_order || 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
          </div>
          <FormToggle label="Active" checked={editing.is_active ?? true} onChange={(v) => setEditing({ ...editing, is_active: v })} />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing.id ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Session" message={`Delete "${deleteTarget?.title_en}"?`} loading={deleting} />
    </div>
  );
}
