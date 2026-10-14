<?php

use App\Http\Controllers\Admin\ExperienceCategoryController;
use App\Models\ExperienceCategory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('experience_categories') && Schema::hasTable('settings')) {
            $categories = ExperienceCategory::all();
            foreach ($categories as $category) {
                ExperienceCategoryController::seedCategorySettings($category);
            }
        }
    }

    public function down(): void
    {
        // Settings are preserved
    }
};
