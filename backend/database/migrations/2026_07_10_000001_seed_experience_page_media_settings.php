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
                ['key' => 'experience_city_image', 'value' => 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=800&auto=format&fit=crop', 'group' => 'general'],
                ['key' => 'experience_city_icon', 'value' => '🏙️', 'group' => 'general'],
                ['key' => 'experience_country_image', 'value' => 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=800&auto=format&fit=crop', 'group' => 'general'],
                ['key' => 'experience_country_icon', 'value' => '🌿', 'group' => 'general'],
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
                'experience_city_image', 'experience_city_icon',
                'experience_country_image', 'experience_country_icon',
            ];
            Setting::whereIn('key', $keys)->delete();
        }
    }
};
