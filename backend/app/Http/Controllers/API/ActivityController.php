<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $lang = $request->query('lang', 'en');

        $activities = Activity::active()
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($a) => [
                'id'          => $a->id,
                'title'       => $a->getTitle($lang),
                'description' => $a->getDescription($lang),
                'icon'        => $a->icon,
            ]);

        return response()->json([
            'success' => true,
            'data'    => $activities,
        ]);
    }
}
