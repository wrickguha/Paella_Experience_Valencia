<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExperienceCategory;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExperienceCategoryController extends Controller
{
    public static function getSettingPrefix(ExperienceCategory $category): string
    {
        if ($category->slug === 'city') {
            return 'experience_city';
        }
        if ($category->slug === 'countryside') {
            return 'experience_country';
        }
        $safeSlug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '_', $category->slug));
        return "experience_{$safeSlug}";
    }

    public static function seedCategorySettings(ExperienceCategory $category): void
    {
        $prefix = self::getSettingPrefix($category);
        $titleEn = $category->name_en ? "{$category->name_en} Experiences" : 'Experiences';
        $titleEs = $category->name_es ? "Experiencias de {$category->name_es}" : ($category->name_en ? "Experiencias de {$category->name_en}" : 'Experiencias');
        $defaultIcon = $category->slug === 'city' ? '🏙️' : ($category->slug === 'countryside' ? '🌿' : '📍');

        $initial = [
            "{$prefix}_title_en" => $titleEn,
            "{$prefix}_title_es" => $titleEs,
            "{$prefix}_desc_en" => '',
            "{$prefix}_desc_es" => '',
            "{$prefix}_icon" => $defaultIcon,
            "{$prefix}_image" => '',
        ];

        foreach ($initial as $key => $val) {
            Setting::firstOrCreate(
                ['key' => $key],
                ['value' => $val, 'group' => 'general']
            );
        }

        Cache::forget('settings_public_all');
        Cache::forget('settings_public_general');
        Cache::forget('settings_all');
    }

    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => ExperienceCategory::withCount('locations')->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_es' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $baseSlug = Str::slug($data['name_en']) ?: 'category';
        $slug = $baseSlug;
        $suffix = 1;
        while (ExperienceCategory::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        $category = ExperienceCategory::create([
            ...$data,
            'slug' => $slug,
            'sort_order' => $data['sort_order'] ?? ((int) ExperienceCategory::max('sort_order') + 1),
            'is_active' => true,
        ]);

        self::seedCategorySettings($category);

        $this->clearLocationCache();

        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function update(Request $request, int $id)
    {
        $category = ExperienceCategory::findOrFail($id);
        $data = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_es' => 'nullable|string|max:255',
            'sort_order' => 'required|integer|min:0',
        ]);

        $category->update($data);
        $this->clearLocationCache();

        return response()->json(['success' => true, 'data' => $category]);
    }

    public function destroy(int $id)
    {
        $category = ExperienceCategory::findOrFail($id);
        if ($category->locations()->exists()) {
            return response()->json([
                'message' => 'Reassign this category’s locations before deleting the category.',
            ], 422);
        }

        $prefix = self::getSettingPrefix($category);
        $settingKeys = [
            "{$prefix}_title_en",
            "{$prefix}_title_es",
            "{$prefix}_desc_en",
            "{$prefix}_desc_es",
            "{$prefix}_icon",
            "{$prefix}_image",
        ];

        $imageSetting = Setting::where('key', "{$prefix}_image")->first();
        if ($imageSetting && $imageSetting->value && !str_starts_with($imageSetting->value, 'http')) {
            Storage::disk('public')->delete($imageSetting->value);
        }
        Setting::whereIn('key', $settingKeys)->delete();

        $category->delete();
        $this->clearLocationCache();
        Cache::forget('settings_public_all');
        Cache::forget('settings_public_general');
        Cache::forget('settings_all');

        return response()->json(['success' => true, 'message' => 'Category deleted.']);
    }

    private function clearLocationCache(): void
    {
        Cache::forget('locations_en');
        Cache::forget('locations_es');
    }
}

