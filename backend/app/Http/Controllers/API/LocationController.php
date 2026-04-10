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
                ->with(['schedules', 'experiences'])
                ->get()
                ->map(fn ($loc) => $this->formatLocation($loc, $lang));
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

    private function formatLocation(Location $loc, string $lang, bool $includeExperiences = false): array
    {
        $data = [
            'id' => $loc->id,
            'name' => $loc->getLocalizedName($lang),
            'description' => $loc->getLocalizedDescription($lang),
            'address' => $loc->address,
            'image' => $loc->image,
            'availability_type' => $loc->availability_type,
            'price' => $loc->experiences->where('is_active', true)->sortBy('sort_order')->first()?->price
                ? (float) $loc->experiences->where('is_active', true)->sortBy('sort_order')->first()->price
                : null,
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
                'hero_image' => $exp->hero_image,
            ])->values();
        }

        return $data;
    }
}
