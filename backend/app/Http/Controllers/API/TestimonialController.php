<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $testimonials = Testimonial::active()
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'location' => $t->location_label,
                'review' => $lang === 'es' ? ($t->review_es ?: $t->review_en) : ($t->review_en ?: $t->review_es),
                'rating' => $t->rating,
                'avatar' => $t->avatar,
            ]);

        return response()->json([
            'success' => true,
            'data' => $testimonials,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'review' => ['required', 'string'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $minOrder = Testimonial::min('sort_order') ?? 0;

        $testimonial = Testimonial::create([
            'name' => $validated['name'],
            'location_label' => !empty($validated['location']) ? $validated['location'] : 'Valencia, ES',
            'review_en' => $validated['review'],
            'review_es' => $validated['review'],
            'rating' => (int) $validated['rating'],
            'is_active' => true,
            'sort_order' => $minOrder - 1,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $testimonial->id,
                'name' => $testimonial->name,
                'location' => $testimonial->location_label,
                'review' => $testimonial->review_en,
                'rating' => $testimonial->rating,
                'avatar' => $testimonial->avatar,
            ],
        ], 201);
    }
}
