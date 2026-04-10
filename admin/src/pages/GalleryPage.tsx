import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { galleryApi } from '@/services/api';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { FormInput, FormSelect, ImageUpload } from '@/components/FormFields';

interface GalleryImage {
  id: number;
  image: string;
  alt_en: string;
  alt_es: string;
  type: string;
  sort_order: number;
  is_active: boolean;
}

export default function GalleryPage() {
  const [data, setData] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({ alt_en: '', alt_es: '', type: 'homepage' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (typeFilter) params.type = typeFilter;
      const res = await galleryApi.list(params);
      setData(res.data.data || res.data);
    } catch { /* empty */ }
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSave = async () => {
    if (!imageFile) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      fd.append('alt_en', form.alt_en);
      fd.append('alt_es', form.alt_es);
      fd.append('type', form.type);
      await galleryApi.create(fd);
      setModalOpen(false);
      setImageFile(null);
      setImagePreview(null);
      setForm({ alt_en: '', alt_es: '', type: 'homepage' });
      fetch();
    } catch { /* empty */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await galleryApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetch();
    } catch { /* empty */ }
    setDeleting(false);
  };

  const TYPE_COLORS: Record<string, 'info' | 'success' | 'warning'> = {
    homepage: 'info', experience: 'success', location: 'warning',
  };

  return (
    <div>
      <PageHeader title="Gallery" description="Manage images displayed on the website">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Upload Image
        </Button>
      </PageHeader>

      <div className="mb-4">
        <FormSelect
          label=""
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: '', label: 'All Categories' },
            { value: 'homepage', label: 'Homepage' },
            { value: 'experience', label: 'Experience' },
            { value: 'location', label: 'Location' },
          ]}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {loading ? (
          <Spinner />
        ) : data.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={<ImageIcon className="w-10 h-10" />}
              title="No images yet"
              description="Upload your first gallery image"
              action={<Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Upload</Button>}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((img) => (
              <Card key={img.id} className="overflow-hidden group">
                <div className="aspect-square relative">
                  <img src={img.image} alt={img.alt_en} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => setDeleteTarget(img)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-neutral-dark truncate">{img.alt_en || 'Untitled'}</p>
                  <Badge variant={TYPE_COLORS[img.type] || 'default'}>{img.type}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Upload Image" size="md">
        <div className="space-y-4">
          <ImageUpload label="Image" preview={imagePreview} onChange={handleImageChange} />
          <FormInput label="Alt Text (EN)" value={form.alt_en} onChange={(e) => setForm({ ...form, alt_en: e.target.value })} />
          <FormInput label="Alt Text (ES)" value={form.alt_es} onChange={(e) => setForm({ ...form, alt_es: e.target.value })} />
          <FormSelect
            label="Category"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[
              { value: 'homepage', label: 'Homepage' },
              { value: 'experience', label: 'Experience' },
              { value: 'location', label: 'Location' },
            ]}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving} disabled={!imageFile}>Upload</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image? This cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
