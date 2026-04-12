import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { aboutApi } from '@/services/api';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable, { Pagination } from '@/components/DataTable';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { FormInput, FormTextarea, FormSelect, FormToggle, ImageUpload } from '@/components/FormFields';

interface AboutSection {
  id: number;
  section_key: string;
  title_en: string;
  title_es: string;
  content_en: string;
  content_es: string;
  subtitle_en: string;
  subtitle_es: string;
  image: string | null;
  image_url: string | null;
  cta_text_en: string;
  cta_text_es: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
}

const SECTION_KEYS = [
  { value: 'hero', label: 'Hero' },
  { value: 'story', label: 'Our Story' },
  { value: 'philosophy', label: 'Philosophy' },
  { value: 'differentiators', label: 'What Makes Us Different' },
  { value: 'team', label: 'Team' },
  { value: 'whylove', label: 'Why People Love This' },
  { value: 'cta', label: 'Call to Action' },
];

const EMPTY: Partial<AboutSection> = {
  section_key: 'hero',
  title_en: '', title_es: '',
  content_en: '', content_es: '',
  subtitle_en: '', subtitle_es: '',
  image: null,
  cta_text_en: '', cta_text_es: '',
  cta_link: '',
  sort_order: 0,
  is_active: true,
};

export default function AboutPage() {
  const [data, setData] = useState<AboutSection[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<AboutSection>>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AboutSection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aboutApi.list(page);
      setData(res.data.data || res.data);
      setLastPage(res.data.last_page || 1);
    } catch { /* empty */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing({ ...EMPTY });
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (s: AboutSection) => {
    setEditing(s);
    setImageFile(null);
    setImagePreview(s.image_url || null);
    setModalOpen(true);
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(editing.image_url || null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('section_key', editing.section_key || 'hero');
      fd.append('title_en', editing.title_en || '');
      fd.append('title_es', editing.title_es || '');
      fd.append('content_en', editing.content_en || '');
      fd.append('content_es', editing.content_es || '');
      fd.append('subtitle_en', editing.subtitle_en || '');
      fd.append('subtitle_es', editing.subtitle_es || '');
      fd.append('cta_text_en', editing.cta_text_en || '');
      fd.append('cta_text_es', editing.cta_text_es || '');
      fd.append('cta_link', editing.cta_link || '');
      fd.append('sort_order', String(editing.sort_order || 0));
      fd.append('is_active', editing.is_active ? '1' : '0');
      if (imageFile) fd.append('image', imageFile);

      if (editing.id) {
        fd.append('_method', 'POST');
        await aboutApi.update(editing.id, fd);
      } else {
        await aboutApi.create(fd);
      }
      setModalOpen(false);
      setImageFile(null);
      setImagePreview(null);
      fetch();
    } catch { /* empty */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await aboutApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetch();
    } catch { /* empty */ }
    setDeleting(false);
  };

  const columns = [
    { key: 'sort_order', header: '#', className: 'w-12 text-center' },
    {
      key: 'image',
      header: 'Image',
      className: 'w-20',
      render: (r: AboutSection) => r.image_url ? (
        <img src={r.image_url} alt="" className="w-14 h-10 object-cover rounded" />
      ) : <div className="w-14 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400"><FileText className="w-4 h-4" /></div>,
    },
    {
      key: 'section_key',
      header: 'Section',
      render: (r: AboutSection) => (
        <Badge variant="default">{r.section_key}</Badge>
      ),
    },
    {
      key: 'title_en',
      header: 'Title',
      render: (r: AboutSection) => (
        <div>
          <p className="font-medium">{r.title_en}</p>
          <p className="text-xs text-neutral-gray">{r.title_es}</p>
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (r: AboutSection) => <Badge variant={r.is_active ? 'success' : 'default'}>{r.is_active ? 'Active' : 'Hidden'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (r: AboutSection) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="About Page" description="Manage the About page sections">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Section</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          {loading ? <Spinner /> : data.length === 0 ? (
            <EmptyState icon={<FileText className="w-10 h-10" />} title="No about sections yet" action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Section</Button>} />
          ) : (
            <>
              <DataTable columns={columns} data={data} />
              <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
            </>
          )}
        </Card>
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing.id ? 'Edit Section' : 'New Section'} size="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <FormSelect
            label="Section Type"
            options={SECTION_KEYS}
            value={editing.section_key || 'hero'}
            onChange={(e) => setEditing({ ...editing, section_key: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Title (EN)" value={editing.title_en || ''} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} />
            <FormInput label="Title (ES)" value={editing.title_es || ''} onChange={(e) => setEditing({ ...editing, title_es: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Subtitle (EN)" value={editing.subtitle_en || ''} onChange={(e) => setEditing({ ...editing, subtitle_en: e.target.value })} />
            <FormInput label="Subtitle (ES)" value={editing.subtitle_es || ''} onChange={(e) => setEditing({ ...editing, subtitle_es: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormTextarea label="Content (EN)" value={editing.content_en || ''} onChange={(e) => setEditing({ ...editing, content_en: e.target.value })} />
            <FormTextarea label="Content (ES)" value={editing.content_es || ''} onChange={(e) => setEditing({ ...editing, content_es: e.target.value })} />
          </div>
          <ImageUpload label="Image" preview={imagePreview} onChange={handleImageChange} />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="CTA Text (EN)" value={editing.cta_text_en || ''} onChange={(e) => setEditing({ ...editing, cta_text_en: e.target.value })} />
            <FormInput label="CTA Text (ES)" value={editing.cta_text_es || ''} onChange={(e) => setEditing({ ...editing, cta_text_es: e.target.value })} />
          </div>
          <FormInput label="CTA Link" value={editing.cta_link || ''} onChange={(e) => setEditing({ ...editing, cta_link: e.target.value })} placeholder="/booking" />
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

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Section" message="Delete this about section? This cannot be undone." loading={deleting} />
    </div>
  );
}
