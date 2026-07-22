<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $group = $request->query('group');

        $query = Setting::query();
        if ($group) {
            $query->where(function ($q) use ($group) {
                $q->where('group', $group)
                  ->orWhereNull('group');
            });
        }
        $settings = $query->pluck('value', 'key');

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }
}
