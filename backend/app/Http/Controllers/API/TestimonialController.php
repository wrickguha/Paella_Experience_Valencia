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
                'review' => $lang === 'es' ? $t->review_es : $t->review_en,
                'rating' => $t->rating,
                'avatar' => $t->avatar,
            ]);

        return response()->json([
            'success' => true,
            'data' => $testimonials,
        ]);
    }
}
