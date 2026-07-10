<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('settings')) {
            $settings = [
                // Community Vision highlights icons
                ['key' => 'about_vision_highlight1_icon', 'value' => 'users', 'group' => 'general'],
                ['key' => 'about_vision_highlight2_icon', 'value' => 'heart', 'group' => 'general'],
                ['key' => 'about_vision_highlight3_icon', 'value' => 'globe', 'group' => 'general'],

                // Language & Culture points icons
                ['key' => 'about_language_point1_icon', 'value' => 'message', 'group' => 'general'],
                ['key' => 'about_language_point2_icon', 'value' => 'zap', 'group' => 'general'],
                ['key' => 'about_language_point3_icon', 'value' => 'globe', 'group' => 'general'],

                // Differentiators items icons
                ['key' => 'about_different_item1_icon', 'value' => 'users', 'group' => 'general'],
                ['key' => 'about_different_item2_icon', 'value' => 'star', 'group' => 'general'],
                ['key' => 'about_different_item3_icon', 'value' => 'heart', 'group' => 'general'],
            ];

            foreach ($settings as $s) {
                Setting::updateOrCreate(
                    ['key' => $s['key']],
                    ['value' => $s['value'], 'group' => $s['group']]
                );
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('settings')) {
            $keys = [
                'about_vision_highlight1_icon', 'about_vision_highlight2_icon', 'about_vision_highlight3_icon',
                'about_language_point1_icon', 'about_language_point2_icon', 'about_language_point3_icon',
                'about_different_item1_icon', 'about_different_item2_icon', 'about_different_item3_icon',
            ];
            Setting::whereIn('key', $keys)->delete();
        }
    }
};
