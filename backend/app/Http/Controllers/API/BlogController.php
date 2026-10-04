<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
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

    private function formatPost(BlogPost $post, string $lang): array
    {
        return [
            'id' => $post->id,
            'title' => $post->getTitle($lang),
            'title_en' => $post->title_en,
            'title_es' => $post->title_es,
            'slug' => $post->slug,
            'excerpt' => $post->getExcerpt($lang),
            'excerpt_en' => $post->excerpt_en,
            'excerpt_es' => $post->excerpt_es,
            'content' => $post->getContent($lang),
            'featured_image' => $this->imageUrl($post->featured_image),
            'author_name' => $post->author_name,
            'author_avatar' => $this->imageUrl($post->author_avatar),
            'author_role' => $post->author_role,
            'reading_time' => $post->reading_time ?: '5 min read',
            'is_featured' => (bool) $post->is_featured,
            'published_at' => $post->published_at ? $post->published_at->toISOString() : null,
            'views_count' => (int) $post->views_count,
            'category' => $post->category ? [
                'id' => $post->category->id,
                'name' => $post->category->getName($lang),
                'slug' => $post->category->slug,
            ] : null,
        ];
    }

    /**
     * GET /api/blog
     * List published posts with category filtering, search, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');
        $categorySlug = $request->query('category');
        $search = trim($request->query('search', ''));
        $perPage = (int) $request->query('per_page', 9);

        // Base query for published posts
        $query = BlogPost::published()
            ->with('category')
            ->orderBy('is_featured', 'desc')
            ->orderBy('sort_order', 'asc')
            ->orderBy('published_at', 'desc');

        if ($categorySlug && $categorySlug !== 'all') {
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                  ->orWhere('title_es', 'like', "%{$search}%")
                  ->orWhere('excerpt_en', 'like', "%{$search}%")
                  ->orWhere('excerpt_es', 'like', "%{$search}%")
                  ->orWhere('content_en', 'like', "%{$search}%")
                  ->orWhere('content_es', 'like', "%{$search}%")
                  ->orWhere('author_name', 'like', "%{$search}%");
            });
        }

        // Dedicated featured post (first featured post, or first post if no filters)
        $featuredPost = null;
        if (!$categorySlug || $categorySlug === 'all') {
            $featured = BlogPost::published()
                ->featured()
                ->with('category')
                ->orderBy('published_at', 'desc')
                ->first();

            if (!$featured) {
                $featured = BlogPost::published()
                    ->with('category')
                    ->orderBy('published_at', 'desc')
                    ->first();
            }

            if ($featured) {
                $featuredPost = $this->formatPost($featured, $lang);
            }
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'featured' => $featuredPost,
                'posts' => collect($paginator->items())->map(fn ($p) => $this->formatPost($p, $lang)),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ],
        ]);
    }

    /**
     * GET /api/blog/categories
     * List active categories with published post counts.
     */
    public function categories(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $categories = BlogCategory::active()
            ->withCount(['posts as published_posts_count' => function ($q) {
                $q->where('is_published', true);
            }])
            ->orderBy('sort_order', 'asc')
            ->get()
            ->map(function ($cat) use ($lang) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->getName($lang),
                    'name_en' => $cat->name_en,
                    'name_es' => $cat->name_es,
                    'slug' => $cat->slug,
                    'description' => $cat->getDescription($lang),
                    'posts_count' => (int) $cat->published_posts_count,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * GET /api/blog/{slug}
     * Get single published post by slug, increment view count, and return related posts.
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $post = BlogPost::published()
            ->where('slug', $slug)
            ->with('category')
            ->firstOrFail();

        // Increment view count
        $post->increment('views_count');

        // Related posts: from the same category or latest, excluding current
        $related = BlogPost::published()
            ->where('id', '!=', $post->id)
            ->when($post->category_id, fn ($q) => $q->where('category_id', $post->category_id))
            ->with('category')
            ->orderBy('published_at', 'desc')
            ->take(3)
            ->get();

        if ($related->count() < 3) {
            $fallback = BlogPost::published()
                ->where('id', '!=', $post->id)
                ->whereNotIn('id', $related->pluck('id'))
                ->with('category')
                ->orderBy('published_at', 'desc')
                ->take(3 - $related->count())
                ->get();
            $related = $related->merge($fallback);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'post' => $this->formatPost($post, $lang),
                'related' => $related->map(fn ($r) => $this->formatPost($r, $lang)),
            ],
        ]);
    }
}
