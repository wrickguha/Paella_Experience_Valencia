<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

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
        // Handle file uploads in settings
        foreach ($request->files->all() as $key => $file) {
            if ($request->hasFile($key) && $request->file($key)->isValid()) {
                $oldSetting = Setting::where('key', $key)->first();
                if ($oldSetting && $oldSetting->value && !str_starts_with($oldSetting->value, 'http') && !str_starts_with($oldSetting->value, 'video/')) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($oldSetting->value);
                }
                $path = $request->file($key)->store('settings', 'public');
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $path]
                );
            }
        }

        // Handle string settings
        $settings = $request->input('settings');
        if ($settings) {
            if (is_string($settings)) {
                $settings = json_decode($settings, true);
            }
            if (is_array($settings)) {
                foreach ($settings as $key => $value) {
                    if ($request->hasFile($key)) {
                        continue;
                    }
                    Setting::updateOrCreate(
                        ['key' => $key],
                        ['value' => $value ?? '']
                    );
                }
            }
        } else {
            // Support flat key/value pairs
            $settings = $request->except(['_token', '_method']);
            foreach ($settings as $key => $value) {
                if (is_string($key) && !$request->hasFile($key)) {
                    Setting::updateOrCreate(
                        ['key' => $key],
                        ['value' => $value ?? '']
                    );
                }
            }
        }

        // Clear public settings cache so frontend sees changes immediately
        Cache::forget('settings_public_all');
        Cache::forget('settings_public_general');
        Cache::forget('settings_public_contact');
        Cache::forget('settings_public_social');
        Cache::forget('settings_public_footer');
        Cache::forget('settings_public_stats');
        Cache::forget('settings_public_typography');
        Cache::forget('settings_all'); // flush the global model cache too

        return response()->json(['message' => 'Settings updated']);
    }
}
