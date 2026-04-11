<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Experience;
use App\Models\ExperienceFeature;
use App\Models\Schedule;
use App\Models\LocationImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class LocationController extends Controller
{
    private function imageUrl(?string $path): ?string
    {
        if (!$path) return null;
        return str_starts_with($path, 'http') ? $path : asset('storage/' . $path);
    }

    private function primaryExperienceData(Location $l): array
    {
        $exp = $l->experiences->where('is_active', true)->sortBy('sort_order')->first();
        return [
            'subtitle_en' => $exp?->title_en ?? '',
            'subtitle_es' => $exp?->title_es ?? '',
            'price' => $exp ? (float) $exp->price : null,
            'duration' => $exp?->duration ?? '',
            'hero_image' => $this->imageUrl($exp?->hero_image),
            'features' => $exp
                ? $exp->features->map(fn ($f) => [
                    'feature_en' => $f->feature_en,
                    'feature_es' => $f->feature_es,
                ])->values()->toArray()
                : [],
        ];
    }

    private function galleryData(Location $l): array
    {
        return $l->images->map(fn ($img) => [
            'id' => $img->id,
            'image' => $this->imageUrl($img->image),
            'sort_order' => $img->sort_order,
        ])->values()->toArray();
    }

    public function index()
    {
        return Location::with(['schedules', 'experiences.features', 'images'])
            ->orderBy('name_en')
            ->paginate(15)
            ->through(fn ($l) => array_merge([
                'id' => $l->id,
                'name_en' => $l->name_en,
                'name_es' => $l->name_es,
                'description_en' => $l->description_en,
                'description_es' => $l->description_es,
                'address' => $l->address,
                'image' => $this->imageUrl($l->image),
                'availability_type' => $l->availability_type,
                'is_active' => $l->is_active,
                'gallery' => $this->galleryData($l),
                'schedules' => $l->schedules->map(fn ($s) => [
                    'id' => $s->id,
                    'day_of_week' => $s->day_of_week,
                    'start_time' => substr($s->start_time, 0, 5),
                    'end_time' => substr($s->end_time, 0, 5),
                    'is_active' => $s->is_active,
                ])->values(),
            ], $this->primaryExperienceData($l)));
    }

    public function all()
    {
        return Location::where('is_active', true)
            ->orderBy('name_en')
            ->get(['id', 'name_en', 'name_es']);
    }

    public function show($id)
    {
        $l = Location::with(['schedules', 'experiences.features', 'images'])->findOrFail($id);

        return response()->json(array_merge([
            'id' => $l->id,
            'name_en' => $l->name_en,
            'name_es' => $l->name_es,
            'description_en' => $l->description_en,
            'description_es' => $l->description_es,
            'address' => $l->address,
            'image' => $this->imageUrl($l->image),
            'availability_type' => $l->availability_type,
            'is_active' => $l->is_active,
            'gallery' => $this->galleryData($l),
            'schedules' => $l->schedules->map(fn ($s) => [
                'id' => $s->id,
                'day_of_week' => $s->day_of_week,
                'start_time' => substr($s->start_time, 0, 5),
                'end_time' => substr($s->end_time, 0, 5),
                'is_active' => $s->is_active,
            ])->values(),
        ], $this->primaryExperienceData($l)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_es' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'description_es' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'availability_type' => 'nullable|in:weekly,custom',
            'is_active' => 'nullable',
        ]);

        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('locations', 'public');
        }

        $location = Location::create($data);

        $this->syncSchedules($location, $request->input('schedules'));
        $this->syncExperience($location, $request);
        $this->syncGallery($location, $request);
        $this->clearCache();

        return response()->json($location->load(['schedules', 'experiences.features', 'images']), 201);
    }

    public function update(Request $request, $id)
    {
        $location = Location::findOrFail($id);

        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_es' => 'nullable|string|max:255',
            'description_en' => 'nullable|string',
            'description_es' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'availability_type' => 'nullable|in:weekly,custom',
            'is_active' => 'nullable',
        ]);

        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('image')) {
            if ($location->image) {
                Storage::disk('public')->delete($location->image);
            }
            $data['image'] = $request->file('image')->store('locations', 'public');
        }

        $location->update($data);

        $this->syncSchedules($location, $request->input('schedules'));
        $this->syncExperience($location, $request);
        $this->syncGallery($location, $request);
        $this->clearCache();

        return response()->json($location->load(['schedules', 'experiences.features', 'images']));
    }

    public function destroy($id)
    {
        $location = Location::with('images')->findOrFail($id);
        if ($location->image) {
            Storage::disk('public')->delete($location->image);
        }
        foreach ($location->images as $img) {
            Storage::disk('public')->delete($img->image);
        }
        $location->delete();
        $this->clearCache();

        return response()->json(['message' => 'Deleted']);
    }

    private function syncExperience(Location $location, Request $request): void
    {
        // Get or create the primary experience for this location
        $experience = $location->experiences()->where('is_active', true)->orderBy('sort_order')->first();

        // If no experience fields sent and one already exists, nothing to do
        if (!$request->has('subtitle_en') && !$request->has('price') && !$request->has('features') && $experience) {
            return;
        }

        $expData = [
            'title_en' => $request->input('subtitle_en') ?? $experience?->title_en ?? '',
            'title_es' => $request->input('subtitle_es') ?? $experience?->title_es ?? '',
            'description_en' => $experience?->description_en ?? $location->description_en ?? '',
            'description_es' => $experience?->description_es ?? $location->description_es ?? '',
            'price' => $request->input('price') ?? $experience?->price ?? 0,
            'duration' => $request->input('duration') ?? $experience?->duration ?? '',
            'is_active' => true,
            'sort_order' => $experience?->sort_order ?? 0,
        ];

        if ($request->hasFile('hero_image')) {
            if ($experience?->hero_image && !str_starts_with($experience->hero_image, 'http')) {
                Storage::disk('public')->delete($experience->hero_image);
            }
            $expData['hero_image'] = $request->file('hero_image')->store('experiences', 'public');
        }

        if ($experience) {
            $experience->update($expData);
        } else {
            $experience = $location->experiences()->create($expData);
        }

        // Sync features
        $features = json_decode($request->input('features', '[]'), true);
        if (is_array($features)) {
            $experience->features()->delete();
            foreach ($features as $i => $f) {
                if (empty($f['feature_en']) && empty($f['feature_es'])) continue;
                $experience->features()->create([
                    'feature_en' => $f['feature_en'] ?? '',
                    'feature_es' => $f['feature_es'] ?? '',
                    'sort_order' => $i,
                ]);
            }
        }
    }

    private function syncSchedules(Location $location, ?string $schedulesJson): void
    {
        $schedules = json_decode($schedulesJson ?? '[]', true);
        if (!is_array($schedules)) {
            $schedules = [];
        }

        // Delete old schedules, recreate from scratch
        $location->schedules()->delete();

        foreach ($schedules as $s) {
            if (empty($s['start_time']) || empty($s['end_time'])) continue;

            $location->schedules()->create([
                'day_of_week' => (int) $s['day_of_week'],
                'start_time' => $s['start_time'],
                'end_time' => $s['end_time'],
                'is_active' => filter_var($s['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    private function syncGallery(Location $location, Request $request): void
    {
        // Remove images marked for deletion
        $removeIds = json_decode($request->input('remove_gallery_ids', '[]'), true);
        if (is_array($removeIds) && count($removeIds) > 0) {
            $toDelete = $location->images()->whereIn('id', $removeIds)->get();
            foreach ($toDelete as $img) {
                Storage::disk('public')->delete($img->image);
                $img->delete();
            }
        }

        // Add newly uploaded gallery images
        if ($request->hasFile('gallery')) {
            $currentMax = $location->images()->max('sort_order') ?? -1;
            foreach ($request->file('gallery') as $i => $file) {
                $location->images()->create([
                    'image' => $file->store('locations/gallery', 'public'),
                    'sort_order' => $currentMax + $i + 1,
                ]);
            }
        }
    }

    private function clearCache(): void
    {
        Cache::forget('locations_en');
        Cache::forget('locations_es');
    }
}
