<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('settings')) {
            Setting::updateOrCreate(
                ['key' => 'hero_title_en'],
                [
                    'value' => 'Learn Languages by Living the Experience',
                    'group' => 'general'
                ]
            );

            Setting::updateOrCreate(
                ['key' => 'hero_title_es'],
                [
                    'value' => 'La Auténtica Experiencia de SpeakEasy',
                    'group' => 'general'
                ]
            );

            Setting::updateOrCreate(
                ['key' => 'hero_subtitle_en'],
                [
                    'value' => 'Experience Language through food, conversation, culture, and warm pueblo-style gatherings where people from around the world connect through language and shared moments.',
                    'group' => 'general'
                ]
            );

            Setting::updateOrCreate(
                ['key' => 'hero_subtitle_es'],
                [
                    'value' => 'Cocina, Aprende y Saborea en el Corazón de Valencia',
                    'group' => 'general'
                ]
            );
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('settings')) {
            Setting::whereIn('key', [
                'hero_title_en',
                'hero_title_es',
                'hero_subtitle_en',
                'hero_subtitle_es'
            ])->delete();
        }
    }
};
