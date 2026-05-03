<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\JoinLanguageRequest;
use App\Models\LanguageSession;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LanguageSessionController extends Controller
{
    /**
     * GET /api/languages — list active language sessions
     */
    public function index(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $sessions = LanguageSession::active()
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($s) => [
                'id'            => $s->id,
                'title'         => $s->getTitle($lang),
                'description'   => $s->getDescription($lang),
                'language_type' => $s->language_type,
                'skill_level'   => $s->skill_level,
            ]);

        return response()->json([
            'success' => true,
            'data'    => $sessions,
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
