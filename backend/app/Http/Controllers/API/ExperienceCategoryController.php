<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ExperienceCategory;
use Illuminate\Http\Request;

class ExperienceCategoryController extends Controller
{
    public function index(Request $request)
    {
        $lang = $request->query('lang', 'en');
        $categories = ExperienceCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (ExperienceCategory $category) => [
                'id' => $category->id,
                'slug' => $category->slug,
                'name' => $category->getName($lang),
                'name_en' => $category->name_en,
                'name_es' => $category->name_es,
                'sort_order' => $category->sort_order,
            ]);

        return response()->json(['success' => true, 'data' => $categories]);
    }
}
