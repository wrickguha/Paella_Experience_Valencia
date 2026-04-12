<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AboutSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AboutController extends Controller
{
    private function imageUrl(?string $path): ?string
    {
        if (!$path) return null;
        return str_starts_with($path, 'http') ? $path : asset('storage/' . $path);
    }

    public function index()
    {
        return AboutSection::orderBy('sort_order')
            ->paginate(20)
            ->through(fn ($s) => [
                'id' => $s->id,
                'section_key' => $s->section_key,
                'title_en' => $s->title_en,
                'title_es' => $s->title_es,
                'content_en' => $s->content_en,
                'content_es' => $s->content_es,
                'subtitle_en' => $s->subtitle_en,
                'subtitle_es' => $s->subtitle_es,
                'image' => $this->imageUrl($s->image),
                'cta_text_en' => $s->cta_text_en,
                'cta_text_es' => $s->cta_text_es,
                'cta_link' => $s->cta_link,
                'sort_order' => $s->sort_order,
                'is_active' => $s->is_active,
            ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'section_key' => 'required|string|max:50',
            'title_en' => 'nullable|string|max:255',
            'title_es' => 'nullable|string|max:255',
            'content_en' => 'nullable|string',
            'content_es' => 'nullable|string',
            'subtitle_en' => 'nullable|string|max:255',
            'subtitle_es' => 'nullable|string|max:255',
            'cta_text_en' => 'nullable|string|max:255',
            'cta_text_es' => 'nullable|string|max:255',
            'cta_link' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable',
        ]);

        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('about', 'public');
        }

        $section = AboutSection::create($data);

        return response()->json($section, 201);
    }

    public function update(Request $request, $id)
    {
        $section = AboutSection::findOrFail($id);

        $data = $request->validate([
            'section_key' => 'required|string|max:50',
            'title_en' => 'nullable|string|max:255',
            'title_es' => 'nullable|string|max:255',
            'content_en' => 'nullable|string',
            'content_es' => 'nullable|string',
            'subtitle_en' => 'nullable|string|max:255',
            'subtitle_es' => 'nullable|string|max:255',
            'cta_text_en' => 'nullable|string|max:255',
            'cta_text_es' => 'nullable|string|max:255',
            'cta_link' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable',
        ]);

        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('image')) {
            if ($section->image && !str_starts_with($section->image, 'http')) {
                Storage::disk('public')->delete($section->image);
            }
            $data['image'] = $request->file('image')->store('about', 'public');
        }

        $section->update($data);

        return response()->json($section);
    }

    public function destroy($id)
    {
        $section = AboutSection::findOrFail($id);

        if ($section->image && !str_starts_with($section->image, 'http')) {
            Storage::disk('public')->delete($section->image);
        }

        $section->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:about_sections,id',
        ]);

        foreach ($request->ids as $order => $id) {
            AboutSection::where('id', $id)->update(['sort_order' => $order]);
        }

        return response()->json(['message' => 'Reordered']);
    }
}
