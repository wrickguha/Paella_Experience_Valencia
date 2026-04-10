<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        $query = Setting::query();

        if ($request->filled('group')) {
            $query->where('group', $request->group);
        }

        return response()->json($query->get());
    }

    public function update(Request $request)
    {
        // Accept either { settings: {k:v} } (from frontend) or flat k/v
        $settings = $request->has('settings')
            ? $request->input('settings')
            : $request->except(['_token', '_method']);

        if (!is_array($settings)) {
            return response()->json(['message' => 'Invalid settings format'], 422);
        }

        foreach ($settings as $key => $value) {
            if (is_string($key)) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value ?? '']
                );
            }
        }

        return response()->json(['message' => 'Settings updated']);
    }
}
