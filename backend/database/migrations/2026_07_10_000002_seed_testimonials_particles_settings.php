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
                ['key' => 'testimonials_particle_1', 'value' => '🥘', 'group' => 'general'],
                ['key' => 'testimonials_particle_2', 'value' => '🍷', 'group' => 'general'],
                ['key' => 'testimonials_particle_3', 'value' => '✨', 'group' => 'general'],
                ['key' => 'testimonials_particle_4', 'value' => '🍊', 'group' => 'general'],
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
                'testimonials_particle_1', 'testimonials_particle_2',
                'testimonials_particle_3', 'testimonials_particle_4',
            ];
            Setting::whereIn('key', $keys)->delete();
        }
    }
};
