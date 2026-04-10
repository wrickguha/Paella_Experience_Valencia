<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use App\Models\ExperienceFeature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExperienceController extends Controller
{
    private function imageUrl(?string $path): ?string
    {
        if (!$path) return null;
        return str_starts_with($path, 'http') ? $path : asset('storage/' . $path);
    }

    public function index(Request $request)
    {
        return Experience::with('features', 'location')
            ->orderBy('sort_order')
            ->paginate(15)
            ->through(fn ($e) => [
                'id' => $e->id,
                'title_en' => $e->title_en,
                'title_es' => $e->title_es,
                'description_en' => $e->description_en,
                'description_es' => $e->description_es,
                'hero_image' => $this->imageUrl($e->hero_image),
                'price' => $e->price,
                'duration' => $e->duration,
                'location_id' => $e->location_id,
                'location_name' => $e->location?->name_en,
                'is_active' => $e->is_active,
                'sort_order' => $e->sort_order,
                'features' => $e->features->map(fn ($f) => [
                    'id' => $f->id,
                    'feature_en' => $f->feature_en,
                    'feature_es' => $f->feature_es,
                    'sort_order' => $f->sort_order,
                ]),
            ]);
    }

    public function show($id)
    {
        $e = Experience::with('features', 'location')->findOrFail($id);

        return response()->json([
            'id' => $e->id,
            'title_en' => $e->title_en,
            'title_es' => $e->title_es,
            'description_en' => $e->description_en,
            'description_es' => $e->description_es,
            'hero_image' => $this->imageUrl($e->hero_image),
            'price' => $e->price,
            'duration' => $e->duration,
            'location_id' => $e->location_id,
            'is_active' => $e->is_active,
            'sort_order' => $e->sort_order,
            'features' => $e->features,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title_en' => 'required|string|max:255',
            'title_es' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'description_es' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'nullable|string|max:100',
            'location_id' => 'nullable|exists:locations,id',
            'is_active' => 'nullable',
            'sort_order' => 'nullable|integer',
        ]);

        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('hero_image')) {
            $data['hero_image'] = $request->file('hero_image')->store('experiences', 'public');
        }

        $experience = Experience::create($data);

        if ($request->has('features')) {
            $features = json_decode($request->input('features'), true) ?? [];
            foreach ($features as $i => $f) {
                $experience->features()->create([
                    'feature_en' => $f['feature_en'] ?? '',
                    'feature_es' => $f['feature_es'] ?? '',
                    'sort_order' => $i,
                ]);
            }
        }

        return response()->json($experience->load('features'), 201);
    }

    public function update(Request $request, $id)
    {
        $experience = Experience::findOrFail($id);

        $data = $request->validate([
            'title_en' => 'required|string|max:255',
            'title_es' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'description_es' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'nullable|string|max:100',
            'location_id' => 'nullable|exists:locations,id',
            'is_active' => 'nullable',
            'sort_order' => 'nullable|integer',
        ]);

        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('hero_image')) {
            if ($experience->hero_image) {
                Storage::disk('public')->delete($experience->hero_image);
            }
            $data['hero_image'] = $request->file('hero_image')->store('experiences', 'public');
        }

        $experience->update($data);

        if ($request->has('features')) {
            $experience->features()->delete();
            $features = json_decode($request->input('features'), true) ?? [];
            foreach ($features as $i => $f) {
                $experience->features()->create([
                    'feature_en' => $f['feature_en'] ?? '',
                    'feature_es' => $f['feature_es'] ?? '',
                    'sort_order' => $i,
                ]);
            }
        }

        return response()->json($experience->load('features'));
    }

    public function destroy($id)
    {
        $experience = Experience::findOrFail($id);
        if ($experience->hero_image) {
            Storage::disk('public')->delete($experience->hero_image);
        }
        $experience->features()->delete();
        $experience->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
