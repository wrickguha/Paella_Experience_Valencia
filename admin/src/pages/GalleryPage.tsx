import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { galleryApi } from '@/services/api';
import PageHeader, { Badge, Button, Card, EmptyState, Spinner } from '@/components/ui';
import { ConfirmDialog, Modal } from '@/components/Modal';
import { FormInput, FormSelect, FormToggle, ImageUpload } from '@/components/FormFields';

interface GalleryCategory {
  id: number;
  name_en: string;
  name_es: string | null;
  slug: string;
  sort_order: number;
  images_count: number;
}

interface GalleryImage {
  id: number;
  image: string;
  alt_en: string;
  alt_es: string;
  category_id: number;
  category_name_en: string | null;
  category_name_es: string | null;
  sort_order: number;
  is_active: boolean;
}

interface ImageForm {
  alt_en: string;
  alt_es: string;
  category_id: string;
  sort_order: string;
  is_active: boolean;
}

interface CategoryForm {
  name_en: string;
  name_es: string;
  sort_order: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  return fallback;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageForm, setImageForm] = useState<ImageForm>({
    alt_en: '',
    alt_es: '',
    category_id: '',
    sort_order: '0',
    is_active: true,
  });
  const [savingImage, setSavingImage] = useState(false);
  const [deleteImageTarget, setDeleteImageTarget] = useState<GalleryImage | null>(null);
  const [deletingImage, setDeletingImage] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GalleryCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({ name_en: '', name_es: '', sort_order: '0' });
  const [savingCategory, setSavingCategory] = useState(false);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<GalleryCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await galleryApi.categories();
      setCategories(res.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load gallery categories.'));
    }
  }, []);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (categoryFilter) params.category_id = categoryFilter;
      const res = await galleryApi.list(params);
      setImages(res.data.data || res.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load gallery images.'));
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => { void fetchCategories(); }, [fetchCategories]);
  useEffect(() => { void fetchImages(); }, [fetchImages]);

  const openImageModal = (image?: GalleryImage) => {
    setEditingImage(image ?? null);
    setImageFile(null);
    setImagePreview(image?.image ?? null);
    setImageForm({
      alt_en: image?.alt_en ?? '',
      alt_es: image?.alt_es ?? '',
      category_id: String(image?.category_id ?? categories[0]?.id ?? ''),
      sort_order: String(image?.sort_order ?? images.length),
      is_active: image?.is_active ?? true,
    });
    setImageModalOpen(true);
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (!file) {
      setImagePreview(editingImage?.image ?? null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveImage = async () => {
    if (!editingImage && !imageFile) {
      toast.error('Choose an image to upload.');
      return;
    }
    if (!imageForm.category_id) {
      toast.error('Create or select a category before saving an image.');
      return;
    }

    setSavingImage(true);
    try {
      const fd = new FormData();
      if (imageFile) fd.append('image', imageFile);
      fd.append('alt_en', imageForm.alt_en);
      fd.append('alt_es', imageForm.alt_es);
      fd.append('category_id', imageForm.category_id);
      fd.append('sort_order', imageForm.sort_order);
      if (editingImage) fd.append('is_active', imageForm.is_active ? '1' : '0');

      if (editingImage) {
        await galleryApi.update(editingImage.id, fd);
        toast.success('Gallery image updated.');
      } else {
        await galleryApi.create(fd);
        toast.success('Gallery image uploaded.');
      }
      setImageModalOpen(false);
      await Promise.all([fetchImages(), fetchCategories()]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save gallery image.'));
    } finally {
      setSavingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!deleteImageTarget) return;
    setDeletingImage(true);
    try {
      await galleryApi.delete(deleteImageTarget.id);
      toast.success('Gallery image deleted.');
      setDeleteImageTarget(null);
      await Promise.all([fetchImages(), fetchCategories()]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete gallery image.'));
    } finally {
      setDeletingImage(false);
    }
  };

  const openCategoryModal = (category?: GalleryCategory) => {
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
      const data = {
        name_en: categoryForm.name_en.trim(),
        name_es: categoryForm.name_es.trim(),
        sort_order: Number(categoryForm.sort_order),
      };
      if (editingCategory) {
        await galleryApi.updateCategory(editingCategory.id, data);
        toast.success('Gallery category updated.');
      } else {
        await galleryApi.createCategory(data);
        toast.success('Gallery category created.');
      }
      setCategoryModalOpen(false);
      await Promise.all([fetchCategories(), fetchImages()]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save gallery category.'));
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;
    setDeletingCategory(true);
    try {
      await galleryApi.deleteCategory(deleteCategoryTarget.id);
      toast.success('Gallery category deleted.');
      setDeleteCategoryTarget(null);
      if (categoryFilter === String(deleteCategoryTarget.id)) setCategoryFilter('');
      await fetchCategories();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete gallery category.'));
    } finally {
      setDeletingCategory(false);
    }
  };

  return (
    <div>
      <PageHeader title="Gallery" description="Organize the About page gallery by image category">
        <Button onClick={() => openImageModal()} disabled={categories.length === 0}>
          <Plus className="w-4 h-4" /> Upload Image
        </Button>
      </PageHeader>

      <Card className="mb-6 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Tags className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-semibold text-neutral-dark">Categories</h2>
              <p className="text-xs text-neutral-gray">Create clear collections for the About page gallery.</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => openCategoryModal()}>
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategoryFilter('')}
            aria-pressed={!categoryFilter}
            className={`min-w-36 rounded-xl border px-4 py-3 text-left transition-colors ${
              !categoryFilter ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40'
            }`}
          >
            <span className="block text-sm font-semibold text-neutral-dark">All images</span>
            <span className="mt-1 block text-xs text-neutral-gray">{images.length} in view</span>
          </button>
          {categories.map((category) => (
            <div
              key={category.id}
              className={`min-w-44 rounded-xl border p-3 transition-colors ${
                categoryFilter === String(category.id) ? 'border-primary bg-primary/5' : 'border-gray-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setCategoryFilter(String(category.id))}
                aria-pressed={categoryFilter === String(category.id)}
                className="block w-full text-left"
              >
                <span className="block truncate text-sm font-semibold text-neutral-dark">{category.name_en}</span>
                <span className="mt-1 block text-xs text-neutral-gray">{category.images_count} images</span>
              </button>
              <div className="mt-2 flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => openCategoryModal(category)}
                  aria-label={`Edit ${category.name_en}`}
                  className="rounded-md p-1.5 text-neutral-gray hover:bg-white hover:text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteCategoryTarget(category)}
                  disabled={category.images_count > 0}
                  aria-label={`Delete ${category.name_en}`}
                  title={category.images_count > 0 ? 'Move or delete its images first' : 'Delete category'}
                  className="rounded-md p-1.5 text-neutral-gray hover:bg-red-50 hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {categories.length === 0 && (
          <p className="mt-3 text-sm text-neutral-gray">Add a category before uploading images.</p>
        )}
      </Card>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {loading ? (
          <Spinner />
        ) : images.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={<ImageIcon className="w-10 h-10" />}
              title="No images in this category"
              description="Upload an image and assign it to a category to build the gallery."
              action={<Button onClick={() => openImageModal()} disabled={categories.length === 0}><Plus className="w-4 h-4" /> Upload Image</Button>}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden group">
                <div className="aspect-square relative bg-neutral-cream">
                  <ImageIcon className="absolute inset-0 m-auto h-8 w-8 text-primary/25" />
                  <img
                    src={image.image}
                    alt={image.alt_en}
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                    className="relative w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      type="button"
                      onClick={() => openImageModal(image)}
                      aria-label={`Edit ${image.alt_en || 'image'}`}
                      className="p-2 mr-2 bg-white rounded-full shadow-lg hover:bg-primary/10"
                    >
                      <Pencil className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteImageTarget(image)}
                      aria-label={`Delete ${image.alt_en || 'image'}`}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </button>
                  </div>
                  {!image.is_active && (
                    <span className="absolute top-2 left-2 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-neutral-dark truncate">{image.alt_en || 'Untitled'}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Badge variant="info">{image.category_name_en || 'Uncategorized'}</Badge>
                    <span className="text-[10px] text-neutral-gray">Order {image.sort_order}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      <Modal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title={editingImage ? 'Edit Gallery Image' : 'Upload Image'}
        size="md"
      >
        <div className="space-y-4">
          <ImageUpload
            label={editingImage ? 'Replace Image (optional)' : 'Image'}
            preview={imagePreview}
            onChange={handleImageChange}
          />
          <FormInput label="Alt Text (EN)" value={imageForm.alt_en} onChange={(e) => setImageForm({ ...imageForm, alt_en: e.target.value })} />
          <FormInput label="Alt Text (ES)" value={imageForm.alt_es} onChange={(e) => setImageForm({ ...imageForm, alt_es: e.target.value })} />
          <FormSelect
            label="Category"
            value={imageForm.category_id}
            onChange={(e) => setImageForm({ ...imageForm, category_id: e.target.value })}
            options={categories.map((category) => ({ value: category.id, label: category.name_en }))}
          />
          <FormInput
            label="Display order"
            type="number"
            min="0"
            value={imageForm.sort_order}
            onChange={(e) => setImageForm({ ...imageForm, sort_order: e.target.value })}
          />
          {editingImage && (
            <FormToggle
              label="Show on the About page"
              description="Hidden images stay in admin but are omitted from the public gallery."
              checked={imageForm.is_active}
              onChange={(is_active) => setImageForm({ ...imageForm, is_active })}
            />
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setImageModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveImage} loading={savingImage} disabled={!editingImage && !imageFile}>
            {editingImage ? 'Save Changes' : 'Upload'}
          </Button>
        </div>
      </Modal>

      <Modal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        size="sm"
      >
        <div className="space-y-4">
          <FormInput label="Category Name (EN)" value={categoryForm.name_en} onChange={(e) => setCategoryForm({ ...categoryForm, name_en: e.target.value })} required />
          <FormInput label="Category Name (ES)" value={categoryForm.name_es} onChange={(e) => setCategoryForm({ ...categoryForm, name_es: e.target.value })} />
          <FormInput
            label="Display order"
            type="number"
            min="0"
            value={categoryForm.sort_order}
            onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setCategoryModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCategory} loading={savingCategory}>{editingCategory ? 'Save Changes' : 'Create Category'}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteImageTarget}
        onClose={() => setDeleteImageTarget(null)}
        onConfirm={handleDeleteImage}
        title="Delete Image"
        message="Are you sure you want to delete this image? This cannot be undone."
        loading={deletingImage}
      />
      <ConfirmDialog
        open={!!deleteCategoryTarget}
        onClose={() => setDeleteCategoryTarget(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Delete “${deleteCategoryTarget?.name_en ?? ''}”? Categories with images must be emptied first.`}
        loading={deletingCategory}
      />
    </div>
  );
}
