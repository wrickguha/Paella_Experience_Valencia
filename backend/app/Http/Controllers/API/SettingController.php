<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $group = $request->query('group');

        $settings = Cache::remember('settings_public_' . ($group ?? 'all'), 3600, function () use ($group) {
            $query = Setting::query();
            if ($group) {
                $query->where('group', $group);
            }
            return $query->pluck('value', 'key');
        });

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }
}
