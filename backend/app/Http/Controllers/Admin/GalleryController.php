<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\GalleryCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

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

    public function index(Request $request)
    {
        $query = Gallery::with('category')->orderBy('sort_order');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $images = $query->get()->map(fn ($g) => [
            'id' => $g->id,
            'image' => $this->imageUrl($g->image),
            'alt_en' => $g->alt_en,
            'alt_es' => $g->alt_es,
            'type' => $g->type,
            'category_id' => $g->category_id,
            'category_name_en' => $g->category?->name_en,
            'category_name_es' => $g->category?->name_es,
            'sort_order' => $g->sort_order,
            'is_active' => $g->is_active,
        ]);

        return response()->json($images);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'image' => 'required|image|max:5120',
            'alt_en' => 'nullable|string|max:255',
            'alt_es' => 'nullable|string|max:255',
            'category_id' => 'required|exists:gallery_categories,id',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $path = $request->file('image')->store('gallery', 'public');

        $gallery = Gallery::create([
            'image' => $path,
            'alt_en' => $data['alt_en'] ?? '',
            'alt_es' => $data['alt_es'] ?? '',
            'type' => 'homepage',
            'category_id' => $data['category_id'],
            'sort_order' => $data['sort_order'] ?? ((int) Gallery::max('sort_order') + 1),
            'is_active' => true,
        ]);

        return response()->json($gallery, 201);
    }

    public function update(Request $request, $id)
    {
        $gallery = Gallery::findOrFail($id);

        $data = $request->validate([
            'alt_en' => 'nullable|string|max:255',
            'alt_es' => 'nullable|string|max:255',
            'category_id' => 'required|exists:gallery_categories,id',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'required|boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($gallery->image) {
                Storage::disk('public')->delete($gallery->image);
            }
            $data['image'] = $request->file('image')->store('gallery', 'public');
        }

        $gallery->update($data);

        return response()->json($gallery);
    }

    public function destroy($id)
    {
        $gallery = Gallery::findOrFail($id);
        if ($gallery->image) {
            Storage::disk('public')->delete($gallery->image);
        }
        $gallery->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function reorder(Request $request)
    {
        $request->validate(['ids' => 'required|array']);

        foreach ($request->ids as $i => $id) {
            Gallery::where('id', $id)->update(['sort_order' => $i]);
        }

        return response()->json(['message' => 'Reordered']);
    }

    public function categories()
    {
        $categories = GalleryCategory::withCount('images')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function storeCategory(Request $request)
    {
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_es' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $baseSlug = Str::slug($data['name_en']);
        $slug = $baseSlug;
        $suffix = 1;
        while (GalleryCategory::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        $category = GalleryCategory::create([
            ...$data,
            'slug' => $slug,
            'sort_order' => $data['sort_order'] ?? ((int) GalleryCategory::max('sort_order') + 1),
            'is_active' => true,
        ]);

        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = GalleryCategory::findOrFail($id);
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_es' => 'nullable|string|max:255',
            'sort_order' => 'required|integer|min:0',
        ]);

        $category->update($data);

        return response()->json(['success' => true, 'data' => $category]);
    }

    public function destroyCategory($id)
    {
        $category = GalleryCategory::findOrFail($id);
        if ($category->images()->exists()) {
            return response()->json([
                'message' => 'Move or delete this category’s images before deleting the category.',
            ], 422);
        }

        $category->delete();

        return response()->json(['success' => true, 'message' => 'Category deleted.']);
    }
}
