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
                ['key' => 'about_hero_title_en', 'value' => 'More Than an Experience', 'group' => 'general'],
                ['key' => 'about_hero_title_es', 'value' => 'Más Que Una Experiencia', 'group' => 'general'],
                ['key' => 'about_hero_subtitle_en', 'value' => 'We bring people together through food, language, and shared moments.', 'group' => 'general'],
                ['key' => 'about_hero_subtitle_es', 'value' => 'Unimos a las personas a través de la comida, el idioma y momentos compartidos.', 'group' => 'general'],
                ['key' => 'about_hero_cta_en', 'value' => 'Join the Experience', 'group' => 'general'],
                ['key' => 'about_hero_cta_es', 'value' => 'Únete a la Experiencia', 'group' => 'general'],

                // Story Section
                ['key' => 'about_story_subtitle_en', 'value' => 'Born from Passion', 'group' => 'general'],
                ['key' => 'about_story_subtitle_es', 'value' => 'Nacida de la Pasión', 'group' => 'general'],
                ['key' => 'about_story_title_en', 'value' => 'The Story Behind SpeakEasy Valencia', 'group' => 'general'],
                ['key' => 'about_story_title_es', 'value' => 'Nuestra Historia', 'group' => 'general'],
                ['key' => 'about_story_content_en', 'value' => "SpeakEasy Valencia was created by Gene, who has spent more than 40 years in Valencia and has dedicated much of his life to teaching languages and bringing people together through culture and conversation.\n\nOver the years, he saw that people learn languages best not through pressure or memorisation, but through real human experiences - shared meals, storytelling, music, laughter, and meaningful conversations around the table.\n\nThat idea became the foundation of SpeakEasy Valencia: a place where people can experience Spanish naturally while feeling part of the warmth, rhythm, and culture of Mediterranean life.", 'group' => 'general'],
                ['key' => 'about_story_content_es', 'value' => "Todo empezó con una creencia sencilla: que la mejor manera de entender una cultura es sentarse a su mesa. Quisimos crear un espacio donde viajeros y locales pudieran conocerse, donde la presión de un aula se viera reemplazada por el calor de un fuego compartido, y donde los extraños se hicieran amigos frente a una SpeakEasy humeante.", 'group' => 'general'],
                ['key' => 'about_story_image', 'value' => 'assets/images/casa-magnolia/Chef Gene.jpg', 'group' => 'general'],

                // Vision Section
                ['key' => 'about_vision_subtitle_en', 'value' => 'Better Together', 'group' => 'general'],
                ['key' => 'about_vision_subtitle_es', 'value' => 'Mejor Juntos', 'group' => 'general'],
                ['key' => 'about_vision_title_en', 'value' => 'Community Vision', 'group' => 'general'],
                ['key' => 'about_vision_title_es', 'value' => 'Visión de Comunidad', 'group' => 'general'],
                ['key' => 'about_vision_content_en', 'value' => 'We believe experiences are better when shared. Our vision is to build a global community that celebrates diversity through authentic local experiences.', 'group' => 'general'],
                ['key' => 'about_vision_content_es', 'value' => 'Creemos que las experiencias son mejores cuando se comparten. Nuestra visión es construir una comunidad global que celebre la diversidad a través de experiencias locales auténticas.', 'group' => 'general'],
                
                ['key' => 'about_vision_highlight1_title_en', 'value' => 'Global Connections', 'group' => 'general'],
                ['key' => 'about_vision_highlight1_title_es', 'value' => 'Conexiones Globales', 'group' => 'general'],
                ['key' => 'about_vision_highlight1_desc_en', 'value' => 'Meet travelers and locals from all walks of life.', 'group' => 'general'],
                ['key' => 'about_vision_highlight1_desc_es', 'value' => 'Conoce a viajeros y locales de todos los ámbitos de la vida.', 'group' => 'general'],
                
                ['key' => 'about_vision_highlight2_title_en', 'value' => 'Shared Passion', 'group' => 'general'],
                ['key' => 'about_vision_highlight2_title_es', 'value' => 'Pasión Compartida', 'group' => 'general'],
                ['key' => 'about_vision_highlight2_desc_en', 'value' => 'Celebrate a love for food and conversation.', 'group' => 'general'],
                ['key' => 'about_vision_highlight2_desc_es', 'value' => 'Celebra el amor por la comida y la conversación.', 'group' => 'general'],
                
                ['key' => 'about_vision_highlight3_title_en', 'value' => 'Cultural Exchange', 'group' => 'general'],
                ['key' => 'about_vision_highlight3_title_es', 'value' => 'Intercambio Cultural', 'group' => 'general'],
                ['key' => 'about_vision_highlight3_desc_en', 'value' => 'Bridge cultural divides naturally around the table.', 'group' => 'general'],
                ['key' => 'about_vision_highlight3_desc_es', 'value' => 'Tiende puentes entre culturas de forma natural en la mesa.', 'group' => 'general'],

                // Language Section
                ['key' => 'about_language_subtitle_en', 'value' => 'Speak Naturally', 'group' => 'general'],
                ['key' => 'about_language_subtitle_es', 'value' => 'Habla Naturalmente', 'group' => 'general'],
                ['key' => 'about_language_title_en', 'value' => 'Language & Culture', 'group' => 'general'],
                ['key' => 'about_language_title_es', 'value' => 'Idioma y Cultura', 'group' => 'general'],
                ['key' => 'about_language_content_en', 'value' => 'No textbooks, no classrooms. Just real conversations in Spanish and English while you cook.', 'group' => 'general'],
                ['key' => 'about_language_content_es', 'value' => 'Sin libros de texto, sin aulas. Solo conversaciones reales en español e inglés mientras cocinas.', 'group' => 'general'],
                ['key' => 'about_language_image', 'value' => 'assets/images/speakeasy/GPTempDownload(2).jpg', 'group' => 'general'],

                ['key' => 'about_language_point1_title_en', 'value' => 'Natural Flow', 'group' => 'general'],
                ['key' => 'about_language_point1_title_es', 'value' => 'Fluidez Natural', 'group' => 'general'],
                ['key' => 'about_language_point1_desc_en', 'value' => 'Let conversation guide your vocabulary growth.', 'group' => 'general'],
                ['key' => 'about_language_point1_desc_es', 'value' => 'Deja que la conversación guíe el crecimiento de tu vocabulario.', 'group' => 'general'],

                ['key' => 'about_language_point2_title_en', 'value' => 'Practical Practice', 'group' => 'general'],
                ['key' => 'about_language_point2_title_es', 'value' => 'Práctica Práctica', 'group' => 'general'],
                ['key' => 'about_language_point2_desc_en', 'value' => 'Cook and speak simultaneously for real-world memory hooks.', 'group' => 'general'],
                ['key' => 'about_language_point2_desc_es', 'value' => 'Cocina y habla simultáneamente para crear ganchos de memoria reales.', 'group' => 'general'],

                ['key' => 'about_language_point3_title_en', 'value' => 'Bilingual Vibe', 'group' => 'general'],
                ['key' => 'about_language_point3_title_es', 'value' => 'Ambiente Bilingüe', 'group' => 'general'],
                ['key' => 'about_language_point3_desc_en', 'value' => 'Seamless transitions between languages keep energy high.', 'group' => 'general'],
                ['key' => 'about_language_point3_desc_es', 'value' => 'Las transiciones fluidas entre idiomas mantienen la energía alta.', 'group' => 'general'],

                // Differentiators Section
                ['key' => 'about_different_subtitle_en', 'value' => 'Community-First', 'group' => 'general'],
                ['key' => 'about_different_subtitle_es', 'value' => 'La Comunidad Primero', 'group' => 'general'],
                ['key' => 'about_different_title_en', 'value' => 'What Makes Us Different', 'group' => 'general'],
                ['key' => 'about_different_title_es', 'value' => '¿Qué Nos Hace Diferentes?', 'group' => 'general'],

                ['key' => 'about_different_item1_title_en', 'value' => 'Community-First', 'group' => 'general'],
                ['key' => 'about_different_item1_title_es', 'value' => 'La Comunidad Primero', 'group' => 'general'],
                ['key' => 'about_different_item1_desc_en', 'value' => 'Every detail is designed to foster connection.', 'group' => 'general'],
                ['key' => 'about_different_item1_desc_es', 'value' => 'Cada detalle está diseñado para fomentar la conexión.', 'group' => 'general'],

                ['key' => 'about_different_item2_title_en', 'value' => 'Interactive Activities', 'group' => 'general'],
                ['key' => 'about_different_item2_title_es', 'value' => 'Actividades Interactivas', 'group' => 'general'],
                ['key' => 'about_different_item2_desc_en', 'value' => 'Fun games that break the ice instantly.', 'group' => 'general'],
                ['key' => 'about_different_item2_desc_es', 'value' => 'Juegos divertidos que rompen el hielo al instante.', 'group' => 'general'],

                ['key' => 'about_different_item3_title_en', 'value' => 'Real Human Connections', 'group' => 'general'],
                ['key' => 'about_different_item3_title_es', 'value' => 'Conexiones Humanas Reales', 'group' => 'general'],
                ['key' => 'about_different_item3_desc_en', 'value' => 'We prioritize quality interactions over everything.', 'group' => 'general'],
                ['key' => 'about_different_item3_desc_es', 'value' => 'Priorizamos las interacciones de calidad sobre todo lo demás.', 'group' => 'general'],

                // CTA Section
                ['key' => 'about_cta_title_en', 'value' => 'Come Join the Table', 'group' => 'general'],
                ['key' => 'about_cta_title_es' , 'value' => 'Sé parte de algo más que un simple evento', 'group' => 'general'],
                ['key' => 'about_cta_desc_en', 'value' => 'Whether you’re learning Spanish/English, looking for connection, or simply wanting to experience Valencia differently, Speak Easy Valencia invites you to slow down, share a meal, and be part of the experience.', 'group' => 'general'],
                ['key' => 'about_cta_desc_es', 'value' => 'Tanto si estás aprendiendo español/inglés, buscas conectar o simplemente quieres vivir Valencia de una forma diferente, Speak Easy Valencia te invita a sentarte, compartir mesa y formar parte de la experiencia.', 'group' => 'general'],
                ['key' => 'about_cta_primary_en', 'value' => 'Join the Experience', 'group' => 'general'],
                ['key' => 'about_cta_primary_es', 'value' => 'Únete a la Experiencia', 'group' => 'general'],
                ['key' => 'about_cta_secondary_en', 'value' => 'Get in Touch', 'group' => 'general'],
                ['key' => 'about_cta_secondary_es', 'value' => 'Ponte en Contacto', 'group' => 'general'],
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
                'about_hero_title_en', 'about_hero_title_es', 'about_hero_subtitle_en', 'about_hero_subtitle_es', 'about_hero_cta_en', 'about_hero_cta_es',
                'about_story_subtitle_en', 'about_story_subtitle_es', 'about_story_title_en', 'about_story_title_es', 'about_story_content_en', 'about_story_content_es', 'about_story_image',
                'about_vision_subtitle_en', 'about_vision_subtitle_es', 'about_vision_title_en', 'about_vision_title_es', 'about_vision_content_en', 'about_vision_content_es',
                'about_vision_highlight1_title_en', 'about_vision_highlight1_title_es', 'about_vision_highlight1_desc_en', 'about_vision_highlight1_desc_es',
                'about_vision_highlight2_title_en', 'about_vision_highlight2_title_es', 'about_vision_highlight2_desc_en', 'about_vision_highlight2_desc_es',
                'about_vision_highlight3_title_en', 'about_vision_highlight3_title_es', 'about_vision_highlight3_desc_en', 'about_vision_highlight3_desc_es',
                'about_language_subtitle_en', 'about_language_subtitle_es', 'about_language_title_en', 'about_language_title_es', 'about_language_content_en', 'about_language_content_es', 'about_language_image',
                'about_language_point1_title_en', 'about_language_point1_title_es', 'about_language_point1_desc_en', 'about_language_point1_desc_es',
                'about_language_point2_title_en', 'about_language_point2_title_es', 'about_language_point2_desc_en', 'about_language_point2_desc_es',
                'about_language_point3_title_en', 'about_language_point3_title_es', 'about_language_point3_desc_en', 'about_language_point3_desc_es',
                'about_different_subtitle_en', 'about_different_subtitle_es', 'about_different_title_en', 'about_different_title_es',
                'about_different_item1_title_en', 'about_different_item1_title_es', 'about_different_item1_desc_en', 'about_different_item1_desc_es',
                'about_different_item2_title_en', 'about_different_item2_title_es', 'about_different_item2_desc_en', 'about_different_item2_desc_es',
                'about_different_item3_title_en', 'about_different_item3_title_es', 'about_different_item3_desc_en', 'about_different_item3_desc_es',
                'about_cta_title_en', 'about_cta_title_es', 'about_cta_desc_en', 'about_cta_desc_es', 'about_cta_primary_en', 'about_cta_primary_es', 'about_cta_secondary_en', 'about_cta_secondary_es'
            ];
            Setting::whereIn('key', $keys)->delete();
        }
    }
};
