import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, MapPin, Clock, X, Star, ImagePlus, CalendarDays, Tags } from 'lucide-react';
import { experienceCategoriesApi, locationsApi } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable, { Pagination } from '@/components/DataTable';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { FormInput, FormTextarea, FormSelect, FormToggle } from '@/components/FormFields';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface ScheduleEntry {
  day_of_week: number | null;
  date?: string | null;
  start_time: string;
  end_time: string;
  total_slots?: number;
  is_active: boolean;
}

interface CustomDateEntry {
  date: string;
  start_time: string;
  end_time: string;
  total_slots?: number;
  is_active: boolean;
}

interface FeatureEntry {
  feature_en: string;
  feature_es: string;
}

interface GalleryImage {
  id: number;
  image: string;
  sort_order: number;
}

interface Location {
  id: number;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  address?: string;
  maps_link?: string;
  image: string;
  availability_type: string;
  category_id: number;
  category_name_en: string;
  category_name_es?: string | null;
  is_active: boolean;
  schedules?: ScheduleEntry[];
  // Experience fields
  subtitle_en?: string;
  subtitle_es?: string;
  price?: number | null;
  duration?: string;
  hero_image?: string;
  features?: FeatureEntry[];
  gallery?: GalleryImage[];
}

interface ExperienceCategory {
  id: number;
  name_en: string;
  name_es?: string | null;
  sort_order: number;
  locations_count?: number;
}

interface CategoryForm {
  name_en: string;
  name_es: string;
  sort_order: string;
}

const EMPTY: Partial<Location> = {
  name_en: '', name_es: '', description_en: '', description_es: '',
  address: '', maps_link: '', availability_type: 'weekly', is_active: true, schedules: [],
  subtitle_en: '', subtitle_es: '', price: null, duration: '', features: [],
};

const EMPTY_SCHEDULE: ScheduleEntry = { day_of_week: 1, start_time: '12:00', end_time: '16:00', total_slots: 12, is_active: true };
const EMPTY_CUSTOM_DATE: CustomDateEntry = { date: '', start_time: '11:00', end_time: '20:00', total_slots: 12, is_active: true };

interface LocationsPageProps {
  isTab?: boolean;
  onRegisterCreate?: (cb: () => void) => void;
  onRegisterManageCategories?: (cb: () => void) => void;
}

