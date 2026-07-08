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
                // Intro Section
                ['key' => 'experience_intro_title_en', 'value' => 'Experiences & Locations', 'group' => 'general'],
                ['key' => 'experience_intro_title_es', 'value' => 'Experiencias y Lugares', 'group' => 'general'],
                ['key' => 'experience_intro_desc1_en', 'value' => 'At Speak Easy Valencia, the experience is not only about the language. It’s also about where it happens.', 'group' => 'general'],
                ['key' => 'experience_intro_desc1_es', 'value' => 'En Speak Easy Valencia, la experiencia no consiste únicamente en el idioma. También se trata de dónde ocurre.', 'group' => 'general'],
                ['key' => 'experience_intro_desc2_en', 'value' => 'We carefully choose places that invite people to slow down, connect naturally, and experience the way of life through conversation, food, culture, and sobremesa.', 'group' => 'general'],
                ['key' => 'experience_intro_desc2_es', 'value' => 'Elegimos con cuidado lugares que invitan a bajar el ritmo, conectar de forma natural y vivir el estilo de vida a través de la conversación, la comida, la cultura y la sobremesa.', 'group' => 'general'],

                // Category Selection Cards
                ['key' => 'experience_city_title_en', 'value' => 'City Experiences', 'group' => 'general'],
                ['key' => 'experience_city_title_es', 'value' => 'Experiencias en la Ciudad', 'group' => 'general'],
                ['key' => 'experience_city_desc_en', 'value' => 'Immersion in urban cooking studios, historical venues, and local life', 'group' => 'general'],
                ['key' => 'experience_city_desc_es', 'value' => 'Inmersión en estudios de cocina urbanos, lugares históricos y vida local', 'group' => 'general'],

                ['key' => 'experience_country_title_en', 'value' => 'Countryside Experiences', 'group' => 'general'],
                ['key' => 'experience_country_title_es', 'value' => 'Experiencias en el Campo', 'group' => 'general'],
                ['key' => 'experience_country_desc_en', 'value' => 'Gatherings in quiet fincas, surrounded by nature and orange groves', 'group' => 'general'],
                ['key' => 'experience_country_desc_es', 'value' => 'Reuniones en fincas tranquilas, rodeadas de naturaleza y campos de naranjos', 'group' => 'general'],

                // Stage 1 Back Button
                ['key' => 'experience_back_btn_en', 'value' => 'Back', 'group' => 'general'],
                ['key' => 'experience_back_btn_es', 'value' => 'Atrás', 'group' => 'general'],

                // Stage 2 Details CTA
                ['key' => 'experience_cta_btn_en', 'value' => 'Save your seat at the table', 'group' => 'general'],
                ['key' => 'experience_cta_btn_es', 'value' => 'Reserva tu sitio en la mesa', 'group' => 'general'],
                ['key' => 'experience_unavailable_btn_en', 'value' => 'Booking Unavailable', 'group' => 'general'],
                ['key' => 'experience_unavailable_btn_es', 'value' => 'Reserva No Disponible', 'group' => 'general'],
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
                'experience_intro_title_en', 'experience_intro_title_es',
                'experience_intro_desc1_en', 'experience_intro_desc1_es',
                'experience_intro_desc2_en', 'experience_intro_desc2_es',
                'experience_city_title_en', 'experience_city_title_es',
                'experience_city_desc_en', 'experience_city_desc_es',
                'experience_country_title_en', 'experience_country_title_es',
                'experience_country_desc_en', 'experience_country_desc_es',
                'experience_back_btn_en', 'experience_back_btn_es',
                'experience_cta_btn_en', 'experience_cta_btn_es',
                'experience_unavailable_btn_en', 'experience_unavailable_btn_es'
            ];
            Setting::whereIn('key', $keys)->delete();
        }
    }
};
