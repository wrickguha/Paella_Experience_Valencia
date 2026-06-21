<?php

namespace Database\Seeders;

use App\Models\AboutSection;
use Illuminate\Database\Seeder;

class AboutSectionSeeder extends Seeder
{
    public function run(): void
    {
        AboutSection::truncate();

        $sections = [
            // ── 1. HERO ──────────────────────────────────────────
            [
                'section_key' => 'hero',
                'title_en' => 'More Than an Experience',
                'title_es' => 'Más Que Una Experiencia',
                'subtitle_en' => 'We bring people together through food, language, and shared moments.',
                'subtitle_es' => 'Unimos a las personas a través de la comida, el idioma y momentos compartidos.',
                'content_en' => 'SpeakEasy Valencia is more than just a cooking class. It\'s a community where the table is a bridge between cultures, languages, and new friendships.',
                'content_es' => 'SpeakEasy Valencia es más que una clase de cocina. Es una comunidad donde la mesa es un puente entre culturas, idiomas y nuevas amistades.',
                'image' => null,
                'cta_text_en' => 'Join the Experience',
                'cta_text_es' => 'Únete a la Experiencia',
                'cta_link' => '/booking',
                'sort_order' => 0,
                'is_active' => true,
            ],

            // ── 2. OUR STORY ─────────────────────────────────────
            [
                'section_key' => 'story',
                'title_en' => 'The Story Behind SpeakEasy Valencia',
                'title_es' => 'Nuestra Historia',
                'subtitle_en' => 'Born from Passion',
                'subtitle_es' => 'Nacida de la Pasión',
                'content_en' => "SpeakEasy Valencia was created by Gene, who has spent more than 40 years in Valencia and has dedicated much of his life to teaching languages and bringing people together through culture and conversation.\n\nOver the years, he saw that people learn languages best not through pressure or memorisation, but through real human experiences - shared meals, storytelling, music, laughter, and meaningful conversations around the table.\n\nThat idea became the foundation of SpeakEasy Valencia: a place where people can experience Spanish naturally while feeling part of the warmth, rhythm, and culture of Mediterranean life.",
                'content_es' => "Todo empezó con una creencia sencilla: que la mejor manera de entender una cultura es sentarse a su mesa. Quisimos crear un espacio donde viajeros y locales pudieran conocerse, donde la presión de un aula se viera reemplazada por el calor de un fuego compartido, y donde los extraños se hicieran amigos frente a una SpeakEasy humeante.",
                'image' => 'assets/images/casa-magnolia/Chef Gene.jpg',
                'sort_order' => 1,
                'is_active' => true,
            ],

            // ── 3. COMMUNITY VISION (Philosophy) ──────────────────
            [
                'section_key' => 'philosophy',
                'title_en' => 'Community Vision',
                'title_es' => 'Visión de Comunidad',
                'subtitle_en' => 'Better Together',
                'subtitle_es' => 'Mejor Juntos',
                'content_en' => 'We believe experiences are better when shared. Our vision is to build a global community that celebrates diversity through authentic local experiences.',
                'content_es' => 'Creemos que las experiencias son mejores cuando se comparten. Nuestra visión es construir una comunidad global que celebre la diversidad a través de experiencias locales auténticas.',
                'image' => null,
                'sort_order' => 2,
                'is_active' => true,
            ],

            // ── 4. LANGUAGE & CULTURE (Team) ─────────────────────
            [
                'section_key' => 'team',
                'title_en' => 'Language & Culture',
                'title_es' => 'Idioma y Cultura',
                'subtitle_en' => 'Speak Naturally',
                'subtitle_es' => 'Habla Naturalmente',
                'content_en' => 'No textbooks, no classrooms. Just real conversations in Spanish and English while you cook.',
                'content_es' => 'Sin libros de texto, sin aulas. Solo conversaciones reales en español e inglés mientras cocinas.',
                'image' => 'assets/images/speakeasy/GPTempDownload(2).jpg',
                'sort_order' => 3,
                'is_active' => true,
            ],

            // ── 5. DIFFERENTIATORS ────────────────────────────────
            [
                'section_key' => 'differentiators',
                'title_en' => 'Community-First',
                'title_es' => 'La Comunidad Primero',
                'subtitle_en' => null,
                'subtitle_es' => null,
                'content_en' => 'Every detail is designed to foster connection.',
                'content_es' => 'Cada detalle está diseñado para fomentar la conexión.',
                'image' => null,
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'section_key' => 'differentiators',
                'title_en' => 'Interactive Activities',
                'title_es' => 'Actividades Interactivas',
                'subtitle_en' => null,
                'subtitle_es' => null,
                'content_en' => 'Fun games that break the ice instantly.',
                'content_es' => 'Juegos divertidos que rompen el hielo al instante.',
                'image' => null,
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'section_key' => 'differentiators',
                'title_en' => 'Real Human Connections',
                'title_es' => 'Conexiones Humanas Reales',
                'subtitle_en' => null,
                'subtitle_es' => null,
                'content_en' => 'We prioritize quality interactions over everything.',
                'content_es' => 'Priorizamos las interacciones de calidad sobre todo lo demás.',
                'image' => null,
                'sort_order' => 6,
                'is_active' => true,
            ],

            // ── 6. FINAL CTA (cta) ────────────────────────────────
            [
                'section_key' => 'cta',
                'title_en' => 'Come Join the Table',
                'title_es' => 'Sé parte de algo más que un simple evento',
                'subtitle_en' => null,
                'subtitle_es' => null,
                'content_en' => 'Whether you’re learning Spanish/English, looking for connection, or simply wanting to experience Valencia differently, Speak Easy Valencia invites you to slow down, share a meal, and be part of the experience.',
                'content_es' => 'Tanto si estás aprendiendo español/inglés, buscas conectar o simplemente quieres vivir Valencia de una forma diferente, Speak Easy Valencia te invita a sentarte, compartir mesa y formar parte de la experiencia.',
                'image' => null,
                'cta_text_en' => 'Join the Experience',
                'cta_text_es' => 'Únete a la Experiencia',
                'cta_link' => '/booking',
                'sort_order' => 7,
                'is_active' => true,
            ],
        ];

        foreach ($sections as $section) {
            AboutSection::create($section);
        }
    }
}
