import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { locationsApi } from '@/services/api';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable, { Pagination } from '@/components/DataTable';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { FormInput, FormTextarea, FormSelect, ImageUpload, FormToggle } from '@/components/FormFields';

interface Location {
  id: number;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  address: string;
  image: string;
  availability_type: string;
  is_active: boolean;
}

const EMPTY: Partial<Location> = {
  name_en: '', name_es: '', description_en: '', description_es: '',
  address: '', availability_type: 'weekly', is_active: true,
};

export default function LocationsPage() {
  const [data, setData] = useState<Location[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Location>>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await locationsApi.list(page);
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

  const openEdit = (loc: Location) => {
    setEditing(loc);
    setImageFile(null);
    setImagePreview(loc.image || null);
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
      fd.append('name_en', editing.name_en || '');
      fd.append('name_es', editing.name_es || '');
      fd.append('description_en', editing.description_en || '');
      fd.append('description_es', editing.description_es || '');
      fd.append('address', editing.address || '');
      fd.append('availability_type', editing.availability_type || 'weekly');
      fd.append('is_active', editing.is_active ? '1' : '0');
      if (imageFile) fd.append('image', imageFile);
      if (editing.id) {
        fd.append('_method', 'PUT');
        await locationsApi.update(editing.id, fd);
      } else {
        await locationsApi.create(fd);
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
      await locationsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetch();
    } catch { /* empty */ }
    setDeleting(false);
  };

  const columns = [
    {
      key: 'image',
      header: '',
      className: 'w-16',
      render: (r: Location) => (
        <img src={r.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
      ),
    },
    {
      key: 'name_en',
      header: 'Name',
      render: (r: Location) => (
        <div>
          <p className="font-medium">{r.name_en}</p>
          <p className="text-xs text-neutral-gray">{r.name_es}</p>
        </div>
      ),
    },
    { key: 'address', header: 'Address' },
    {
      key: 'availability_type',
      header: 'Schedule Type',
      render: (r: Location) => (
        <Badge variant="info">{r.availability_type}</Badge>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (r: Location) => (
        <Badge variant={r.is_active ? 'success' : 'default'}>
          {r.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (r: Location) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-gray hover:text-primary">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Locations" description="Manage your event locations">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Location</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          {loading ? <Spinner /> : data.length === 0 ? (
            <EmptyState
              icon={<MapPin className="w-10 h-10" />}
              title="No locations yet"
              action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Location</Button>}
            />
          ) : (
            <>
              <DataTable columns={columns} data={data} />
              <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
            </>
          )}
        </Card>
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing.id ? 'Edit Location' : 'New Location'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Name (EN)" value={editing.name_en || ''} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} />
          <FormInput label="Name (ES)" value={editing.name_es || ''} onChange={(e) => setEditing({ ...editing, name_es: e.target.value })} />
          <FormTextarea label="Description (EN)" value={editing.description_en || ''} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} />
          <FormTextarea label="Description (ES)" value={editing.description_es || ''} onChange={(e) => setEditing({ ...editing, description_es: e.target.value })} />
          <FormInput label="Address" value={editing.address || ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className="md:col-span-2" />
          <FormSelect
            label="Availability Type"
            value={editing.availability_type || 'weekly'}
            onChange={(e) => setEditing({ ...editing, availability_type: e.target.value })}
            options={[{ value: 'weekly', label: 'Weekly Schedule' }, { value: 'custom', label: 'Custom Dates' }]}
          />
          <div className="flex items-end">
            <FormToggle label="Active" checked={editing.is_active ?? true} onChange={(v) => setEditing({ ...editing, is_active: v })} />
          </div>
          <div className="md:col-span-2">
            <ImageUpload label="Location Image" preview={imagePreview} onChange={handleImageChange} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing.id ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Location"
        message={`Delete "${deleteTarget?.name_en}"? All associated schedules and slots will be removed.`}
        loading={deleting}
      />
    </div>
  );
}
