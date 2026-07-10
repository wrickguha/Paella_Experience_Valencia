<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\JoinLanguageRequest;
use App\Models\LanguageSession;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LanguageSessionController extends Controller
{
    /**
     * GET /api/languages — list active language sessions (session type only)
     */
    public function index(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $sessions = LanguageSession::active()
            ->where('test_type', 'session')
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($s) => [
                'id'            => $s->id,
                'title'         => $s->getTitle($lang),
                'description'   => $s->getDescription($lang),
                'language_type' => $s->language_type,
                'skill_level'   => $s->skill_level,
                'audio_url'     => $s->audio_url ? Storage::url($s->audio_url) : null,
            ]);

        return response()->json([
            'success' => true,
            'data'    => $sessions,
        ]);
    }

    /**
     * GET /api/level-tests — list active level tests (pruebas de nivel)
     */
    public function levelTests(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $tests = LanguageSession::active()
            ->where('test_type', 'level_test')
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($s) => [
                'id'            => $s->id,
                'title'         => $s->getTitle($lang),
                'title_en'      => $s->title_en,
                'title_es'      => $s->title_es,
                'description'   => $s->getDescription($lang),
                'language_type' => $s->language_type,
                'skill_level'   => $s->skill_level,
                'audio_url'     => $s->audio_url ? Storage::url($s->audio_url) : null,
            ]);

        return response()->json([
            'success' => true,
            'data'    => $tests,
        ]);
    }

    /**
     * POST /api/language/join — register language learning interest
     */
    public function join(JoinLanguageRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Track as lead
        Lead::create([
            'source'   => 'language_join',
            'name'     => $data['name'],
            'email'    => $data['email'],
            'metadata' => [
                'language_type' => $data['language_type'],
                'skill_level'   => $data['skill_level'] ?? null,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thanks for your interest! We\'ll be in touch.',
        ], 201);
    }
}
