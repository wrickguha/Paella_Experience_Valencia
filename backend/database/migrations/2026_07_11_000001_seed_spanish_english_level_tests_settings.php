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
                // Spanish Test Card
                ['key' => 'spanishTest_title_en', 'value' => 'Discover Your Spanish Level', 'group' => 'general'],
                ['key' => 'spanishTest_title_es', 'value' => 'Descubre tu nivel de español', 'group' => 'general'],
                ['key' => 'spanishTest_subtitle_en', 'value' => 'Our experiences are designed for different levels of confidence and immersion. This quick placement test helps us recommend the most comfortable and enjoyable experience for you.', 'group' => 'general'],
                ['key' => 'spanishTest_subtitle_es', 'value' => 'Nuestras experiencias están diseñadas para diferentes niveles de confianza e inmersión. Esta prueba rápida nos ayuda a recomendarte la experiencia más adecuada para ti.', 'group' => 'general'],

                // English Test Card
                ['key' => 'englishTest_title_en', 'value' => 'Discover Your English Level', 'group' => 'general'],
                ['key' => 'englishTest_title_es', 'value' => 'Descubre tu nivel de inglés', 'group' => 'general'],
                ['key' => 'englishTest_subtitle_en', 'value' => "Choose the best answer. Don't guess too much—answer honestly. The test takes about 10 minutes.", 'group' => 'general'],
                ['key' => 'englishTest_subtitle_es', 'value' => 'Elige la mejor respuesta. Responde con honestidad y sin adivinar. La prueba dura unos 10 minutos.', 'group' => 'general'],
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
                'spanishTest_title_en', 'spanishTest_title_es',
                'spanishTest_subtitle_en', 'spanishTest_subtitle_es',
                'englishTest_title_en', 'englishTest_title_es',
                'englishTest_subtitle_en', 'englishTest_subtitle_es',
            ];
            Setting::whereIn('key', $keys)->delete();
        }
    }
};
