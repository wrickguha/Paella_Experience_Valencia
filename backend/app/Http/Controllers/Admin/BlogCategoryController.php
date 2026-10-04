<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = BlogCategory::withCount('posts')
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_es' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_categories,slug',
            'description_en' => 'nullable|string',
            'description_es' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable',
        ]);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name_en']);
        } else {
            $data['slug'] = Str::slug($data['slug']);
        }

        // Ensure unique slug
        $baseSlug = $data['slug'];
        $count = 1;
        while (BlogCategory::where('slug', $data['slug'])->exists()) {
            $data['slug'] = "{$baseSlug}-{$count}";
            $count++;
        }

        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);
        $data['sort_order'] = (int) ($data['sort_order'] ?? 0);

        $category = BlogCategory::create($data);

        return response()->json([
            'success' => true,
            'data' => $category,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $category = BlogCategory::findOrFail($id);

        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_es' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blog_categories,slug,' . $category->id,
            'description_en' => 'nullable|string',
            'description_es' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable',
        ]);

        if (!empty($data['slug'])) {
            $data['slug'] = Str::slug($data['slug']);
        } else {
            $data['slug'] = Str::slug($data['name_en']);
        }

        // Ensure unique slug if changed
        $baseSlug = $data['slug'];
        $count = 1;
        while (BlogCategory::where('slug', $data['slug'])->where('id', '!=', $category->id)->exists()) {
            $data['slug'] = "{$baseSlug}-{$count}";
            $count++;
        }

        $data['is_active'] = filter_var($request->input('is_active', $category->is_active), FILTER_VALIDATE_BOOLEAN);
        $data['sort_order'] = (int) ($data['sort_order'] ?? $category->sort_order);

        $category->update($data);

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $category = BlogCategory::findOrFail($id);
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
        ]);
    }
}
