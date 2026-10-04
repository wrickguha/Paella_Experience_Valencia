<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class BlogPostController extends Controller
{
    private function imageUrl(?string $path): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http')) return $path;
        $cleanPath = ltrim($path, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8);
        }
        return asset('storage/' . $cleanPath);
    }

    private function calculateReadingTime(?string $content): string
    {
        if (!$content) return '3 min read';
        $words = str_word_count(strip_tags($content));
        $minutes = max(1, (int) ceil($words / 200));
        return "{$minutes} min read";
    }

    public function index(Request $request): JsonResponse
    {
        $search = trim($request->query('search', ''));
        $categoryId = $request->query('category_id');
        $status = $request->query('status'); // 'published', 'draft', or all
        $perPage = (int) $request->query('per_page', 15);

        $query = BlogPost::with('category')
            ->orderBy('sort_order', 'asc')
            ->orderBy('created_at', 'desc');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                  ->orWhere('title_es', 'like', "%{$search}%")
                  ->orWhere('author_name', 'like', "%{$search}%");
            });
        }

        if ($categoryId && $categoryId !== 'all') {
            $query->where('category_id', $categoryId);
        }

        if ($status === 'published') {
            $query->where('is_published', true);
        } elseif ($status === 'draft') {
            $query->where('is_published', false);
        }

        $paginator = $query->paginate($perPage);

        $posts = collect($paginator->items())->map(function ($p) {
            return [
                'id' => $p->id,
                'title_en' => $p->title_en,
                'title_es' => $p->title_es,
                'slug' => $p->slug,
                'category_id' => $p->category_id,
                'category_name' => $p->category?->name_en,
                'featured_image' => $this->imageUrl($p->featured_image),
                'raw_image_path' => $p->featured_image,
                'excerpt_en' => $p->excerpt_en,
                'excerpt_es' => $p->excerpt_es,
                'content_en' => $p->content_en,
                'content_es' => $p->content_es,
                'author_name' => $p->author_name,
                'author_role' => $p->author_role,
                'reading_time' => $p->reading_time,
                'is_featured' => (bool) $p->is_featured,
                'is_published' => (bool) $p->is_published,
                'published_at' => $p->published_at ? $p->published_at->format('Y-m-d H:i:s') : null,
                'views_count' => (int) $p->views_count,
                'sort_order' => (int) $p->sort_order,
                'created_at' => $p->created_at ? $p->created_at->format('Y-m-d H:i:s') : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $posts,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function show($id): JsonResponse
    {
        $p = BlogPost::with('category')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $p->id,
                'title_en' => $p->title_en,
                'title_es' => $p->title_es,
                'slug' => $p->slug,
                'category_id' => $p->category_id,
                'featured_image' => $this->imageUrl($p->featured_image),
                'raw_image_path' => $p->featured_image,
                'excerpt_en' => $p->excerpt_en,
                'excerpt_es' => $p->excerpt_es,
                'content_en' => $p->content_en,
                'content_es' => $p->content_es,
                'author_name' => $p->author_name,
                'author_role' => $p->author_role,
                'reading_time' => $p->reading_time,
                'is_featured' => (bool) $p->is_featured,
                'is_published' => (bool) $p->is_published,
                'published_at' => $p->published_at ? $p->published_at->format('Y-m-d\TH:i') : null,
                'views_count' => (int) $p->views_count,
                'sort_order' => (int) $p->sort_order,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title_en' => 'required|string|max:255',
            'title_es' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_posts,slug',
            'category_id' => 'nullable|exists:blog_categories,id',
            'excerpt_en' => 'nullable|string',
            'excerpt_es' => 'nullable|string',
            'content_en' => 'required|string',
            'content_es' => 'nullable|string',
            'author_name' => 'nullable|string|max:255',
            'author_role' => 'nullable|string|max:255',
            'reading_time' => 'nullable|string|max:50',
            'is_featured' => 'nullable',
            'is_published' => 'nullable',
            'published_at' => 'nullable|date',
            'sort_order' => 'nullable|integer',
        ]);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title_en']);
        } else {
            $data['slug'] = Str::slug($data['slug']);
        }

        $baseSlug = $data['slug'];
        $count = 1;
        while (BlogPost::where('slug', $data['slug'])->exists()) {
            $data['slug'] = "{$baseSlug}-{$count}";
            $count++;
        }

        $data['is_featured'] = filter_var($request->input('is_featured', false), FILTER_VALIDATE_BOOLEAN);
        $data['is_published'] = filter_var($request->input('is_published', true), FILTER_VALIDATE_BOOLEAN);
        $data['sort_order'] = (int) ($data['sort_order'] ?? 0);
        $data['author_name'] = $data['author_name'] ?: 'SpeakEasy Valencia';
        $data['author_role'] = $data['author_role'] ?: 'Culinary & Culture Host';

        if (empty($data['reading_time'])) {
            $data['reading_time'] = $this->calculateReadingTime($data['content_en']);
        }

        if ($data['is_published'] && empty($data['published_at'])) {
            $data['published_at'] = Carbon::now();
        }

        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $request->file('featured_image')->store('blog', 'public');
        }

        $post = BlogPost::create($data);

        return response()->json([
            'success' => true,
            'data' => $post,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);

        $data = $request->validate([
            'title_en' => 'required|string|max:255',
            'title_es' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_posts,slug,' . $post->id,
            'category_id' => 'nullable|exists:blog_categories,id',
            'excerpt_en' => 'nullable|string',
            'excerpt_es' => 'nullable|string',
            'content_en' => 'required|string',
            'content_es' => 'nullable|string',
            'author_name' => 'nullable|string|max:255',
            'author_role' => 'nullable|string|max:255',
            'reading_time' => 'nullable|string|max:50',
            'is_featured' => 'nullable',
            'is_published' => 'nullable',
            'published_at' => 'nullable|date',
            'sort_order' => 'nullable|integer',
        ]);

        if (!empty($data['slug'])) {
            $data['slug'] = Str::slug($data['slug']);
        } else {
            $data['slug'] = Str::slug($data['title_en']);
        }

        $baseSlug = $data['slug'];
        $count = 1;
        while (BlogPost::where('slug', $data['slug'])->where('id', '!=', $post->id)->exists()) {
            $data['slug'] = "{$baseSlug}-{$count}";
            $count++;
        }

        $data['is_featured'] = filter_var($request->input('is_featured', $post->is_featured), FILTER_VALIDATE_BOOLEAN);
        $data['is_published'] = filter_var($request->input('is_published', $post->is_published), FILTER_VALIDATE_BOOLEAN);
        $data['sort_order'] = (int) ($data['sort_order'] ?? $post->sort_order);

        if (empty($data['reading_time'])) {
            $data['reading_time'] = $this->calculateReadingTime($data['content_en']);
        }

        if ($data['is_published'] && empty($data['published_at']) && empty($post->published_at)) {
            $data['published_at'] = Carbon::now();
        }

        if ($request->hasFile('featured_image')) {
            if ($post->featured_image && !str_starts_with($post->featured_image, 'http') && !str_starts_with($post->featured_image, 'gallery/')) {
                Storage::disk('public')->delete($post->featured_image);
            }
            $data['featured_image'] = $request->file('featured_image')->store('blog', 'public');
        }

        $post->update($data);

        return response()->json([
            'success' => true,
            'data' => $post,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);

        if ($post->featured_image && !str_starts_with($post->featured_image, 'http') && !str_starts_with($post->featured_image, 'gallery/')) {
            Storage::disk('public')->delete($post->featured_image);
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully.',
        ]);
    }

    public function togglePublish($id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->is_published = !$post->is_published;
        if ($post->is_published && !$post->published_at) {
            $post->published_at = Carbon::now();
        }
        $post->save();

        return response()->json([
            'success' => true,
            'is_published' => $post->is_published,
            'message' => $post->is_published ? 'Post published.' : 'Post unpublished.',
        ]);
    }

    public function toggleFeatured($id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->is_featured = !$post->is_featured;
        $post->save();

        return response()->json([
            'success' => true,
            'is_featured' => $post->is_featured,
            'message' => $post->is_featured ? 'Post marked as featured.' : 'Post unmarked as featured.',
        ]);
    }
}
