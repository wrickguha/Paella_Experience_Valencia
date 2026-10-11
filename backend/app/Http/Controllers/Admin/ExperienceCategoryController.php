<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExperienceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ExperienceCategoryController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => ExperienceCategory::withCount('locations')->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_es' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $baseSlug = Str::slug($data['name_en']) ?: 'category';
        $slug = $baseSlug;
        $suffix = 1;
        while (ExperienceCategory::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        $category = ExperienceCategory::create([
            ...$data,
            'slug' => $slug,
            'sort_order' => $data['sort_order'] ?? ((int) ExperienceCategory::max('sort_order') + 1),
            'is_active' => true,
        ]);

        $this->clearLocationCache();

        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function update(Request $request, int $id)
    {
        $category = ExperienceCategory::findOrFail($id);
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_es' => 'nullable|string|max:255',
            'sort_order' => 'required|integer|min:0',
        ]);

        $category->update($data);
        $this->clearLocationCache();

        return response()->json(['success' => true, 'data' => $category]);
    }

    public function destroy(int $id)
    {
        $category = ExperienceCategory::findOrFail($id);
        if ($category->locations()->exists()) {
            return response()->json([
                'message' => 'Reassign this category’s locations before deleting the category.',
            ], 422);
        }

        $category->delete();
        $this->clearLocationCache();

        return response()->json(['success' => true, 'message' => 'Category deleted.']);
    }

    private function clearLocationCache(): void
    {
        Cache::forget('locations_en');
        Cache::forget('locations_es');
    }
}
