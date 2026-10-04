import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Newspaper,
  FolderTree,
  Star,
  Eye,
  Search,
  ExternalLink,
  Clock,
  User,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  Minus,
} from 'lucide-react';
import { blogPostsApi, blogCategoriesApi } from '@/services/api';
import PageHeader, { Card, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import DataTable, { Pagination } from '@/components/DataTable';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { FormInput, FormTextarea, FormSelect, ImageUpload, FormToggle } from '@/components/FormFields';

interface BlogCategory {
  id: number;
  name_en: string;
  name_es?: string;
  slug: string;
  description_en?: string;
  description_es?: string;
  sort_order: number;
  is_active: boolean;
  posts_count?: number;
}

interface BlogPost {
  id: number;
  title_en: string;
  title_es?: string;
  slug: string;
  category_id?: number;
  category_name?: string;
  featured_image?: string;
  raw_image_path?: string;
  excerpt_en?: string;
  excerpt_es?: string;
  content_en: string;
  content_es?: string;
  author_name: string;
  author_role: string;
  reading_time: string;
  is_featured: boolean;
  is_published: boolean;
  published_at?: string;
  views_count: number;
  sort_order: number;
  created_at?: string;
}

const EMPTY_POST: Partial<BlogPost> = {
  title_en: '',
  title_es: '',
  slug: '',
  category_id: undefined,
  excerpt_en: '',
  excerpt_es: '',
  content_en: '',
  content_es: '',
  author_name: 'SpeakEasy Valencia',
  author_role: 'Culinary & Culture Host',
  reading_time: '5 min read',
  is_featured: false,
  is_published: true,
  published_at: new Date().toISOString().slice(0, 16),
  sort_order: 0,
};

const EMPTY_CATEGORY: Partial<BlogCategory> = {
  name_en: '',
  name_es: '',
  slug: '',
  description_en: '',
  description_es: '',
  sort_order: 0,
  is_active: true,
};

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');

  // Posts State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Post Modal & Edit
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost>>(EMPTY_POST);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [savingPost, setSavingPost] = useState(false);
  const [deletePostTarget, setDeletePostTarget] = useState<BlogPost | null>(null);
  const [deletingPost, setDeletingPost] = useState(false);
  const [postModalTab, setPostModalTab] = useState<'details' | 'en' | 'es'>('details');

  // Category Modal & Edit
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Partial<BlogCategory>>(EMPTY_CATEGORY);
  const [savingCat, setSavingCat] = useState(false);
  const [deleteCatTarget, setDeleteCatTarget] = useState<BlogCategory | null>(null);
  const [deletingCat, setDeletingCat] = useState(false);

  // Textarea ref for quick markdown insertion
  const enContentRef = useRef<HTMLTextAreaElement>(null);
  const esContentRef = useRef<HTMLTextAreaElement>(null);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setLoadingCats(true);
    try {
      const res = await blogCategoriesApi.list();
      setCategories(res.data.data || []);
    } catch {
      toast.error('Failed to load blog categories.');
    } finally {
      setLoadingCats(false);
    }
  }, []);

  // Fetch Posts
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const params: Record<string, string | number> = { page };
      if (search) params.search = search;
      if (selectedCategory && selectedCategory !== 'all') params.category_id = selectedCategory;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

      const res = await blogPostsApi.list(params);
      setPosts(res.data.data || []);
      setLastPage(res.data.meta?.last_page || 1);
    } catch {
      toast.error('Failed to load blog posts.');
    } finally {
      setLoadingPosts(false);
    }
  }, [page, search, selectedCategory, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle Slug generation
  const handleTitleChange = (val: string) => {
    const isCreating = !editingPost.id;
    const updates: Partial<BlogPost> = { title_en: val };
    if (isCreating) {
      updates.slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    setEditingPost((prev) => ({ ...prev, ...updates }));
  };

  // Quick calculate reading time
  const updateReadingTimeFromContent = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setEditingPost((prev) => ({
      ...prev,
      reading_time: `${minutes} min read`,
    }));
  };

  // Markdown toolbar insert
  const insertFormatting = (prefix: string, suffix: string = '', isEs = false) => {
    const textarea = isEs ? esContentRef.current : enContentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = isEs ? editingPost.content_es || '' : editingPost.content_en || '';
    const selected = currentVal.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);

    if (isEs) {
      setEditingPost((prev) => ({ ...prev, content_es: newVal }));
    } else {
      setEditingPost((prev) => ({ ...prev, content_en: newVal }));
      updateReadingTimeFromContent(newVal);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 50);
  };

  // Open Create Post Modal
  const openCreatePost = () => {
    setEditingPost({
      ...EMPTY_POST,
      category_id: categories[0]?.id,
      published_at: new Date().toISOString().slice(0, 16),
    });
    setImageFile(null);
    setImagePreview(null);
    setPostModalTab('details');
    setPostModalOpen(true);
  };

  // Open Edit Post Modal
  const openEditPost = (post: BlogPost) => {
    setEditingPost({
      ...post,
      published_at: post.published_at ? post.published_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
    });
    setImageFile(null);
    setImagePreview(post.featured_image || null);
    setPostModalTab('details');
    setPostModalOpen(true);
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

  // Save Post
  const handleSavePost = async () => {
    if (!editingPost.title_en?.trim()) {
      toast.error('English Title is required.');
      setPostModalTab('details');
      return;
    }
    if (!editingPost.content_en?.trim()) {
      toast.error('English Content is required.');
      setPostModalTab('en');
      return;
    }

    setSavingPost(true);
    try {
      const fd = new FormData();
      fd.append('title_en', editingPost.title_en || '');
      fd.append('title_es', editingPost.title_es || '');
      fd.append('slug', editingPost.slug || '');
      if (editingPost.category_id) {
        fd.append('category_id', String(editingPost.category_id));
      }
      fd.append('excerpt_en', editingPost.excerpt_en || '');
      fd.append('excerpt_es', editingPost.excerpt_es || '');
      fd.append('content_en', editingPost.content_en || '');
      fd.append('content_es', editingPost.content_es || '');
      fd.append('author_name', editingPost.author_name || 'SpeakEasy Valencia');
      fd.append('author_role', editingPost.author_role || 'Culinary & Culture Host');
      fd.append('reading_time', editingPost.reading_time || '5 min read');
      fd.append('is_featured', editingPost.is_featured ? '1' : '0');
      fd.append('is_published', editingPost.is_published ? '1' : '0');
      if (editingPost.published_at) {
        fd.append('published_at', editingPost.published_at);
      }
      fd.append('sort_order', String(editingPost.sort_order || 0));

      if (imageFile) {
        fd.append('featured_image', imageFile);
      }

      if (editingPost.id) {
        await blogPostsApi.update(editingPost.id, fd);
        toast.success('Blog article updated successfully!');
      } else {
        await blogPostsApi.create(fd);
        toast.success('Blog article created successfully!');
      }

      setPostModalOpen(false);
      fetchPosts();
      fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error saving blog post.';
      toast.error(msg);
    } finally {
      setSavingPost(false);
    }
  };

  // Toggle Publish
  const handleTogglePublish = async (post: BlogPost) => {
    try {
      await blogPostsApi.togglePublish(post.id);
      toast.success(post.is_published ? 'Article unpublished.' : 'Article published!');
      fetchPosts();
    } catch {
      toast.error('Failed to change publish status.');
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (post: BlogPost) => {
    try {
      await blogPostsApi.toggleFeatured(post.id);
      toast.success(post.is_featured ? 'Removed from featured.' : 'Marked as featured!');
      fetchPosts();
    } catch {
      toast.error('Failed to update featured status.');
    }
  };

  // Delete Post
  const handleDeletePost = async () => {
    if (!deletePostTarget) return;
    setDeletingPost(true);
    try {
      await blogPostsApi.delete(deletePostTarget.id);
      toast.success('Article deleted.');
      setDeletePostTarget(null);
      fetchPosts();
      fetchCategories();
    } catch {
      toast.error('Failed to delete post.');
    } finally {
      setDeletingPost(false);
    }
  };

  // Save Category
  const handleSaveCategory = async () => {
    if (!editingCat.name_en?.trim()) {
      toast.error('English category name is required.');
      return;
    }

    setSavingCat(true);
    try {
      if (editingCat.id) {
        await blogCategoriesApi.update(editingCat.id, editingCat);
        toast.success('Category updated.');
      } else {
        await blogCategoriesApi.create(editingCat);
        toast.success('Category created.');
      }
      setCatModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSavingCat(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    setDeletingCat(true);
    try {
      await blogCategoriesApi.delete(deleteCatTarget.id);
      toast.success('Category deleted.');
      setDeleteCatTarget(null);
      fetchCategories();
      fetchPosts();
    } catch {
      toast.error('Failed to delete category.');
    } finally {
      setDeletingCat(false);
    }
  };

  // Post Table Columns
  const postColumns = [
    {
      key: 'article',
      header: 'Article',
      render: (post: BlogPost) => (
        <div className="flex items-center gap-3 max-w-sm">
          <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
            {post.featured_image ? (
              <img src={post.featured_image} alt={post.title_en} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Newspaper className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-neutral-dark text-sm truncate" title={post.title_en}>
                {post.title_en}
              </p>
              {post.is_featured && (
                <span className="shrink-0 bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                </span>
              )}
            </div>
            {post.title_es && (
              <p className="text-xs text-neutral-gray truncate mt-0.5" title={post.title_es}>
                {post.title_es}
              </p>
            )}
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">/blog/{post.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (post: BlogPost) => (
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
          {post.category_name || 'Uncategorized'}
        </Badge>
      ),
    },
    {
      key: 'author',
      header: 'Author / Read Time',
      render: (post: BlogPost) => (
        <div>
          <div className="text-xs font-medium text-neutral-dark flex items-center gap-1">
            <User className="w-3 h-3 text-neutral-gray" />
            {post.author_name}
          </div>
          <div className="text-[11px] text-neutral-gray flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            {post.reading_time || '5 min read'}
          </div>
        </div>
      ),
    },
    {
      key: 'featured',
      header: 'Featured',
      render: (post: BlogPost) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFeatured(post);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            post.is_featured
              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
              : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'
          }`}
          title={post.is_featured ? 'Unmark featured' : 'Mark as featured'}
        >
          <Star className={`w-5 h-5 ${post.is_featured ? 'fill-amber-400' : ''}`} />
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (post: BlogPost) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePublish(post);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              post.is_published
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {post.is_published ? 'Published' : 'Draft'}
          </button>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (post: BlogPost) => (
        <span className="text-xs text-neutral-gray whitespace-nowrap">
          {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (post: BlogPost) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-neutral-gray hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            title="Preview live article"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={() => openEditPost(post)}
            className="p-1.5 text-neutral-gray hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit article"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletePostTarget(post)}
            className="p-1.5 text-neutral-gray hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
            title="Delete article"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Category Table Columns
  const catColumns = [
    {
      key: 'name',
      header: 'Category Name',
      render: (cat: BlogCategory) => (
        <div>
          <p className="font-semibold text-neutral-dark text-sm">{cat.name_en}</p>
          {cat.name_es && <p className="text-xs text-neutral-gray">{cat.name_es}</p>}
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (cat: BlogCategory) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
          {cat.slug}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (cat: BlogCategory) => (
        <p className="text-xs text-neutral-gray max-w-xs truncate" title={cat.description_en}>
          {cat.description_en || '—'}
        </p>
      ),
    },
    {
      key: 'posts_count',
      header: 'Articles',
      render: (cat: BlogCategory) => (
        <Badge variant="outline" className="font-semibold">
          {cat.posts_count || 0}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Active',
      render: (cat: BlogCategory) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {cat.is_active ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (cat: BlogCategory) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setEditingCat(cat);
              setCatModalOpen(true);
            }}
            className="p-1.5 text-neutral-gray hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteCatTarget(cat)}
            className="p-1.5 text-neutral-gray hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog & Articles"
        description="Create, edit, and manage rich cultural articles, paella stories, and language learning guides."
      >
        <Button
          onClick={() => {
            if (activeTab === 'posts') {
              openCreatePost();
            } else {
              setEditingCat({ ...EMPTY_CATEGORY });
              setCatModalOpen(true);
            }
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'posts' ? 'Add Article' : 'Add Category'}
        </Button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'posts'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-gray hover:text-neutral-dark'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          Articles ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-gray hover:text-neutral-dark'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Categories ({categories.length})
        </button>
      </div>

      {/* Tab: Articles */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-neutral-gray absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_en}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card>
            {loadingPosts ? (
              <div className="p-12 flex justify-center">
                <Spinner />
              </div>
            ) : posts.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No articles found"
                  description="Start by creating your first blog article."
                  actionLabel="Add Article"
                  onAction={openCreatePost}
                />
              </div>
            ) : (
              <>
                <DataTable columns={postColumns} data={posts} />
                <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
              </>
            )}
          </Card>
        </div>
      )}

      {/* Tab: Categories */}
      {activeTab === 'categories' && (
        <Card>
          {loadingCats ? (
            <div className="p-12 flex justify-center">
              <Spinner />
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No categories"
                description="Add categories to organize your blog posts."
                actionLabel="Add Category"
                onAction={() => {
                  setEditingCat({ ...EMPTY_CATEGORY });
                  setCatModalOpen(true);
                }}
              />
            </div>
          ) : (
            <DataTable columns={catColumns} data={categories} />
          )}
        </Card>
      )}

      {/* Modal: Create / Edit Article */}
      <Modal
        open={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        title={editingPost.id ? 'Edit Article' : 'Create Article'}
        size="xl"
      >
        <div className="space-y-5">
          {/* Subtabs inside modal */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setPostModalTab('details')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                postModalTab === 'details'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-neutral-gray hover:text-neutral-dark'
              }`}
            >
              General Details
            </button>
            <button
              type="button"
              onClick={() => setPostModalTab('en')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                postModalTab === 'en'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-neutral-gray hover:text-neutral-dark'
              }`}
            >
              English Content *
            </button>
            <button
              type="button"
              onClick={() => setPostModalTab('es')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                postModalTab === 'es'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-neutral-gray hover:text-neutral-dark'
              }`}
            >
              Spanish Content (Optional)
            </button>
          </div>

          {/* TAB 1: General Details */}
          {postModalTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Title (English) *"
                  value={editingPost.title_en || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. The Secret to Authentic Valencian Socarrat"
                />
                <FormInput
                  label="Title (Spanish)"
                  value={editingPost.title_es || ''}
                  onChange={(e) => setEditingPost((prev) => ({ ...prev, title_es: e.target.value }))}
                  placeholder="e.g. El Secreto del Socarrat Valenciano"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="URL Slug"
                  value={editingPost.slug || ''}
                  onChange={(e) => setEditingPost((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="secret-to-authentic-valencian-socarrat"
                />
                <FormSelect
                  label="Category"
                  value={editingPost.category_id || ''}
                  onChange={(e) =>
                    setEditingPost((prev) => ({ ...prev, category_id: Number(e.target.value) || undefined }))
                  }
                  options={categories.map((c) => ({ value: c.id, label: c.name_en }))}
                />
              </div>

              {/* Image Upload */}
              <ImageUpload
                label="Featured Article Image"
                preview={imagePreview}
                onChange={handleImageChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Author Name"
                  value={editingPost.author_name || ''}
                  onChange={(e) => setEditingPost((prev) => ({ ...prev, author_name: e.target.value }))}
                  placeholder="Chef Gene"
                />
                <FormInput
                  label="Author Role"
                  value={editingPost.author_role || ''}
                  onChange={(e) => setEditingPost((prev) => ({ ...prev, author_role: e.target.value }))}
                  placeholder="Head Paella Artisan"
                />
                <FormInput
                  label="Estimated Reading Time"
                  value={editingPost.reading_time || ''}
                  onChange={(e) => setEditingPost((prev) => ({ ...prev, reading_time: e.target.value }))}
                  placeholder="5 min read"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Publication Date & Time"
                  type="datetime-local"
                  value={editingPost.published_at || ''}
                  onChange={(e) => setEditingPost((prev) => ({ ...prev, published_at: e.target.value }))}
                />
                <FormInput
                  label="Sort Order"
                  type="number"
                  value={editingPost.sort_order ?? 0}
                  onChange={(e) => setEditingPost((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-200">
                <FormToggle
                  label="Mark as Featured Article"
                  description="Displays prominently at the top of the blog directory"
                  checked={Boolean(editingPost.is_featured)}
                  onChange={(checked) => setEditingPost((prev) => ({ ...prev, is_featured: checked }))}
                />
                <hr className="border-gray-200" />
                <FormToggle
                  label="Publish Article"
                  description="When enabled, the post is visible to public visitors"
                  checked={Boolean(editingPost.is_published)}
                  onChange={(checked) => setEditingPost((prev) => ({ ...prev, is_published: checked }))}
                />
              </div>
            </div>
          )}

          {/* TAB 2: English Content */}
          {postModalTab === 'en' && (
            <div className="space-y-4">
              <FormTextarea
                label="Excerpt / Summary (English)"
                value={editingPost.excerpt_en || ''}
                onChange={(e) => setEditingPost((prev) => ({ ...prev, excerpt_en: e.target.value }))}
                rows={2}
                placeholder="A compelling 1-2 sentence hook for cards and search engines..."
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-neutral-dark">
                    Article Body (English) *
                  </label>
                  {/* Markdown Quick Toolbar */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => insertFormatting('## ', '\n', false)}
                      className="p-1 hover:bg-white rounded text-xs text-neutral-dark"
                      title="Heading 2"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('### ', '\n', false)}
                      className="p-1 hover:bg-white rounded text-xs text-neutral-dark"
                      title="Heading 3"
                    >
                      <Heading3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**', false)}
                      className="p-1 hover:bg-white rounded text-xs text-neutral-dark"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('*', '*', false)}
                      className="p-1 hover:bg-white rounded text-xs text-neutral-dark"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('> "', '"\n', false)}
                      className="p-1 hover:bg-white rounded text-xs text-neutral-dark"
                      title="Blockquote"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('- ', '\n', false)}
                      className="p-1 hover:bg-white rounded text-xs text-neutral-dark"
                      title="Bullet list"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n---\n', '', false)}
                      className="p-1 hover:bg-white rounded text-xs text-neutral-dark"
                      title="Horizontal line"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  ref={enContentRef}
                  rows={14}
                  value={editingPost.content_en || ''}
                  onChange={(e) => {
                    const text = e.target.value;
                    setEditingPost((prev) => ({ ...prev, content_en: text }));
                    updateReadingTimeFromContent(text);
                  }}
                  placeholder="Write your article in Markdown or styled text... Use ## for section headings, - for lists, > for quotes."
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary border-gray-200"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Spanish Content */}
          {postModalTab === 'es' && (
            <div className="space-y-4">
              <FormTextarea
                label="Excerpt / Summary (Spanish)"
                value={editingPost.excerpt_es || ''}
                onChange={(e) => setEditingPost((prev) => ({ ...prev, excerpt_es: e.target.value }))}
                rows={2}
                placeholder="Resumen breve para visitantes hispanohablantes..."
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-neutral-dark">
                    Article Body (Spanish)
                  </label>
                  {/* Markdown Quick Toolbar */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => insertFormatting('## ', '\n', true)}
                      className="p-1 hover:bg-white rounded text-xs text-neutral-dark"
                      title="Heading 2"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('### ', '\n', true)}
                      className="p-1 hover:bg-white rounded text-xs text-neutral-dark"
                      title="Heading 3"
                    >
                      <Heading3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**', true)}
                      className="p-1 hover:bg-white rounded text-xs text-neutral-dark"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('*', '*', true)}
                      className="p-1 hover:bg-white rounded text-xs text-neutral-dark"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('> "', '"\n', true)}
                      className="p-1 hover:bg-white rounded text-xs text-neutral-dark"
                      title="Blockquote"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('- ', '\n', true)}
                      className="p-1 hover:bg-white rounded text-xs text-neutral-dark"
                      title="Bullet list"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  ref={esContentRef}
                  rows={14}
                  value={editingPost.content_es || ''}
                  onChange={(e) => setEditingPost((prev) => ({ ...prev, content_es: e.target.value }))}
                  placeholder="Contenido en español (si se deja vacío, se mostrará el contenido en inglés)..."
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary border-gray-200"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setPostModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePost} disabled={savingPost}>
              {savingPost ? 'Saving...' : editingPost.id ? 'Update Article' : 'Create Article'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create / Edit Category */}
      <Modal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCat.id ? 'Edit Category' : 'Create Category'}
      >
        <div className="space-y-4">
          <FormInput
            label="Category Name (English) *"
            value={editingCat.name_en || ''}
            onChange={(e) => {
              const name = e.target.value;
              const isNew = !editingCat.id;
              setEditingCat((prev) => ({
                ...prev,
                name_en: name,
                slug: isNew
                  ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                  : prev.slug,
              }));
            }}
            placeholder="e.g. Gastronomy & Culture"
          />

          <FormInput
            label="Category Name (Spanish)"
            value={editingCat.name_es || ''}
            onChange={(e) => setEditingCat((prev) => ({ ...prev, name_es: e.target.value }))}
            placeholder="e.g. Gastronomía y Cultura"
          />

          <FormInput
            label="Slug"
            value={editingCat.slug || ''}
            onChange={(e) => setEditingCat((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="gastronomy-culture"
          />

          <FormTextarea
            label="Description (English)"
            value={editingCat.description_en || ''}
            onChange={(e) => setEditingCat((prev) => ({ ...prev, description_en: e.target.value }))}
            rows={2}
          />

          <FormTextarea
            label="Description (Spanish)"
            value={editingCat.description_es || ''}
            onChange={(e) => setEditingCat((prev) => ({ ...prev, description_es: e.target.value }))}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Sort Order"
              type="number"
              value={editingCat.sort_order ?? 0}
              onChange={(e) => setEditingCat((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
            />
            <div className="flex items-center pt-6">
              <FormToggle
                label="Active"
                checked={Boolean(editingCat.is_active)}
                onChange={(checked) => setEditingCat((prev) => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setCatModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={savingCat}>
              {savingCat ? 'Saving...' : editingCat.id ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Post */}
      <ConfirmDialog
        open={Boolean(deletePostTarget)}
        onClose={() => setDeletePostTarget(null)}
        onConfirm={handleDeletePost}
        title="Delete Article"
        message={`Are you sure you want to delete "${deletePostTarget?.title_en}"? This action cannot be undone.`}
        confirmText={deletingPost ? 'Deleting...' : 'Delete'}
        variant="danger"
      />

      {/* Confirm Delete Category */}
      <ConfirmDialog
        open={Boolean(deleteCatTarget)}
        onClose={() => setDeleteCatTarget(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${deleteCatTarget?.name_en}"? Any articles assigned to it will be uncategorized.`}
        confirmText={deletingCat ? 'Deleting...' : 'Delete'}
        variant="danger"
      />
    </div>
  );
}
