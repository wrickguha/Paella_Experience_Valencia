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
                ['key' => 'hero_tagline_en', 'value' => 'Speak. Cook. Connect', 'group' => 'general'],
                ['key' => 'hero_tagline_es', 'value' => 'Habla. Cocina. Conecta', 'group' => 'general'],
            ];

            foreach ($settings as $s) {
                Setting::updateOrCreate(['key' => $s['key']], $s);
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('settings')) {
            Setting::whereIn('key', ['hero_tagline_en', 'hero_tagline_es'])->delete();
        }
    }
};