export default function LocationsPage({ isTab = false, onRegisterCreate, onRegisterManageCategories }: LocationsPageProps) {
  const [data, setData] = useState<Location[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Location>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [features, setFeatures] = useState<FeatureEntry[]>([]);
  const [customDates, setCustomDates] = useState<CustomDateEntry[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<{ id?: number; url: string; isNew?: boolean }[]>([]);
  const [removeGalleryIds, setRemoveGalleryIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<ExperienceCategory[]>([]);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExperienceCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({ name_en: '', name_es: '', sort_order: '0' });
  const [savingCategory, setSavingCategory] = useState(false);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<ExperienceCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

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

  const fetchCategories = useCallback(async () => {
    try {
      const res = await experienceCategoriesApi.list();
      setCategories(res.data.data || []);
    } catch {
      toast.error('Failed to load experience categories.');
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setEditing({ ...EMPTY, schedules: [], features: [] });
    setFeatures([]);
    setCustomDates([]);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setRemoveGalleryIds([]);
    setModalOpen(true);
  };

  useEffect(() => {
    if (onRegisterCreate) {
      onRegisterCreate(openCreate);
    }
  }, [onRegisterCreate]);

  const openCategories = () => setCategoriesModalOpen(true);

  useEffect(() => {
    onRegisterManageCategories?.(openCategories);
  }, [onRegisterManageCategories]);

  const openEdit = (loc: Location) => {
    const allSchedules = loc.schedules || [];
    const weeklySchedules = allSchedules
      .filter((s) => !s.date)
      .map((s) => ({
        ...s,
        total_slots: s.total_slots ?? 12,
      }));
    const customDatesFromServer: CustomDateEntry[] = allSchedules
      .filter((s) => s.date)
      .map((s) => ({
        date: s.date as string,
        start_time: s.start_time,
        end_time: s.end_time,
        total_slots: s.total_slots ?? 12,
        is_active: s.is_active,
      }));
    setEditing({ ...loc, schedules: weeklySchedules });
    setFeatures(loc.features || []);
    setCustomDates(customDatesFromServer);
    setGalleryFiles([]);
    setGalleryPreviews(
      (loc.gallery || []).map((g) => ({ id: g.id, url: g.image }))
    );
    setRemoveGalleryIds([]);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name_en', editing.name_en || '');
      fd.append('name_es', editing.name_es || '');
      fd.append('description_en', editing.description_en || '');
      fd.append('description_es', editing.description_es || '');
      fd.append('maps_link', editing.maps_link || '');
      fd.append('availability_type', editing.availability_type || 'weekly');
      fd.append('category_id', String(editing.category_id ?? ''));
      fd.append('is_active', editing.is_active ? '1' : '0');
      // Combine weekly and custom date schedules into one array
      const schedulesData =
        editing.availability_type === 'custom'
          ? customDates.map((cd) => ({ ...cd, day_of_week: null }))
          : (editing.schedules || []);
      fd.append('schedules', JSON.stringify(schedulesData));
      // Experience fields
      fd.append('subtitle_en', editing.subtitle_en || '');
      fd.append('subtitle_es', editing.subtitle_es || '');
      fd.append('price', String(editing.price ?? ''));
      fd.append('duration', editing.duration || '');
      fd.append('features', JSON.stringify(features));
      fd.append('remove_gallery_ids', JSON.stringify(removeGalleryIds));
      galleryFiles.forEach((f) => fd.append('gallery[]', f));
      if (editing.id) {
        await locationsApi.update(editing.id, fd);
        toast.success('Location updated successfully!');
      } else {
        await locationsApi.create(fd);
        toast.success('Location created successfully!');
      }
      setModalOpen(false);
      await Promise.all([fetch(), fetchCategories()]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save location';
      toast.error(msg);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await locationsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Location deleted successfully!');
      await Promise.all([fetch(), fetchCategories()]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete location';
      toast.error(msg);
    }
    setDeleting(false);
  };

  const openCategoryForm = (category?: ExperienceCategory) => {
    setEditingCategory(category ?? null);
    setCategoryForm({
      name_en: category?.name_en ?? '',
      name_es: category?.name_es ?? '',
      sort_order: String(category?.sort_order ?? categories.length),
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name_en.trim()) {
      toast.error('English category name is required.');
      return;
    }

    setSavingCategory(true);
    try {
      const payload = {
        name_en: categoryForm.name_en.trim(),
        name_es: categoryForm.name_es.trim(),
        sort_order: Number(categoryForm.sort_order),
      };
      if (editingCategory) {
        await experienceCategoriesApi.update(editingCategory.id, payload);
        toast.success('Experience category updated.');
      } else {
        await experienceCategoriesApi.create(payload);
        toast.success('Experience category created.');
      }
      setCategoryModalOpen(false);
      await Promise.all([fetchCategories(), fetch()]);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Failed to save experience category.');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;
    setDeletingCategory(true);
    try {
      await experienceCategoriesApi.delete(deleteCategoryTarget.id);
      toast.success('Experience category deleted.');
      setDeleteCategoryTarget(null);
      await fetchCategories();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Failed to delete experience category.');
    } finally {
      setDeletingCategory(false);
    }
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
    {
      key: 'price',
      header: 'Price',
      render: (r: Location) => r.price != null ? formatCurrency(r.price) : '—',
    },
    {
      key: 'category',
      header: 'Category',
      render: (r: Location) => (
        <Badge variant="info">
          {r.category_name_en || 'Uncategorized'}
        </Badge>
      ),
    },
    {
      key: 'availability_type',
      header: 'Schedule',
      render: (r: Location) => (
        <div>
          <Badge variant="info">{r.availability_type}</Badge>
          {r.schedules && r.schedules.length > 0 && (
            <p className="text-xs text-neutral-gray mt-0.5">
              {r.schedules.map((s) => DAY_NAMES[s.day_of_week]?.slice(0, 3)).join(', ')}
            </p>
          )}
        </div>
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
      {!isTab && (
        <PageHeader title="Locations" description="Manage your event locations">
          <Button variant="secondary" onClick={openCategories}><Tags className="w-4 h-4" /> Manage Categories</Button>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Location</Button>
        </PageHeader>
      )}

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
          <FormInput label="Google Maps Link" value={editing.maps_link || ''} onChange={(e) => setEditing({ ...editing, maps_link: e.target.value })} className="md:col-span-2" placeholder="https://maps.app.goo.gl/..." />
          <FormSelect
            label="Availability Type"
            value={editing.availability_type || 'weekly'}
            onChange={(e) => {
              setEditing({ ...editing, availability_type: e.target.value });
            }}
            options={[{ value: 'weekly', label: 'Weekly Schedule' }, { value: 'custom', label: 'Custom Dates' }]}
          />
          <FormSelect
            label="Category"
            value={editing.category_id ? String(editing.category_id) : ''}
            onChange={(e) => setEditing({ ...editing, category_id: Number(e.target.value) || undefined })}
            options={[
              { value: '', label: categories.length ? 'Select a category' : 'Create a category first' },
              ...categories.map((category) => ({
                value: String(category.id),
                label: category.name_en,
              })),
            ]}
          />
          <div className="flex items-end">
            <FormToggle label="Active" checked={editing.is_active ?? true} onChange={(v) => setEditing({ ...editing, is_active: v })} />
          </div>

          {/* ── Custom Dates Section ── */}
          {editing.availability_type === 'custom' && (
            <div className="md:col-span-2 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-neutral-dark">Custom Dates</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomDates([...customDates, { ...EMPTY_CUSTOM_DATE }])}
                  className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Date
                </button>
              </div>
              {customDates.length === 0 ? (
                <p className="text-sm text-neutral-gray text-center py-4">
                  No custom dates added. Click "Add Date" to set specific availability.
                </p>
              ) : (
                <div className="space-y-2">
                  {customDates.map((cd, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                      <input
                        type="date"
                        value={cd.date}
                        onChange={(e) => {
                          const updated = [...customDates];
                          updated[idx] = { ...updated[idx], date: e.target.value };
                          setCustomDates(updated);
                        }}
                        className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          value={cd.start_time}
                          onChange={(e) => {
                            const updated = [...customDates];
                            updated[idx] = { ...updated[idx], start_time: e.target.value };
                            setCustomDates(updated);
                          }}
                          className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        <span className="text-xs text-neutral-gray">to</span>
                        <input
                          type="time"
                          value={cd.end_time}
                          onChange={(e) => {
                            const updated = [...customDates];
                            updated[idx] = { ...updated[idx], end_time: e.target.value };
                            setCustomDates(updated);
                          }}
                          className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        <span className="text-xs text-neutral-gray ml-2">Slots:</span>
                        <input
                          type="number"
                          min={1}
                          value={cd.total_slots ?? 12}
                          onChange={(e) => {
                            const updated = [...customDates];
                            updated[idx] = { ...updated[idx], total_slots: parseInt(e.target.value) || 12 };
                            setCustomDates(updated);
                          }}
                          className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setCustomDates(customDates.filter((_, i) => i !== idx))}
                        className="p-1 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Weekly Schedule Section ── */}
          {editing.availability_type === 'weekly' && (
            <div className="md:col-span-2 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-neutral-dark">Weekly Schedule</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      schedules: [...(editing.schedules || []), { ...EMPTY_SCHEDULE }],
                    })
                  }
                  className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Day
                </button>
              </div>

              {(!editing.schedules || editing.schedules.length === 0) ? (
                <p className="text-sm text-neutral-gray text-center py-4">
                  No schedule days added. Click "Add Day" to set availability.
                </p>
              ) : (
                <div className="space-y-2">
                  {editing.schedules.map((sched, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                      <select
                        value={sched.day_of_week}
                        onChange={(e) => {
                          const updated = [...(editing.schedules || [])];
                          updated[idx] = { ...updated[idx], day_of_week: parseInt(e.target.value) };
                          setEditing({ ...editing, schedules: updated });
                        }}
                        className="flex-1 min-w-30 px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      >
                        {DAY_NAMES.map((name, i) => (
                          <option key={i} value={i}>{name}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          value={sched.start_time}
                          onChange={(e) => {
                            const updated = [...(editing.schedules || [])];
                            updated[idx] = { ...updated[idx], start_time: e.target.value };
                            setEditing({ ...editing, schedules: updated });
                          }}
                          className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        <span className="text-xs text-neutral-gray">to</span>
                        <input
                          type="time"
                          value={sched.end_time}
                          onChange={(e) => {
                            const updated = [...(editing.schedules || [])];
                            updated[idx] = { ...updated[idx], end_time: e.target.value };
                            setEditing({ ...editing, schedules: updated });
                          }}
                          className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        <span className="text-xs text-neutral-gray ml-2">Slots:</span>
                        <input
                          type="number"
                          min={1}
                          value={sched.total_slots ?? 12}
                          onChange={(e) => {
                            const updated = [...(editing.schedules || [])];
                            updated[idx] = { ...updated[idx], total_slots: parseInt(e.target.value) || 12 };
                            setEditing({ ...editing, schedules: updated });
                          }}
                          className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editing.schedules || []).filter((_, i) => i !== idx);
                          setEditing({ ...editing, schedules: updated });
                        }}
                        className="p-1 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Experience / Pricing Section ── */}
          <div className="md:col-span-2 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-neutral-dark">Experience &amp; Pricing</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Subtitle (EN)" value={editing.subtitle_en || ''} onChange={(e) => setEditing({ ...editing, subtitle_en: e.target.value })} placeholder="e.g. Authentic SpeakEasy Valencia Experience" />
              <FormInput label="Subtitle (ES)" value={editing.subtitle_es || ''} onChange={(e) => setEditing({ ...editing, subtitle_es: e.target.value })} placeholder="e.g. Experiencia de SpeakEasy Valencia Auténtica" />
              <FormInput label="Price (€ per person)" type="number" value={editing.price ?? ''} onChange={(e) => setEditing({ ...editing, price: e.target.value ? parseFloat(e.target.value) : null })} placeholder="e.g. 99" />
              <FormInput label="Duration" value={editing.duration || ''} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} placeholder="e.g. 3 hours" />
            </div>
          </div>

          {/* ── Features / Facilities ── */}
          <div className="md:col-span-2 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-neutral-dark">Features / Facilities</p>
              <button
                type="button"
                onClick={() => setFeatures([...features, { feature_en: '', feature_es: '' }])}
                className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Feature
              </button>
            </div>
            {features.length === 0 ? (
              <p className="text-sm text-neutral-gray text-center py-4">
                No features added yet. Click "Add Feature" to list facilities.
              </p>
            ) : (
              <div className="space-y-2">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                    <input
                      type="text"
                      value={feat.feature_en}
                      onChange={(e) => {
                        const updated = [...features];
                        updated[idx] = { ...updated[idx], feature_en: e.target.value };
                        setFeatures(updated);
                      }}
                      placeholder="Feature (EN)"
                      className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <input
                      type="text"
                      value={feat.feature_es}
                      onChange={(e) => {
                        const updated = [...features];
                        updated[idx] = { ...updated[idx], feature_es: e.target.value };
                        setFeatures(updated);
                      }}
                      placeholder="Feature (ES)"
                      className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                      className="p-1 rounded-lg hover:bg-red-50 text-neutral-gray hover:text-danger shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Gallery Images ── */}
          <div className="md:col-span-2 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-neutral-dark">Gallery Images (Slideshow)</p>
              </div>
              <label className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per image
                    
                    const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE);
                    const invalidFiles = files.filter(f => f.size > MAX_FILE_SIZE);
                    
                    if (invalidFiles.length > 0) {
                      toast.error(`${invalidFiles.length} image(s) exceeded the 5MB size limit and were skipped.`);
                    }

                    if (validFiles.length > 0) {
                      setGalleryFiles((prev) => [...prev, ...validFiles]);
                      validFiles.forEach((file) => {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                          setGalleryPreviews((prev) => [...prev, { url: reader.result as string, isNew: true }]);
                        reader.readAsDataURL(file);
                      });
                    }
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            {galleryPreviews.length === 0 ? (
              <p className="text-sm text-neutral-gray text-center py-4">
                No gallery images. Add images to show a slideshow on the website.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {galleryPreviews.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img src={img.url} alt="" className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        if (img.id) {
                          setRemoveGalleryIds((prev) => [...prev, img.id!]);
                        } else {
                          // Find corresponding new file index
                          const newIdx = galleryPreviews.slice(0, idx).filter((p) => p.isNew).length;
                          setGalleryFiles((prev) => prev.filter((_, i) => i !== newIdx));
                        }
                        setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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

      <Modal open={categoriesModalOpen} onClose={() => setCategoriesModalOpen(false)} title="Manage Experience Categories" size="lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-sm text-neutral-gray">Create categories and assign them to locations.</p>
          <Button onClick={() => openCategoryForm()}><Plus className="w-4 h-4" /> Add Category</Button>
        </div>
        <div className="divide-y divide-gray-100">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-neutral-dark">{category.name_en}</p>
                <p className="text-xs text-neutral-gray">
                  {category.name_es || 'No Spanish name'} · {category.locations_count ?? 0} locations
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openCategoryForm(category)}
                  aria-label={`Edit ${category.name_en}`}
                  className="rounded-md p-2 text-neutral-gray hover:bg-gray-100 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteCategoryTarget(category)}
                  disabled={(category.locations_count ?? 0) > 0}
                  title={(category.locations_count ?? 0) > 0 ? 'Reassign its locations first' : 'Delete category'}
                  aria-label={`Delete ${category.name_en}`}
                  className="rounded-md p-2 text-neutral-gray hover:bg-red-50 hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="py-6 text-center text-sm text-neutral-gray">No categories yet. Add one to get started.</p>
          )}
        </div>
      </Modal>

      <Modal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Experience Category' : 'New Experience Category'}
        size="md"
      >
        <div className="space-y-4">
          <FormInput
            label="Name (EN)"
            value={categoryForm.name_en}
            onChange={(e) => setCategoryForm({ ...categoryForm, name_en: e.target.value })}
          />
          <FormInput
            label="Name (ES)"
            value={categoryForm.name_es}
            onChange={(e) => setCategoryForm({ ...categoryForm, name_es: e.target.value })}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCategoryModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} loading={savingCategory}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteCategoryTarget}
        onClose={() => setDeleteCategoryTarget(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Experience Category"
        message={`Are you sure you want to delete "${deleteCategoryTarget?.name_en}"? Reassign any locations before deleting it.`}
        loading={deletingCategory}
      />
    </div>
  );
}
