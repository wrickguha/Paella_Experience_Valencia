<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FaqController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $faqs = Cache::remember("faqs_{$lang}", 3600, function () use ($lang) {
            return Faq::active()
                ->orderBy('sort_order')
                ->get()
                ->map(fn ($faq) => [
                    'id' => $faq->id,
                    'question' => $lang === 'es' ? $faq->question_es : $faq->question_en,
                    'answer' => $lang === 'es' ? $faq->answer_es : $faq->answer_en,
                ]);
        });

        return response()->json([
            'success' => true,
            'data' => $faqs,
        ]);
    }
}
