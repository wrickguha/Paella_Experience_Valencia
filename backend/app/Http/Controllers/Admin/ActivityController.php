<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(): JsonResponse
    {
        $activities = Activity::orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data'    => $activities,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title_en'       => 'required|string|max:255',
            'title_es'       => 'required|string|max:255',
            'description_en' => 'nullable|string|max:2000',
            'description_es' => 'nullable|string|max:2000',
            'icon'           => 'nullable|string|max:50',
            'is_active'      => 'boolean',
            'sort_order'     => 'integer',
        ]);

        $activity = Activity::create($validated);

        return response()->json([
            'success' => true,
            'data'    => $activity,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);

        $validated = $request->validate([
            'title_en'       => 'sometimes|string|max:255',
            'title_es'       => 'sometimes|string|max:255',
            'description_en' => 'nullable|string|max:2000',
            'description_es' => 'nullable|string|max:2000',
            'icon'           => 'nullable|string|max:50',
            'is_active'      => 'boolean',
            'sort_order'     => 'integer',
        ]);

        $activity->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $activity->fresh(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        Activity::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Activity deleted.',
        ]);
    }
}
