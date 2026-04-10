import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import { experiencesApi, locationsApi } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable, { Pagination } from '@/components/DataTable';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { FormInput, FormTextarea, FormSelect, ImageUpload, FormToggle } from '@/components/FormFields';

interface Experience {
  id: number;
  title_en: string;
  title_es: string;
  description_en: string;
  description_es: string;
  hero_image: string;
  price: number;
  duration: string;
  location_id: number;
  location_name?: string;
  is_active: boolean;
  sort_order: number;
  features?: { id: number; feature_en: string; feature_es: string; sort_order: number }[];
}

interface Location {
  id: number;
  name_en: string;
}

const EMPTY: Partial<Experience> = {
  title_en: '', title_es: '', description_en: '', description_es: '',
  price: 0, duration: '', location_id: 0, is_active: true, sort_order: 0,
};

export default function ExperiencesPage() {
  const [data, setData] = useState<Experience[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Experience>>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [features, setFeatures] = useState<{ feature_en: string; feature_es: string }[]>([]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, locRes] = await Promise.all([
        experiencesApi.list(page),
        locationsApi.all(),
      ]);
      setData(expRes.data.data || expRes.data);
      setLastPage(expRes.data.last_page || 1);
      setLocations(locRes.data.data || locRes.data);
    } catch { /* empty */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing({ ...EMPTY });
    setImageFile(null);
    setImagePreview(null);
    setFeatures([]);
    setModalOpen(true);
  };

  const openEdit = (exp: Experience) => {
    setEditing(exp);
    setImageFile(null);
    setImagePreview(exp.hero_image || null);
    setFeatures(exp.features?.map(f => ({ feature_en: f.feature_en, feature_es: f.feature_es })) || []);
    setModalOpen(true);
  };

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
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title_en', editing.title_en || '');
      fd.append('title_es', editing.title_es || '');
      fd.append('description_en', editing.description_en || '');
      fd.append('description_es', editing.description_es || '');
      fd.append('price', String(editing.price || 0));
      fd.append('duration', editing.duration || '');
      fd.append('location_id', String(editing.location_id || ''));
      fd.append('is_active', editing.is_active ? '1' : '0');
      fd.append('sort_order', String(editing.sort_order || 0));
      if (imageFile) fd.append('hero_image', imageFile);
      fd.append('features', JSON.stringify(features));
      if (editing.id) {
        fd.append('_method', 'PUT');
        await experiencesApi.update(editing.id, fd);
      } else {
        await experiencesApi.create(fd);
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
      await experiencesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetch();
    } catch { /* empty */ }
    setDeleting(false);
  };

  const columns = [
    {
      key: 'hero_image',
      header: '',
      className: 'w-16',
      render: (r: Experience) => (
        <img src={r.hero_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
      ),
    },
    {
      key: 'title_en',
      header: 'Title',
      render: (r: Experience) => (
        <div>
          <p className="font-medium">{r.title_en}</p>
          <p className="text-xs text-neutral-gray">{r.title_es}</p>
        </div>
      ),
    },
    {
      key: 'location_name',
      header: 'Location',
      render: (r: Experience) => r.location_name || `Location #${r.location_id}`,
    },
    {
      key: 'price',
      header: 'Price',
      render: (r: Experience) => formatCurrency(r.price),
    },
    {
      key: 'duration',
      header: 'Duration',
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (r: Experience) => (
        <Badge variant={r.is_active ? 'success' : 'default'}>
          {r.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (r: Experience) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary">
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(r)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Experiences" description="Manage your cooking experiences">
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add Experience
        </Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          {loading ? (
            <Spinner />
          ) : data.length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed className="w-10 h-10" />}
              title="No experiences yet"
              description="Create your first cooking experience"
              action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Experience</Button>}
            />
          ) : (
            <>
              <DataTable columns={columns} data={data} />
              <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
            </>
          )}
        </Card>
      </motion.div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing.id ? 'Edit Experience' : 'New Experience'}
        size="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Title (EN)"
            value={editing.title_en || ''}
            onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}
          />
          <FormInput
            label="Title (ES)"
            value={editing.title_es || ''}
            onChange={(e) => setEditing({ ...editing, title_es: e.target.value })}
          />
          <FormTextarea
            label="Description (EN)"
            value={editing.description_en || ''}
            onChange={(e) => setEditing({ ...editing, description_en: e.target.value })}
          />
          <FormTextarea
            label="Description (ES)"
            value={editing.description_es || ''}
            onChange={(e) => setEditing({ ...editing, description_es: e.target.value })}
          />
          <FormInput
            label="Price (€)"
            type="number"
            step="0.01"
            value={editing.price || ''}
            onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })}
          />
          <FormInput
            label="Duration"
            placeholder="e.g. 4 hours"
            value={editing.duration || ''}
            onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
          />
          <FormSelect
            label="Location"
            value={editing.location_id || ''}
            onChange={(e) => setEditing({ ...editing, location_id: parseInt(e.target.value) })}
            options={[
              { value: '', label: 'Select location' },
              ...locations.map((l) => ({ value: l.id, label: l.name_en })),
            ]}
          />
          <FormInput
            label="Sort Order"
            type="number"
            value={editing.sort_order || 0}
            onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
          />
          <div className="md:col-span-2">
            <ImageUpload label="Hero Image" preview={imagePreview} onChange={handleImageChange} />
          </div>
          <div className="md:col-span-2">
            <FormToggle
              label="Active"
              description="Show this experience on the website"
              checked={editing.is_active ?? true}
              onChange={(v) => setEditing({ ...editing, is_active: v })}
            />
          </div>

          {/* Features */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-dark">Features</label>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setFeatures([...features, { feature_en: '', feature_es: '' }])}
              >
                + Add Feature
              </Button>
            </div>
            {features.map((f, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  placeholder="Feature (EN)"
                  value={f.feature_en}
                  onChange={(e) => {
                    const next = [...features];
                    next[i] = { ...next[i], feature_en: e.target.value };
                    setFeatures(next);
                  }}
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                />
                <input
                  placeholder="Feature (ES)"
                  value={f.feature_es}
                  onChange={(e) => {
                    const next = [...features];
                    next[i] = { ...next[i], feature_es: e.target.value };
                    setFeatures(next);
                  }}
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                  className="p-1.5 text-danger hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>
            {editing.id ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Experience"
        message={`Are you sure you want to delete "${deleteTarget?.title_en}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
