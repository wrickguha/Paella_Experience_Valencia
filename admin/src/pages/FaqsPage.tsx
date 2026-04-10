import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react';
import { faqsApi } from '@/services/api';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable, { Pagination } from '@/components/DataTable';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { FormInput, FormTextarea, FormToggle } from '@/components/FormFields';

interface Faq {
  id: number;
  question_en: string;
  question_es: string;
  answer_en: string;
  answer_es: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY: Partial<Faq> = {
  question_en: '', question_es: '', answer_en: '', answer_es: '',
  sort_order: 0, is_active: true,
};

export default function FaqsPage() {
  const [data, setData] = useState<Faq[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Faq>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await faqsApi.list(page);
      setData(res.data.data || res.data);
      setLastPage(res.data.last_page || 1);
    } catch { /* empty */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditing({ ...EMPTY }); setModalOpen(true); };
  const openEdit = (f: Faq) => { setEditing(f); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing.id) {
        await faqsApi.update(editing.id, editing);
      } else {
        await faqsApi.create(editing);
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
      await faqsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetch();
    } catch { /* empty */ }
    setDeleting(false);
  };

  const columns = [
    { key: 'sort_order', header: '#', className: 'w-12 text-center' },
    {
      key: 'question_en',
      header: 'Question',
      render: (r: Faq) => (
        <div>
          <p className="font-medium">{r.question_en}</p>
          <p className="text-xs text-neutral-gray">{r.question_es}</p>
        </div>
      ),
    },
    {
      key: 'answer_en',
      header: 'Answer',
      render: (r: Faq) => <p className="text-sm text-neutral-gray max-w-xs truncate">{r.answer_en}</p>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (r: Faq) => <Badge variant={r.is_active ? 'success' : 'default'}>{r.is_active ? 'Active' : 'Hidden'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (r: Faq) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="FAQs" description="Manage frequently asked questions">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add FAQ</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          {loading ? <Spinner /> : data.length === 0 ? (
            <EmptyState icon={<HelpCircle className="w-10 h-10" />} title="No FAQs yet" action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add FAQ</Button>} />
          ) : (
            <>
              <DataTable columns={columns} data={data} />
              <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
            </>
          )}
        </Card>
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing.id ? 'Edit FAQ' : 'New FAQ'} size="lg">
        <div className="space-y-4">
          <FormInput label="Question (EN)" value={editing.question_en || ''} onChange={(e) => setEditing({ ...editing, question_en: e.target.value })} />
          <FormInput label="Question (ES)" value={editing.question_es || ''} onChange={(e) => setEditing({ ...editing, question_es: e.target.value })} />
          <FormTextarea label="Answer (EN)" value={editing.answer_en || ''} onChange={(e) => setEditing({ ...editing, answer_en: e.target.value })} />
          <FormTextarea label="Answer (ES)" value={editing.answer_es || ''} onChange={(e) => setEditing({ ...editing, answer_es: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Sort Order" type="number" value={editing.sort_order || 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
            <div className="flex items-end">
              <FormToggle label="Active" checked={editing.is_active ?? true} onChange={(v) => setEditing({ ...editing, is_active: v })} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing.id ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete FAQ" message={`Delete this FAQ?`} loading={deleting} />
    </div>
  );
}
