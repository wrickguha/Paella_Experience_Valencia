<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\GalleryCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
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

    public function index(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');
        $query = Gallery::active()->with('category')->orderBy('sort_order');

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($categoryQuery) => $categoryQuery
                ->where('slug', $request->query('category'))
                ->where('is_active', true));
        } elseif ($request->filled('type')) {
            $query->ofType($request->query('type'));
        }

        $images = $query->get()->map(fn ($img) => [
            'id' => $img->id,
            'image' => $this->imageUrl($img->image),
            'alt' => $lang === 'es' ? ($img->alt_es ?? $img->alt_en) : $img->alt_en,
            'type' => $img->type,
            'category_id' => $img->category_id,
            'category_slug' => $img->category?->slug,
            'category_name' => $img->category?->getName($lang),
        ]);

        return response()->json([
            'success' => true,
            'data' => $images,
        ]);
    }

    public function categories(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $categories = GalleryCategory::active()
            ->withCount(['images' => fn ($query) => $query->active()])
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($category) => [
                'id' => $category->id,
                'slug' => $category->slug,
                'name' => $category->getName($lang),
                'image_count' => $category->images_count,
            ]);

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
