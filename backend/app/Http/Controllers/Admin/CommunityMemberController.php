<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommunityMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunityMemberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CommunityMember::latest('joined_at');

        if ($request->has('featured')) {
            $query->where('is_featured', $request->boolean('featured'));
        }

        $members = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $members,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $member = CommunityMember::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'bio'         => 'nullable|string|max:1000',
            'country'     => 'nullable|string|max:100',
            'is_featured' => 'boolean',
        ]);

        $member->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $member->fresh(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        CommunityMember::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Community member removed.',
        ]);
    }
}
