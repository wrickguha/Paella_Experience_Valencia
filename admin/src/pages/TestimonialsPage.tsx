import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Star, MessageSquareQuote } from 'lucide-react';
import { testimonialsApi } from '@/services/api';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable, { Pagination } from '@/components/DataTable';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { FormInput, FormTextarea, FormToggle } from '@/components/FormFields';

interface Testimonial {
  id: number;
  name: string;
  location_label: string;
  review_en: string;
  review_es: string;
  rating: number;
  avatar: string;
  is_active: boolean;
  sort_order: number;
}

const EMPTY: Partial<Testimonial> = {
  name: '', location_label: '', review_en: '', review_es: '',
  rating: 5, avatar: '', is_active: true, sort_order: 0,
};

export default function TestimonialsPage() {
  const [data, setData] = useState<Testimonial[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Testimonial>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await testimonialsApi.list(page);
      setData(res.data.data || res.data);
      setLastPage(res.data.last_page || 1);
    } catch { /* empty */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditing({ ...EMPTY }); setModalOpen(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing.id) {
        await testimonialsApi.update(editing.id, editing);
      } else {
        await testimonialsApi.create(editing);
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
      await testimonialsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetch();
    } catch { /* empty */ }
    setDeleting(false);
  };

  const columns = [
    {
      key: 'avatar',
      header: '',
      className: 'w-12',
      render: (r: Testimonial) => (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold overflow-hidden">
          {r.avatar ? <img src={r.avatar} alt="" className="w-full h-full object-cover" /> : r.name[0]}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (r: Testimonial) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-neutral-gray">{r.location_label}</p>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (r: Testimonial) => (
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
          ))}
        </div>
      ),
    },
    {
      key: 'review_en',
      header: 'Review',
      render: (r: Testimonial) => (
        <p className="text-sm text-neutral-gray max-w-xs truncate">{r.review_en}</p>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (r: Testimonial) => <Badge variant={r.is_active ? 'success' : 'default'}>{r.is_active ? 'Active' : 'Hidden'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (r: Testimonial) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Testimonials" description="Manage customer reviews">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Testimonial</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          {loading ? <Spinner /> : data.length === 0 ? (
            <EmptyState icon={<MessageSquareQuote className="w-10 h-10" />} title="No testimonials yet" action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add</Button>} />
          ) : (
            <>
              <DataTable columns={columns} data={data} />
              <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
            </>
          )}
        </Card>
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing.id ? 'Edit Testimonial' : 'New Testimonial'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Name" value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <FormInput label="Location Label" placeholder="e.g. Bloom Gallery" value={editing.location_label || ''} onChange={(e) => setEditing({ ...editing, location_label: e.target.value })} />
          </div>
          <FormTextarea label="Review (EN)" value={editing.review_en || ''} onChange={(e) => setEditing({ ...editing, review_en: e.target.value })} />
          <FormTextarea label="Review (ES)" value={editing.review_es || ''} onChange={(e) => setEditing({ ...editing, review_es: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1.5">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setEditing({ ...editing, rating: v })}
                    className="p-1"
                  >
                    <Star className={`w-6 h-6 ${v <= (editing.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <FormInput label="Avatar URL" value={editing.avatar || ''} onChange={(e) => setEditing({ ...editing, avatar: e.target.value })} />
          </div>
          <FormToggle label="Active" description="Show on website" checked={editing.is_active ?? true} onChange={(v) => setEditing({ ...editing, is_active: v })} />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing.id ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Testimonial" message={`Delete "${deleteTarget?.name}"'s testimonial?`} loading={deleting} />
    </div>
  );
}
