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
                // Hero Section
                ['key' => 'langtests_hero_title_en', 'value' => 'Language Level Tests', 'group' => 'general'],
                ['key' => 'langtests_hero_title_es', 'value' => 'Pruebas de Nivel', 'group' => 'general'],
                ['key' => 'langtests_hero_subtitle_en', 'value' => 'Language Level Tests', 'group' => 'general'],
                ['key' => 'langtests_hero_subtitle_es', 'value' => 'Pruebas de Nivel', 'group' => 'general'],
                ['key' => 'langtests_hero_desc_en', 'value' => 'Discover your Spanish or English level with our carefully designed tests — we meet you where you are and take you further.', 'group' => 'general'],
                ['key' => 'langtests_hero_desc_es', 'value' => 'Descubre tu nivel de español o inglés con nuestras pruebas diseñadas para encontrarte donde estás y llevarte más lejos.', 'group' => 'general'],
                ['key' => 'langtests_hero_primary_cta_en', 'value' => 'Explore the Tests', 'group' => 'general'],
                ['key' => 'langtests_hero_primary_cta_es', 'value' => 'Ver las pruebas', 'group' => 'general'],
                ['key' => 'langtests_hero_secondary_cta_en', 'value' => 'Book an Experience', 'group' => 'general'],
                ['key' => 'langtests_hero_secondary_cta_es', 'value' => 'Reservar una experiencia', 'group' => 'general'],
                ['key' => 'langtests_hero_emojis', 'value' => '🇪🇸,🇬🇧,🗣️,🎧,📖,✍️', 'group' => 'general'],

                // Info Strip Section
                ['key' => 'langtests_info1_icon', 'value' => '🎧', 'group' => 'general'],
                ['key' => 'langtests_info1_text_en', 'value' => 'Audio Introduction', 'group' => 'general'],
                ['key' => 'langtests_info1_text_es', 'value' => 'Introducción en audio', 'group' => 'general'],

                ['key' => 'langtests_info2_icon', 'value' => '📊', 'group' => 'general'],
                ['key' => 'langtests_info2_text_en', 'value' => 'By Skill Level', 'group' => 'general'],
                ['key' => 'langtests_info2_text_es', 'value' => 'Por nivel de habilidad', 'group' => 'general'],

                ['key' => 'langtests_info3_icon', 'value' => '🌐', 'group' => 'general'],
                ['key' => 'langtests_info3_text_en', 'value' => 'Spanish & English', 'group' => 'general'],
                ['key' => 'langtests_info3_text_es', 'value' => 'Español & Inglés', 'group' => 'general'],

                ['key' => 'langtests_info4_icon', 'value' => '🆓', 'group' => 'general'],
                ['key' => 'langtests_info4_text_en', 'value' => 'Completely Free', 'group' => 'general'],
                ['key' => 'langtests_info4_text_es', 'value' => 'Totalmente gratuito', 'group' => 'general'],

                // How It Works Section
                ['key' => 'langtests_works_title_en', 'value' => 'How Do the Tests Work?', 'group' => 'general'],
                ['key' => 'langtests_works_title_es', 'value' => '¿Cómo funcionan las pruebas?', 'group' => 'general'],

                ['key' => 'langtests_works1_icon', 'value' => '🎧', 'group' => 'general'],
                ['key' => 'langtests_works1_title_en', 'value' => 'Listen to audio', 'group' => 'general'],
                ['key' => 'langtests_works1_title_es', 'value' => 'Escucha el audio', 'group' => 'general'],
                ['key' => 'langtests_works1_desc_en', 'value' => 'Each test has an audio introduction to evaluate your listening comprehension.', 'group' => 'general'],
                ['key' => 'langtests_works1_desc_es', 'value' => 'Cada prueba tiene una introducción de audio para evaluar tu comprensión auditiva.', 'group' => 'general'],

                ['key' => 'langtests_works2_icon', 'value' => '📝', 'group' => 'general'],
                ['key' => 'langtests_works2_title_en', 'value' => 'Assess your level', 'group' => 'general'],
                ['key' => 'langtests_works2_title_es', 'value' => 'Evalúa tu nivel', 'group' => 'general'],
                ['key' => 'langtests_works2_desc_en', 'value' => 'Read each test description and determine which best describes your current abilities.', 'group' => 'general'],
                ['key' => 'langtests_works2_desc_es', 'value' => 'Lee la descripción de cada prueba y determina cuál describe mejor tus habilidades actuales.', 'group' => 'general'],

                ['key' => 'langtests_works3_icon', 'value' => '🚀', 'group' => 'general'],
                ['key' => 'langtests_works3_title_en', 'value' => 'Join us', 'group' => 'general'],
                ['key' => 'langtests_works3_title_es', 'value' => 'Únete a nosotros', 'group' => 'general'],
                ['key' => 'langtests_works3_desc_en', 'value' => 'Register and we\'ll match you with the perfect language session for your level.', 'group' => 'general'],
                ['key' => 'langtests_works3_desc_es', 'value' => 'Regístrate y te conectamos con la sesión de idiomas perfecta para tu nivel.', 'group' => 'general'],

                // CTA Section
                ['key' => 'langtests_cta_icon', 'value' => '🎓', 'group' => 'general'],
                ['key' => 'langtests_cta_title_en', 'value' => 'Want to discover your level?', 'group' => 'general'],
                ['key' => 'langtests_cta_title_es', 'value' => '¿Quieres descubrir tu nivel?', 'group' => 'general'],
                ['key' => 'langtests_cta_subtitle_en', 'value' => 'Leave your details and we\'ll help find the perfect programme for you.', 'group' => 'general'],
                ['key' => 'langtests_cta_subtitle_es', 'value' => 'Déjanos tus datos y te ayudamos a encontrar el programa perfecto para ti.', 'group' => 'general'],
                ['key' => 'langtests_cta_success_title_en', 'value' => 'Received! We\'ll be in touch.', 'group' => 'general'],
                ['key' => 'langtests_cta_success_title_es', 'value' => '¡Recibido! Nos ponemos en contacto.', 'group' => 'general'],
                ['key' => 'langtests_cta_success_desc_en', 'value' => 'Thank you for your interest in our level tests.', 'group' => 'general'],
                ['key' => 'langtests_cta_success_desc_es', 'value' => 'Gracias por tu interés en nuestras pruebas de nivel.', 'group' => 'general'],
                ['key' => 'langtests_cta_submit_en', 'value' => 'I want to take a level test', 'group' => 'general'],
                ['key' => 'langtests_cta_submit_es', 'value' => 'Quiero hacer mi prueba de nivel', 'group' => 'general'],
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
                'langtests_hero_title_en', 'langtests_hero_title_es',
                'langtests_hero_subtitle_en', 'langtests_hero_subtitle_es',
                'langtests_hero_desc_en', 'langtests_hero_desc_es',
                'langtests_hero_primary_cta_en', 'langtests_hero_primary_cta_es',
                'langtests_hero_secondary_cta_en', 'langtests_hero_secondary_cta_es',
                'langtests_hero_emojis',
                'langtests_info1_icon', 'langtests_info1_text_en', 'langtests_info1_text_es',
                'langtests_info2_icon', 'langtests_info2_text_en', 'langtests_info2_text_es',
                'langtests_info3_icon', 'langtests_info3_text_en', 'langtests_info3_text_es',
                'langtests_info4_icon', 'langtests_info4_text_en', 'langtests_info4_text_es',
                'langtests_works_title_en', 'langtests_works_title_es',
                'langtests_works1_icon', 'langtests_works1_title_en', 'langtests_works1_title_es', 'langtests_works1_desc_en', 'langtests_works1_desc_es',
                'langtests_works2_icon', 'langtests_works2_title_en', 'langtests_works2_title_es', 'langtests_works2_desc_en', 'langtests_works2_desc_es',
                'langtests_works3_icon', 'langtests_works3_title_en', 'langtests_works3_title_es', 'langtests_works3_desc_en', 'langtests_works3_desc_es',
                'langtests_cta_icon', 'langtests_cta_title_en', 'langtests_cta_title_es',
                'langtests_cta_subtitle_en', 'langtests_cta_subtitle_es',
                'langtests_cta_success_title_en', 'langtests_cta_success_title_es',
                'langtests_cta_success_desc_en', 'langtests_cta_success_desc_es',
                'langtests_cta_submit_en', 'langtests_cta_submit_es'
            ];
            Setting::whereIn('key', $keys)->delete();
        }
    }
};
