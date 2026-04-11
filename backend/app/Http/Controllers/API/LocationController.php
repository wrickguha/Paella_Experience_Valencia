<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LocationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $locations = Cache::remember("locations_{$lang}", 3600, function () use ($lang) {
            return Location::active()
                ->with(['schedules', 'experiences.features', 'images'])
                ->get()
                ->map(fn (Location $loc): array => $this->formatLocation($loc, $lang));
        });

        return response()->json([
            'success' => true,
            'data' => $locations,
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $location = Location::with(['schedules', 'experiences.features'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $this->formatLocation($location, $lang, true),
        ]);
    }

    private function imageUrl(?string $path): ?string
    {
        if (!$path) return null;
        return str_starts_with($path, 'http') ? $path : asset('storage/' . $path);
    }

    private function formatLocation(Location $loc, string $lang, bool $includeExperiences = false): array
    {
        $firstExp = $loc->experiences->where('is_active', true)->sortBy('sort_order')->first();

        $data = [
            'id' => $loc->id,
            'name' => $loc->getLocalizedName($lang),
            'subtitle' => $firstExp ? ($lang === 'es' ? $firstExp->title_es : $firstExp->title_en) : null,
            'description' => $loc->getLocalizedDescription($lang),
            'address' => $loc->address,
            'image' => $this->imageUrl($loc->image),
            'hero_image' => $this->imageUrl($firstExp?->hero_image ?? $loc->image),
            'gallery' => $loc->images->map(fn ($img) => $this->imageUrl($img->image))->values()->toArray(),
            'availability_type' => $loc->availability_type,
            'price' => $firstExp
                ? (float) $firstExp->price
                : null,
            'features' => $firstExp
                ? $firstExp->features->map(fn ($f) => $lang === 'es' ? ($f->feature_es ?: $f->feature_en) : $f->feature_en)->filter()->values()
                : [],
            'schedules' => $loc->schedules->where('is_active', true)->map(fn ($s) => [
                'day_of_week' => $s->day_of_week,
                'start_time' => $s->start_time,
                'end_time' => $s->end_time,
            ])->values(),
        ];

        if ($includeExperiences && $loc->relationLoaded('experiences')) {
            $data['experiences'] = $loc->experiences->where('is_active', true)->map(fn ($exp) => [
                'id' => $exp->id,
                'title' => $lang === 'es' ? $exp->title_es : $exp->title_en,
                'price' => (float) $exp->price,
                'duration' => $exp->duration,
                'hero_image' => $this->imageUrl($exp->hero_image),
            ])->values();
        }

        return $data;
    }
}
