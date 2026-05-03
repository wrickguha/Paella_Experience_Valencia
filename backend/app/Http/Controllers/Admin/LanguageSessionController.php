<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LanguageSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LanguageSessionController extends Controller
{
    public function index(): JsonResponse
    {
        $sessions = LanguageSession::orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data'    => $sessions,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title_en'       => 'required|string|max:255',
            'title_es'       => 'required|string|max:255',
            'description_en' => 'nullable|string|max:2000',
            'description_es' => 'nullable|string|max:2000',
            'language_type'  => 'required|in:spanish,english,both',
            'skill_level'    => 'nullable|in:beginner,intermediate,advanced',
            'is_active'      => 'boolean',
            'sort_order'     => 'integer',
        ]);

        $session = LanguageSession::create($validated);

        return response()->json([
            'success' => true,
            'data'    => $session,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $session = LanguageSession::findOrFail($id);

        $validated = $request->validate([
            'title_en'       => 'sometimes|string|max:255',
            'title_es'       => 'sometimes|string|max:255',
            'description_en' => 'nullable|string|max:2000',
            'description_es' => 'nullable|string|max:2000',
            'language_type'  => 'sometimes|in:spanish,english,both',
            'skill_level'    => 'nullable|in:beginner,intermediate,advanced',
            'is_active'      => 'boolean',
            'sort_order'     => 'integer',
        ]);

        $session->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $session->fresh(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        LanguageSession::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Language session deleted.',
        ]);
    }
}
