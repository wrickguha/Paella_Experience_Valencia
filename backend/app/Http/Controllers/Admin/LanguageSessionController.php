<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LanguageSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LanguageSessionController extends Controller
{
    public function index(): JsonResponse
    {
        $sessions = LanguageSession::orderBy('sort_order')->get()->map(function ($s) {
            return array_merge($s->toArray(), [
                'audio_url' => $s->audio_url ? Storage::url($s->audio_url) : null,
            ]);
        });

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
            'test_type'      => 'nullable|in:session,level_test',
            'audio'          => 'nullable|file|mimes:mp3,wav,m4a,ogg,webm|max:20480',
        ]);

        $audioPath = null;
        if ($request->hasFile('audio')) {
            $audioPath = $request->file('audio')->store('audio', 'public');
        }

        $session = LanguageSession::create([
            'title_en'       => $validated['title_en'],
            'title_es'       => $validated['title_es'],
            'description_en' => $validated['description_en'] ?? null,
            'description_es' => $validated['description_es'] ?? null,
            'language_type'  => $validated['language_type'],
            'skill_level'    => $validated['skill_level'] ?? null,
            'is_active'      => $validated['is_active'] ?? true,
            'sort_order'     => $validated['sort_order'] ?? 0,
            'test_type'      => $validated['test_type'] ?? 'session',
            'audio_url'      => $audioPath,
        ]);

        return response()->json([
            'success' => true,
            'data'    => array_merge($session->toArray(), [
                'audio_url' => $audioPath ? Storage::url($audioPath) : null,
            ]),
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
            'test_type'      => 'nullable|in:session,level_test',
            'audio'          => 'nullable|file|mimes:mp3,wav,m4a,ogg,webm|max:20480',
            'remove_audio'   => 'nullable|boolean',
        ]);

        // Handle audio removal
        if (!empty($validated['remove_audio']) && $session->audio_url) {
            Storage::disk('public')->delete($session->audio_url);
            $session->audio_url = null;
        }

        // Handle new audio upload
        if ($request->hasFile('audio')) {
            // Delete old audio if exists
            if ($session->audio_url) {
                Storage::disk('public')->delete($session->audio_url);
            }
            $session->audio_url = $request->file('audio')->store('audio', 'public');
        }

        $session->fill(array_filter([
            'title_en'       => $validated['title_en'] ?? null,
            'title_es'       => $validated['title_es'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'description_es' => $validated['description_es'] ?? null,
            'language_type'  => $validated['language_type'] ?? null,
            'skill_level'    => $validated['skill_level'] ?? null,
            'is_active'      => $validated['is_active'] ?? null,
            'sort_order'     => $validated['sort_order'] ?? null,
            'test_type'      => $validated['test_type'] ?? null,
        ], fn($v) => $v !== null));

        $session->save();

        return response()->json([
            'success' => true,
            'data'    => array_merge($session->fresh()->toArray(), [
                'audio_url' => $session->audio_url ? Storage::url($session->audio_url) : null,
            ]),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $session = LanguageSession::findOrFail($id);

        // Clean up audio file
        if ($session->audio_url) {
            Storage::disk('public')->delete($session->audio_url);
        }

        $session->delete();

        return response()->json([
            'success' => true,
            'message' => 'Language session deleted.',
        ]);
    }
}
