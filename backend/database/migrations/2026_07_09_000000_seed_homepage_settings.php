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
                // Hero Section CTA and Scroll
                ['key' => 'hero_cta_en', 'value' => 'Join the Experience', 'group' => 'general'],
                ['key' => 'hero_cta_es', 'value' => 'Únete a la Experiencia', 'group' => 'general'],
                ['key' => 'hero_scroll_en', 'value' => 'Discover More', 'group' => 'general'],
                ['key' => 'hero_scroll_es', 'value' => 'Descubre Más', 'group' => 'general'],

                // Experience Highlights Title & Subtitle
                ['key' => 'highlights_title_en', 'value' => 'What Is SpeakEasy Valencia?', 'group' => 'general'],
                ['key' => 'highlights_title_es', 'value' => '¿Qué es SpeakEasy Valencia?', 'group' => 'general'],
                ['key' => 'highlights_subtitle_en', 'value' => 'A social language immersion experience built around conversation, culture, and food.', 'group' => 'general'],
                ['key' => 'highlights_subtitle_es', 'value' => 'Una experiencia social de inmersión lingüística en torno a la conversación, la cultura y la comida.', 'group' => 'general'],

                // Experience Highlights Language Section
                ['key' => 'highlights_languageTitle_en', 'value' => 'How Do You Learn the Language Here?', 'group' => 'general'],
                ['key' => 'highlights_languageTitle_es', 'value' => '¿Cómo se aprende el idioma aquí?', 'group' => 'general'],
                ['key' => 'highlights_languageSubtitle_en', 'value' => 'By living it.', 'group' => 'general'],
                ['key' => 'highlights_languageSubtitle_es', 'value' => 'Viviéndolo.', 'group' => 'general'],
                ['key' => 'highlights_languageParagraphs_en', 'value' => "Instead of learning from a textbook, you learn through real conversations, shared meals, cultural exchange, and meeting people from around the world.\n\nYou hear Spanish and English naturally around the table.\n\nYou practise the language while sharing stories, laughing together, and discovering different cultures.\n\nWhether you're fluent, just starting, or somewhere in between, SpeakEasy is designed to make language feel natural, social, and enjoyable.", 'group' => 'general'],
                ['key' => 'highlights_languageParagraphs_es', 'value' => "En lugar de aprender de un libro de texto, aprendes a través de conversaciones reales, comidas compartidas, intercambio cultural y conociendo a personas de todo el mundo.\n\nEscuchas español e inglés de forma natural alrededor de la mesa.\n\nPracticas el idioma mientras compartes historias, se ríen juntos y descubren diferentes culturas.\n\nYa sea que hables con fluidez, estés comenzando o estés en algún punto intermedio, SpeakEasy está diseñado para que el idioma se sientan natural, social y agradable.", 'group' => 'general'],

                // Experience Highlights features (1-6)
                ['key' => 'highlights_feat1_title_en', 'value' => 'Real Conversations', 'group' => 'general'],
                ['key' => 'highlights_feat1_title_es', 'value' => 'Conversaciones Reales', 'group' => 'general'],
                ['key' => 'highlights_feat1_desc_en', 'value' => 'Practice language naturally through shared experiences and human connection.', 'group' => 'general'],
                ['key' => 'highlights_feat1_desc_es', 'value' => 'Practica el idioma de forma natural a través de experiencias compartidas y conexión humana.', 'group' => 'general'],

                ['key' => 'highlights_feat2_title_en', 'value' => 'Shared Meals', 'group' => 'general'],
                ['key' => 'highlights_feat2_title_es', 'value' => 'Comidas Compartidas', 'group' => 'general'],
                ['key' => 'highlights_feat2_desc_en', 'value' => 'From tapas to paella, food becomes part of the experience.', 'group' => 'general'],
                ['key' => 'highlights_feat2_desc_es', 'value' => 'Desde tapas hasta paella, la comida se convierte en parte de la experiencia.', 'group' => 'general'],

                ['key' => 'highlights_feat3_title_en', 'value' => 'Sobremesa', 'group' => 'general'],
                ['key' => 'highlights_feat3_title_es', 'value' => 'Sobremesa', 'group' => 'general'],
                ['key' => 'highlights_feat3_desc_en', 'value' => 'Slow down, stay at the table, and let conversations flow naturally.', 'group' => 'general'],
                ['key' => 'highlights_feat3_desc_es', 'value' => 'Baja el ritmo, quédate en la mesa y deja que las conversaciones fluyan de forma natural.', 'group' => 'general'],

                ['key' => 'highlights_feat4_title_en', 'value' => 'Mediterranean Lifestyle', 'group' => 'general'],
                ['key' => 'highlights_feat4_title_es', 'value' => 'Estilo de Vida Mediterráneo', 'group' => 'general'],
                ['key' => 'highlights_feat4_desc_en', 'value' => 'Experience the relaxed rhythm, warmth, and culture of Valencia.', 'group' => 'general'],
                ['key' => 'highlights_feat4_desc_es', 'value' => 'Experimenta el ritmo relajado, la calidez y la cultura de Valencia.', 'group' => 'general'],

                ['key' => 'highlights_feat5_title_en', 'value' => 'Community & Connection', 'group' => 'general'],
                ['key' => 'highlights_feat5_title_es', 'value' => 'Comunidad y Conexión', 'group' => 'general'],
                ['key' => 'highlights_feat5_desc_en', 'value' => 'Meet travelers, expats, locals, and new friends through shared moments.', 'group' => 'general'],
                ['key' => 'highlights_feat5_desc_es', 'value' => 'Conoce a viajeros, expatriados, locales y nuevos amigos a través de momentos compartidos.', 'group' => 'general'],

                ['key' => 'highlights_feat6_title_en', 'value' => 'Immersive Experiences', 'group' => 'general'],
                ['key' => 'highlights_feat6_title_es', 'value' => 'Experiencias Inmersivas', 'group' => 'general'],
                ['key' => 'highlights_feat6_desc_en', 'value' => 'Beautiful locations, cultural activities, music, nature, and meaningful social experiences.', 'group' => 'general'],
                ['key' => 'highlights_feat6_desc_es', 'value' => 'Hermosos lugares, actividades culturales, música, naturaleza y experiencias sociales significativas.', 'group' => 'general'],

                // Snake Flowchart steps (1-5)
                ['key' => 'flow_step1_title_en', 'value' => 'Meet & Connect', 'group' => 'general'],
                ['key' => 'flow_step1_title_es', 'value' => 'Reunirse y Conectar', 'group' => 'general'],
                ['key' => 'flow_step1_desc_en', 'value' => 'Meet people from around the world.', 'group' => 'general'],
                ['key' => 'flow_step1_desc_es', 'value' => 'Conoce a gente de todo el mundo.', 'group' => 'general'],

                ['key' => 'flow_step2_title_en', 'value' => 'Language Experience', 'group' => 'general'],
                ['key' => 'flow_step2_title_es', 'value' => 'Experiencia del Idioma', 'group' => 'general'],
                ['key' => 'flow_step2_desc_en', 'value' => 'Practice Spanish and English naturally.', 'group' => 'general'],
                ['key' => 'flow_step2_desc_es', 'value' => 'Practica español e inglés de forma natural.', 'group' => 'general'],

                ['key' => 'flow_step3_title_en', 'value' => 'Food & Drinks', 'group' => 'general'],
                ['key' => 'flow_step3_title_es', 'value' => 'Comida y Bebida', 'group' => 'general'],
                ['key' => 'flow_step3_desc_en', 'value' => 'Enjoy Argentine empanadas, wine, and beer.', 'group' => 'general'],
                ['key' => 'flow_step3_desc_es', 'value' => 'Disfruta de empanadas argentinas, vino y cerveza.', 'group' => 'general'],

                ['key' => 'flow_step4_title_en', 'value' => 'Culture & Conversation', 'group' => 'general'],
                ['key' => 'flow_step4_title_es', 'value' => 'Cultura y Conversación', 'group' => 'general'],
                ['key' => 'flow_step4_desc_en', 'value' => 'Share stories, experiences, and perspectives.', 'group' => 'general'],
                ['key' => 'flow_step4_desc_es', 'value' => 'Comparte historias, experiencias y perspectivas.', 'group' => 'general'],

                ['key' => 'flow_step5_title_en', 'value' => 'Build New Connections', 'group' => 'general'],
                ['key' => 'flow_step5_title_es', 'value' => 'Construir Nuevas Conexiones', 'group' => 'general'],
                ['key' => 'flow_step5_desc_en', 'value' => 'Leave with new friends and memorable conversations.', 'group' => 'general'],
                ['key' => 'flow_step5_desc_es', 'value' => 'Vete con nuevos amigos y conversaciones memorables.', 'group' => 'general'],

                // Community Section Spanish versions
                ['key' => 'community_title_en', 'value' => 'Meet the Community', 'group' => 'general'],
                ['key' => 'community_title_es', 'value' => 'Conoce a la Comunidad', 'group' => 'general'],
                ['key' => 'community_subtitle_en', 'value' => 'People from different places come together for more than just food.', 'group' => 'general'],
                ['key' => 'community_subtitle_es', 'value' => 'Personas de diferentes lugares se unen para algo más que comida.', 'group' => 'general'],
                ['key' => 'community_card1_title_en', 'value' => 'Travelers & Locals', 'group' => 'general'],
                ['key' => 'community_card1_title_es', 'value' => 'Viajeros y Locales', 'group' => 'general'],
                ['key' => 'community_card1_desc_en', 'value' => 'Connect with people from all over the world and Valencia.', 'group' => 'general'],
                ['key' => 'community_card1_desc_es', 'value' => 'Conéctate con gente de todo el mundo y de Valencia.', 'group' => 'general'],
                ['key' => 'community_card2_title_en', 'value' => 'Make New Friends', 'group' => 'general'],
                ['key' => 'community_card2_title_es', 'value' => 'Hacer Nuevos Amigos', 'group' => 'general'],
                ['key' => 'community_card2_desc_en', 'value' => 'Our experiences are designed to foster genuine human connections.', 'group' => 'general'],
                ['key' => 'community_card2_desc_es', 'value' => 'Nuestras experiencias están diseñadas para fomentar conexiones humanas genuinas.', 'group' => 'general'],
                ['key' => 'community_card3_title_en', 'value' => 'Shared Experiences', 'group' => 'general'],
                ['key' => 'community_card3_title_es', 'value' => 'Experiencias Compartidas', 'group' => 'general'],
                ['key' => 'community_card3_desc_en', 'value' => 'Create lasting memories while learning and laughing together.', 'group' => 'general'],
                ['key' => 'community_card3_desc_es', 'value' => 'Crea recuerdos duraderos mientras aprenden y se ríen juntos.', 'group' => 'general'],

                // Video Testimonials titles
                ['key' => 'video_testimonials_title_en', 'value' => 'What Our Guests Say', 'group' => 'general'],
                ['key' => 'video_testimonials_title_es', 'value' => 'Lo Que Dicen Nuestros Invitados', 'group' => 'general'],
                ['key' => 'video_testimonials_subtitle_en', 'value' => 'Real stories from real travelers', 'group' => 'general'],
                ['key' => 'video_testimonials_subtitle_es', 'value' => 'Historias reales de viajeros reales', 'group' => 'general'],
                ['key' => 'video_testimonials_seeMore_en', 'value' => 'See More Testimonials', 'group' => 'general'],
                ['key' => 'video_testimonials_seeMore_es', 'value' => 'Ver Más Testimonios', 'group' => 'general'],

                // Spanish/English Level Test Intro
                ['key' => 'spanishTest_title_en', 'value' => 'Test Your Spanish Level', 'group' => 'general'],
                ['key' => 'spanishTest_title_es', 'value' => 'Prueba tu nivel de español', 'group' => 'general'],
                ['key' => 'spanishTest_subtitle_en', 'value' => 'Take our quick 15-question quiz to find out which experience is best for you.', 'group' => 'general'],
                ['key' => 'spanishTest_subtitle_es', 'value' => 'Responde a nuestro rápido cuestionario de 15 preguntas para saber qué experiencia es mejor para ti.', 'group' => 'general'],
                ['key' => 'spanishTest_startBtn_en', 'value' => 'Start Quiz', 'group' => 'general'],
                ['key' => 'spanishTest_startBtn_es', 'value' => 'Iniciar Cuestionario', 'group' => 'general'],

                ['key' => 'englishTest_title_en', 'value' => 'Test Your English Level', 'group' => 'general'],
                ['key' => 'englishTest_title_es', 'value' => 'Prueba tu nivel de inglés', 'group' => 'general'],
                ['key' => 'englishTest_subtitle_en', 'value' => 'Find out your English level in 5 minutes with our speaking-focused assessment.', 'group' => 'general'],
                ['key' => 'englishTest_subtitle_es', 'value' => 'Descubre tu nivel de inglés en 5 minutos con nuestra evaluación centrada en el habla.', 'group' => 'general'],
                ['key' => 'englishTest_startBtn_en', 'value' => 'Start Quiz', 'group' => 'general'],
                ['key' => 'englishTest_startBtn_es', 'value' => 'Iniciar Cuestionario', 'group' => 'general'],

                // How It Works Section
                ['key' => 'howItWorks_title_en', 'value' => 'How to Join us', 'group' => 'general'],
                ['key' => 'howItWorks_title_es', 'value' => 'Cómo Unirse a Nosotros', 'group' => 'general'],
                ['key' => 'howItWorks_subtitle_en', 'value' => 'From your first click to the last bite — it\'s simple, delicious, and unforgettable', 'group' => 'general'],
                ['key' => 'howItWorks_subtitle_es', 'value' => 'Desde tu primer clic hasta el último bocado — es simple, delicioso e inolvidable', 'group' => 'general'],

                ['key' => 'howItWorks_step1_title_en', 'value' => 'Pick a Date', 'group' => 'general'],
                ['key' => 'howItWorks_step1_title_es', 'value' => 'Elige una Fecha', 'group' => 'general'],
                ['key' => 'howItWorks_step1_desc_en', 'value' => 'Browse our live calendar and choose a date that suits you at Bloom Gallery or Casa Magnolia.', 'group' => 'general'],
                ['key' => 'howItWorks_step1_desc_es', 'value' => 'Explora nuestro calendario en vivo y elige una fecha que te convenga en Bloom Gallery o Casa Magnolia.', 'group' => 'general'],

                ['key' => 'howItWorks_step2_title_en', 'value' => 'Book Online', 'group' => 'general'],
                ['key' => 'howItWorks_step2_title_es', 'value' => 'Reserva en Línea', 'group' => 'general'],
                ['key' => 'howItWorks_step2_desc_en', 'value' => 'Select the number of guests, fill in your details and confirm your spot in seconds — no phone calls needed.', 'group' => 'general'],
                ['key' => 'howItWorks_step2_desc_es', 'value' => 'Selecciona el número de invitados, completa tus datos y confirma tu lugar en segundos, sin necesidad de llamadas telefónicas.', 'group' => 'general'],

                ['key' => 'howItWorks_step3_title_en', 'value' => 'Enjoy the Experience', 'group' => 'general'],
                ['key' => 'howItWorks_step3_title_es', 'value' => 'Disfruta de la Experiencia', 'group' => 'general'],
                ['key' => 'howItWorks_step3_desc_en', 'value' => 'Spend time enjoying great food, practicing languages, and connecting with people from around the world.', 'group' => 'general'],
                ['key' => 'howItWorks_step3_desc_es', 'value' => 'Pasa tiempo disfrutando de excelente comida, practicando idiomas y conectando con personas de todo el mundo.', 'group' => 'general'],

                ['key' => 'howItWorks_cta_en', 'value' => 'View Available Dates', 'group' => 'general'],
                ['key' => 'howItWorks_cta_es', 'value' => 'Ver Fechas Disponibles', 'group' => 'general'],

                // Upcoming Events Section
                ['key' => 'upcomingEvents_title_en', 'value' => 'Upcoming Events', 'group' => 'general'],
                ['key' => 'upcomingEvents_title_es', 'value' => 'Próximos Eventos', 'group' => 'general'],
                ['key' => 'upcomingEvents_subtitle_en', 'value' => 'Grab a spot before they fill up — our sessions book out fast', 'group' => 'general'],
                ['key' => 'upcomingEvents_subtitle_es', 'value' => 'Reserva un lugar antes de que se llenen — nuestras sesiones se agotan rápido', 'group' => 'general'],
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
                'hero_cta_en', 'hero_cta_es', 'hero_scroll_en', 'hero_scroll_es',
                'highlights_title_en', 'highlights_title_es', 'highlights_subtitle_en', 'highlights_subtitle_es',
                'highlights_languageTitle_en', 'highlights_languageTitle_es', 'highlights_languageSubtitle_en', 'highlights_languageSubtitle_es',
                'highlights_languageParagraphs_en', 'highlights_languageParagraphs_es',
                'highlights_feat1_title_en', 'highlights_feat1_title_es', 'highlights_feat1_desc_en', 'highlights_feat1_desc_es',
                'highlights_feat2_title_en', 'highlights_feat2_title_es', 'highlights_feat2_desc_en', 'highlights_feat2_desc_es',
                'highlights_feat3_title_en', 'highlights_feat3_title_es', 'highlights_feat3_desc_en', 'highlights_feat3_desc_es',
                'highlights_feat4_title_en', 'highlights_feat4_title_es', 'highlights_feat4_desc_en', 'highlights_feat4_desc_es',
                'highlights_feat5_title_en', 'highlights_feat5_title_es', 'highlights_feat5_desc_en', 'highlights_feat5_desc_es',
                'highlights_feat6_title_en', 'highlights_feat6_title_es', 'highlights_feat6_desc_en', 'highlights_feat6_desc_es',
                'flow_step1_title_en', 'flow_step1_title_es', 'flow_step1_desc_en', 'flow_step1_desc_es',
                'flow_step2_title_en', 'flow_step2_title_es', 'flow_step2_desc_en', 'flow_step2_desc_es',
                'flow_step3_title_en', 'flow_step3_title_es', 'flow_step3_desc_en', 'flow_step3_desc_es',
                'flow_step4_title_en', 'flow_step4_title_es', 'flow_step4_desc_en', 'flow_step4_desc_es',
                'flow_step5_title_en', 'flow_step5_title_es', 'flow_step5_desc_en', 'flow_step5_desc_es',
                'community_title_en', 'community_title_es', 'community_subtitle_en', 'community_subtitle_es',
                'community_card1_title_en', 'community_card1_title_es', 'community_card1_desc_en', 'community_card1_desc_es',
                'community_card2_title_en', 'community_card2_title_es', 'community_card2_desc_en', 'community_card2_desc_es',
                'community_card3_title_en', 'community_card3_title_es', 'community_card3_desc_en', 'community_card3_desc_es',
                'video_testimonials_title_en', 'video_testimonials_title_es', 'video_testimonials_subtitle_en', 'video_testimonials_subtitle_es',
                'video_testimonials_seeMore_en', 'video_testimonials_seeMore_es',
                'spanishTest_title_en', 'spanishTest_title_es', 'spanishTest_subtitle_en', 'spanishTest_subtitle_es', 'spanishTest_startBtn_en', 'spanishTest_startBtn_es',
                'englishTest_title_en', 'englishTest_title_es', 'englishTest_subtitle_en', 'englishTest_subtitle_es', 'englishTest_startBtn_en', 'englishTest_startBtn_es',
                'howItWorks_title_en', 'howItWorks_title_es', 'howItWorks_subtitle_en', 'howItWorks_subtitle_es',
                'howItWorks_step1_title_en', 'howItWorks_step1_title_es', 'howItWorks_step1_desc_en', 'howItWorks_step1_desc_es',
                'howItWorks_step2_title_en', 'howItWorks_step2_title_es', 'howItWorks_step2_desc_en', 'howItWorks_step2_desc_es',
                'howItWorks_step3_title_en', 'howItWorks_step3_title_es', 'howItWorks_step3_desc_en', 'howItWorks_step3_desc_es',
                'howItWorks_cta_en', 'howItWorks_cta_es',
                'upcomingEvents_title_en', 'upcomingEvents_title_es', 'upcomingEvents_subtitle_en', 'upcomingEvents_subtitle_es',
            ];
            Setting::whereIn('key', $keys)->delete();
        }
    }
};
