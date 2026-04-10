<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    private function imageUrl(?string $path): ?string
    {
        if (!$path) return null;
        return str_starts_with($path, 'http') ? $path : asset('storage/' . $path);
    }

    public function index(Request $request)
    {
        $query = Gallery::orderBy('sort_order');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $images = $query->get()->map(fn ($g) => [
            'id' => $g->id,
            'image' => $this->imageUrl($g->image),
            'alt_en' => $g->alt_en,
            'alt_es' => $g->alt_es,
            'type' => $g->type,
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
            'type' => 'nullable|in:homepage,experience,location',
        ]);

        $path = $request->file('image')->store('gallery', 'public');

        $gallery = Gallery::create([
            'image' => $path,
            'alt_en' => $data['alt_en'] ?? '',
            'alt_es' => $data['alt_es'] ?? '',
            'type' => $data['type'] ?? 'homepage',
            'sort_order' => Gallery::max('sort_order') + 1,
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
            'type' => 'nullable|in:homepage,experience,location',
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
}
