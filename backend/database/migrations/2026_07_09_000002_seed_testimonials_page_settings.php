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
                ['key' => 'testimonials_hero_script_en', 'value' => 'Sobremesa', 'group' => 'general'],
                ['key' => 'testimonials_hero_script_es', 'value' => 'Sobremesa', 'group' => 'general'],
                ['key' => 'testimonials_hero_title_en', 'value' => 'Stories From the Table', 'group' => 'general'],
                ['key' => 'testimonials_hero_title_es', 'value' => 'Historias Desde la Mesa', 'group' => 'general'],
                ['key' => 'testimonials_hero_subtitle_en', 'value' => 'Hear from our guests who joined us in Valencia for food, language, and human connection.', 'group' => 'general'],
                ['key' => 'testimonials_hero_subtitle_es', 'value' => 'Escucha a nuestros huéspedes que se unieron a nosotros en Valencia para disfrutar de la comida, el idioma y la conexión humana.', 'group' => 'general'],
                ['key' => 'testimonials_rating_summary_en', 'value' => '5.0 out of 5 based on 1,200+ global guest reviews', 'group' => 'general'],
                ['key' => 'testimonials_rating_summary_es', 'value' => '5.0 de 5 basado en más de 1.200 opiniones globales de huéspedes', 'group' => 'general'],

                // Video / Written Section
                ['key' => 'testimonials_video_title_en', 'value' => 'Guest Stories', 'group' => 'general'],
                ['key' => 'testimonials_video_title_es', 'value' => 'Historias de los Huéspedes', 'group' => 'general'],
                ['key' => 'testimonials_written_title_en', 'value' => 'Guest Reviews', 'group' => 'general'],
                ['key' => 'testimonials_written_title_es', 'value' => 'Opiniones de los Huéspedes', 'group' => 'general'],
                ['key' => 'testimonials_written_subtitle_en', 'value' => 'Real thoughts from people who sat at the table with us in Valencia.', 'group' => 'general'],
                ['key' => 'testimonials_written_subtitle_es', 'value' => 'Opiniones reales de personas que se sentaron a la mesa con nosotros en Valencia.', 'group' => 'general'],

                // Form Section
                ['key' => 'testimonials_form_title_en', 'value' => 'Share Your Story', 'group' => 'general'],
                ['key' => 'testimonials_form_title_es', 'value' => 'Comparte Tu Historia', 'group' => 'general'],
                ['key' => 'testimonials_form_subtitle_en', 'value' => 'Sit down with us and tell us about your experience.', 'group' => 'general'],
                ['key' => 'testimonials_form_subtitle_es', 'value' => 'Siéntate con nosotros y cuéntanos tu experiencia.', 'group' => 'general'],
                ['key' => 'testimonials_form_success_en', 'value' => 'Your review has been submitted successfully and is currently under moderation.', 'group' => 'general'],
                ['key' => 'testimonials_form_success_es', 'value' => 'Tu opinión ha sido enviada con éxito y se encuentra actualmente bajo moderación.', 'group' => 'general'],
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
                'testimonials_hero_script_en', 'testimonials_hero_script_es',
                'testimonials_hero_title_en', 'testimonials_hero_title_es',
                'testimonials_hero_subtitle_en', 'testimonials_hero_subtitle_es',
                'testimonials_rating_summary_en', 'testimonials_rating_summary_es',
                'testimonials_video_title_en', 'testimonials_video_title_es',
                'testimonials_written_title_en', 'testimonials_written_title_es',
                'testimonials_written_subtitle_en', 'testimonials_written_subtitle_es',
                'testimonials_form_title_en', 'testimonials_form_title_es',
                'testimonials_form_subtitle_en', 'testimonials_form_subtitle_es',
                'testimonials_form_success_en', 'testimonials_form_success_es'
            ];
            Setting::whereIn('key', $keys)->delete();
        }
    }
};
