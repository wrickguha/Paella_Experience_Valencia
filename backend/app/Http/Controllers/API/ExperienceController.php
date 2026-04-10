<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $experiences = Experience::active()
            ->with(['location', 'features'])
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($exp) => $this->formatExperience($exp, $lang));

        return response()->json([
            'success' => true,
            'data' => $experiences,
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $experience = Experience::with(['location', 'features'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $this->formatExperience($experience, $lang),
        ]);
    }

    private function formatExperience(Experience $exp, string $lang): array
    {
        return [
            'id' => $exp->id,
            'title' => $lang === 'es' ? $exp->title_es : $exp->title_en,
            'description' => $lang === 'es' ? $exp->description_es : $exp->description_en,
            'hero_image' => $exp->hero_image,
            'price' => (float) $exp->price,
            'duration' => $exp->duration,
            'is_active' => $exp->is_active,
            'sort_order' => $exp->sort_order,
            'location' => $exp->location ? [
                'id' => $exp->location->id,
                'name' => $exp->location->getLocalizedName($lang),
                'address' => $exp->location->address,
                'image' => $exp->location->image,
            ] : null,
            'features' => $exp->features->map(fn ($f) => [
                'id' => $f->id,
                'feature' => $lang === 'es' ? $f->feature_es : $f->feature_en,
            ])->values(),
        ];
    }
}
