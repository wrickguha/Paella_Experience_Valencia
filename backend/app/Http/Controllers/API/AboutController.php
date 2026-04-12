<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AboutSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AboutController extends Controller
{
    private function imageUrl(?string $path): ?string
    {
        if (!$path) return null;
        return str_starts_with($path, 'http') ? $path : asset('storage/' . $path);
    }

    public function index(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $sections = AboutSection::active()
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($s) => $this->formatSection($s, $lang));

        // Group by section_key for structured response
        $grouped = [];
        foreach ($sections as $section) {
            $key = $section['section_key'];
            if (isset($grouped[$key])) {
                // Multiple items with same key → make it an array
                if (!isset($grouped[$key][0])) {
                    $grouped[$key] = [$grouped[$key]];
                }
                $grouped[$key][] = $section;
            } else {
                $grouped[$key] = $section;
            }
        }

        return response()->json([
            'success' => true,
            'data' => $grouped,
        ]);
    }

    private function formatSection(AboutSection $s, string $lang): array
    {
        return [
            'id' => $s->id,
            'section_key' => $s->section_key,
            'title' => $lang === 'es' ? ($s->title_es ?: $s->title_en) : $s->title_en,
            'subtitle' => $lang === 'es' ? ($s->subtitle_es ?: $s->subtitle_en) : $s->subtitle_en,
            'content' => $lang === 'es' ? ($s->content_es ?: $s->content_en) : $s->content_en,
            'image' => $this->imageUrl($s->image),
            'cta_text' => $lang === 'es' ? ($s->cta_text_es ?: $s->cta_text_en) : $s->cta_text_en,
            'cta_link' => $s->cta_link,
            'sort_order' => $s->sort_order,
        ];
    }
}
