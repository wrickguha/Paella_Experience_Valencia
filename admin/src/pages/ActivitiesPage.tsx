import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, PartyPopper } from 'lucide-react';
import { activitiesApi } from '@/services/api';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable from '@/components/DataTable';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { FormInput, FormTextarea, FormToggle } from '@/components/FormFields';

interface Activity {
  id: number;
  title_en: string;
  title_es: string;
  description_en: string;
  description_es: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

const EMPTY: Partial<Activity> = {
  title_en: '', title_es: '', description_en: '', description_es: '',
  icon: 'gift', is_active: true, sort_order: 0,
};

export default function ActivitiesPage() {
  const [data, setData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Activity>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activitiesApi.list();
      setData(res.data.data || res.data);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditing({ ...EMPTY }); setModalOpen(true); };
  const openEdit = (a: Activity) => { setEditing(a); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing.id) {
        await activitiesApi.update(editing.id, editing);
      } else {
        await activitiesApi.create(editing);
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
      await activitiesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetch();
    } catch { /* empty */ }
    setDeleting(false);
  };

  const columns = [
    { key: 'sort_order', header: '#', className: 'w-12 text-center' },
    {
      key: 'icon',
      header: 'Icon',
      className: 'w-16',
      render: (r: Activity) => (
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-mono">
          {r.icon}
        </div>
      ),
    },
    {
      key: 'title_en',
      header: 'Title',
      render: (r: Activity) => (
        <div>
          <p className="font-medium">{r.title_en}</p>
          <p className="text-xs text-neutral-gray">{r.title_es}</p>
        </div>
      ),
    },
    {
      key: 'description_en',
      header: 'Description',
      render: (r: Activity) => <p className="text-sm text-neutral-gray max-w-xs truncate">{r.description_en}</p>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (r: Activity) => <Badge variant={r.is_active ? 'success' : 'default'}>{r.is_active ? 'Active' : 'Hidden'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (r: Activity) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Activities" description="Manage activities and experiences">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Activity</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          {loading ? <Spinner /> : data.length === 0 ? (
            <EmptyState icon={<PartyPopper className="w-10 h-10" />} title="No activities yet" action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Activity</Button>} />
          ) : (
            <DataTable columns={columns} data={data} />
          )}
        </Card>
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing.id ? 'Edit Activity' : 'New Activity'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Title (EN)" value={editing.title_en || ''} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} />
            <FormInput label="Title (ES)" value={editing.title_es || ''} onChange={(e) => setEditing({ ...editing, title_es: e.target.value })} />
          </div>
          <FormTextarea label="Description (EN)" value={editing.description_en || ''} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} />
          <FormTextarea label="Description (ES)" value={editing.description_es || ''} onChange={(e) => setEditing({ ...editing, description_es: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Icon Name" placeholder="e.g. gift, globe, music, users" value={editing.icon || ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
            <FormInput label="Sort Order" type="number" value={editing.sort_order || 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
          </div>
          <FormToggle label="Active" description="Show on website" checked={editing.is_active ?? true} onChange={(v) => setEditing({ ...editing, is_active: v })} />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing.id ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Activity" message={`Delete "${deleteTarget?.title_en}"?`} loading={deleting} />
    </div>
  );
}
