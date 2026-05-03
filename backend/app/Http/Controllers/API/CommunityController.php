<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\JoinCommunityRequest;
use App\Models\CommunityMember;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    /**
     * GET /api/community — list featured community members
     */
    public function index(Request $request): JsonResponse
    {
        $members = CommunityMember::featured()
            ->latest('joined_at')
            ->take(20)
            ->get()
            ->map(fn ($m) => [
                'id'        => $m->id,
                'name'      => $m->name,
                'bio'       => $m->bio,
                'avatar'    => $m->avatar,
                'country'   => $m->country,
                'joined_at' => $m->joined_at?->toDateString(),
            ]);

        return response()->json([
            'success' => true,
            'data'    => $members,
        ]);
    }

    /**
     * POST /api/community/join — register community interest
     */
    public function join(JoinCommunityRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Upsert community member (avoid duplicates by email)
        $member = CommunityMember::updateOrCreate(
            ['email' => $data['email']],
            [
                'name'    => $data['name'],
                'bio'     => $data['bio'] ?? null,
                'country' => $data['country'] ?? null,
                'user_id' => $request->user()?->id,
            ]
        );

        // Track as lead
        Lead::create([
            'source' => 'community_join',
            'name'   => $data['name'],
            'email'  => $data['email'],
            'phone'  => $data['phone'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Welcome to the community!',
            'data'    => [
                'id'   => $member->id,
                'name' => $member->name,
            ],
        ], 201);
    }
}
