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
                'title_en' => 'More Than a Meal — It\'s a Valencian Experience',
                'title_es' => 'Más Que una Comida — Es una Experiencia Valenciana',
                'subtitle_en' => 'Discover the tradition, culture, and joy behind authentic paella',
                'subtitle_es' => 'Descubre la tradición, la cultura y la alegría detrás de la auténtica paella',
                'content_en' => null,
                'content_es' => null,
                'image' => 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=1600&q=80',
                'cta_text_en' => 'Book Your Experience',
                'cta_text_es' => 'Reserva Tu Experiencia',
                'cta_link' => '/booking',
                'sort_order' => 0,
                'is_active' => true,
            ],

            // ── 2. OUR STORY ─────────────────────────────────────
            [
                'section_key' => 'story',
                'title_en' => 'How It All Began',
                'title_es' => 'Cómo Empezó Todo',
                'subtitle_en' => 'A passion project born in the heart of Valencia',
                'subtitle_es' => 'Un proyecto de pasión nacido en el corazón de Valencia',
                'content_en' => "It started with a simple question: what if we could share the soul of Valencia with the world — not through a guidebook, but through the sizzle of a paella pan?\n\nWhat began as weekend gatherings with friends on a rooftop terrace has grown into something we never imagined — an experience loved by thousands of travelers from every corner of the globe. We didn't set out to build a business. We set out to share a feeling: the warmth of gathering around a fire, the aroma of saffron and rosemary, the laughter that fills the air when strangers become friends over a shared meal.\n\nFor us, paella was never just a recipe. It's the story of Valencia itself — of farmers and fishermen, of family and tradition, of sun-soaked afternoons that turn into unforgettable evenings.",
                'content_es' => "Todo comenzó con una simple pregunta: ¿y si pudiéramos compartir el alma de Valencia con el mundo — no a través de una guía, sino a través del chisporroteo de una paellera?\n\nLo que empezó como reuniones de fin de semana con amigos en una terraza se ha convertido en algo que nunca imaginamos — una experiencia amada por miles de viajeros de todo el mundo. No nos propusimos crear un negocio. Nos propusimos compartir un sentimiento: la calidez de reunirse alrededor del fuego, el aroma del azafrán y el romero, la risa que llena el aire cuando los desconocidos se convierten en amigos alrededor de una comida compartida.\n\nPara nosotros, la paella nunca fue solo una receta. Es la historia de Valencia — de agricultores y pescadores, de familia y tradición, de tardes soleadas que se convierten en veladas inolvidables.",
                'image' => 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
                'sort_order' => 1,
                'is_active' => true,
            ],

            // ── 3. OUR PHILOSOPHY ────────────────────────────────
            [
                'section_key' => 'philosophy',
                'title_en' => 'Our Philosophy',
                'title_es' => 'Nuestra Filosofía',
                'subtitle_en' => 'We don\'t just teach recipes — we share traditions',
                'subtitle_es' => 'No solo enseñamos recetas — compartimos tradiciones',
                'content_en' => "Food is the oldest form of storytelling. Every ingredient carries a history, every technique a generation of wisdom. When you stir a paella, you're not just cooking — you're participating in a living tradition that stretches back centuries.\n\nWe believe that the most meaningful travel experiences aren't found in museums or monuments, but in the moments of genuine human connection. Around our fire, cultures meet, stories are shared, and strangers leave as friends. That's the magic we cultivate every single day.",
                'content_es' => "La comida es la forma más antigua de contar historias. Cada ingrediente lleva una historia, cada técnica una generación de sabiduría. Cuando remueves una paella, no solo estás cocinando — estás participando en una tradición viva que se remonta siglos atrás.\n\nCreemos que las experiencias de viaje más significativas no se encuentran en museos o monumentos, sino en los momentos de conexión humana genuina. Alrededor de nuestro fuego, las culturas se encuentran, se comparten historias y los desconocidos se van como amigos. Esa es la magia que cultivamos cada día.",
                'image' => 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800&q=80',
                'sort_order' => 2,
                'is_active' => true,
            ],

            // ── 4. WHAT MAKES US DIFFERENT (5 items) ─────────────
            [
                'section_key' => 'differentiators',
                'title_en' => 'Authentic Local Approach',
                'title_es' => 'Enfoque Local Auténtico',
                'subtitle_en' => null,
                'subtitle_es' => null,
                'content_en' => 'We cook the way Valencians have cooked for generations — with wood fire, local ingredients, and recipes passed down from grandmothers.',
                'content_es' => 'Cocinamos como los valencianos lo han hecho durante generaciones — con fuego de leña, ingredientes locales y recetas transmitidas por las abuelas.',
                'image' => null,
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'section_key' => 'differentiators',
                'title_en' => 'Small, Intimate Groups',
                'title_es' => 'Grupos Pequeños e Íntimos',
                'subtitle_en' => null,
                'subtitle_es' => null,
                'content_en' => 'No crowds, no assembly line cooking. Just a small group of people sharing a genuine experience where everyone participates.',
                'content_es' => 'Sin multitudes, sin cocina en cadena. Solo un pequeño grupo de personas compartiendo una experiencia genuina donde todos participan.',
                'image' => null,
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'section_key' => 'differentiators',
                'title_en' => 'Hands-On Participation',
                'title_es' => 'Participación Práctica',
                'subtitle_en' => null,
                'subtitle_es' => null,
                'content_en' => 'You don\'t watch from the sidelines. You chop, stir, taste, and create — learning techniques you\'ll take home forever.',
                'content_es' => 'No miras desde la barrera. Cortas, remueves, pruebas y creas — aprendiendo técnicas que te llevarás a casa para siempre.',
                'image' => null,
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'section_key' => 'differentiators',
                'title_en' => 'Real Cultural Immersion',
                'title_es' => 'Inmersión Cultural Real',
                'subtitle_en' => null,
                'subtitle_es' => null,
                'content_en' => 'From the market visit to the stories our hosts tell, every moment is designed to connect you deeply with Valencian culture.',
                'content_es' => 'Desde la visita al mercado hasta las historias que cuentan nuestros anfitriones, cada momento está diseñado para conectarte profundamente con la cultura valenciana.',
                'image' => null,
                'sort_order' => 6,
                'is_active' => true,
            ],
            [
                'section_key' => 'differentiators',
                'title_en' => 'Personal Attention',
                'title_es' => 'Atención Personalizada',
                'subtitle_en' => null,
                'subtitle_es' => null,
                'content_en' => 'Our hosts know your name, your dietary needs, and how to make you feel at home. Every guest is family to us.',
                'content_es' => 'Nuestros anfitriones saben tu nombre, tus necesidades dietéticas y cómo hacerte sentir en casa. Cada invitado es familia para nosotros.',
                'image' => null,
                'sort_order' => 7,
                'is_active' => true,
            ],

            // ── 5. MEET THE HOST / TEAM ──────────────────────────
            [
                'section_key' => 'team',
                'title_en' => 'Meet the People Behind the Fire',
                'title_es' => 'Conoce a las Personas Detrás del Fuego',
                'subtitle_en' => 'Passionate locals who live and breathe Valencian culture',
                'subtitle_es' => 'Locales apasionados que viven y respiran la cultura valenciana',
                'content_en' => "We're not a corporation — we're a family of food lovers, storytellers, and culture enthusiasts. Our hosts are born-and-raised Valencians who carry decades of culinary tradition in their hands and an irresistible warmth in their smiles.\n\nWhen you cook with us, you're not just learning from a chef — you're sharing a kitchen with someone who genuinely loves what they do and wants you to feel the same joy they feel every time the socarrat crackles perfectly.",
                'content_es' => "No somos una corporación — somos una familia de amantes de la comida, narradores y entusiastas de la cultura. Nuestros anfitriones son valencianos de nacimiento que llevan décadas de tradición culinaria en sus manos y una calidez irresistible en sus sonrisas.\n\nCuando cocinas con nosotros, no solo aprendes de un chef — compartes cocina con alguien que genuinamente ama lo que hace y quiere que sientas la misma alegría que siente cada vez que el socarrat cruje perfectamente.",
                'image' => 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80',
                'sort_order' => 8,
                'is_active' => true,
            ],

            // ── 8. WHY PEOPLE LOVE THIS (4 items) ────────────────
            [
                'section_key' => 'whylove',
                'title_en' => 'Make Real Connections',
                'title_es' => 'Crea Conexiones Reales',
                'subtitle_en' => null,
                'subtitle_es' => null,
                'content_en' => 'Bond with fellow travelers and locals over shared laughter, great food, and the warmth of a wood fire.',
                'content_es' => 'Conecta con otros viajeros y locales a través de risas compartidas, buena comida y la calidez del fuego de leña.',
                'image' => null,
                'sort_order' => 9,
                'is_active' => true,
            ],
            [
                'section_key' => 'whylove',
                'title_en' => 'Learn Something Meaningful',
                'title_es' => 'Aprende Algo Significativo',
                'subtitle_en' => null,
                'subtitle_es' => null,
                'content_en' => 'Take home more than photos — take home a skill, a recipe, and a deeper understanding of Valencian culture.',
                'content_es' => 'Llévate a casa más que fotos — llévate una habilidad, una receta y una comprensión más profunda de la cultura valenciana.',
                'image' => null,
                'sort_order' => 10,
                'is_active' => true,
            ],
            [
                'section_key' => 'whylove',
                'title_en' => 'Experience Local Life',
                'title_es' => 'Vive la Vida Local',
                'subtitle_en' => null,
                'subtitle_es' => null,
                'content_en' => 'Step away from the tourist trail and into the heart of Valencia — the markets, the kitchens, the rhythm of daily life.',
                'content_es' => 'Aléjate de la ruta turística y adéntrate en el corazón de Valencia — los mercados, las cocinas, el ritmo de la vida diaria.',
                'image' => null,
                'sort_order' => 11,
                'is_active' => true,
            ],
            [
                'section_key' => 'whylove',
                'title_en' => 'Create Unforgettable Memories',
                'title_es' => 'Crea Recuerdos Inolvidables',
                'subtitle_en' => null,
                'subtitle_es' => null,
                'content_en' => 'The flavors, the laughter, the sunset over Valencia — these are the moments that stay with you long after you return home.',
                'content_es' => 'Los sabores, la risa, el atardecer sobre Valencia — estos son los momentos que permanecen contigo mucho después de volver a casa.',
                'image' => null,
                'sort_order' => 12,
                'is_active' => true,
            ],

            // ── 9. FINAL CTA ─────────────────────────────────────
            [
                'section_key' => 'cta',
                'title_en' => 'Ready to Experience Valencia Like a Local?',
                'title_es' => '¿Listo para Vivir Valencia Como un Local?',
                'subtitle_en' => 'Join us for a day you\'ll never forget',
                'subtitle_es' => 'Únete a nosotros para un día que nunca olvidarás',
                'content_en' => null,
                'content_es' => null,
                'image' => null,
                'cta_text_en' => 'Book Now',
                'cta_text_es' => 'Reservar Ahora',
                'cta_link' => '/booking',
                'sort_order' => 13,
                'is_active' => true,
            ],
        ];

        foreach ($sections as $section) {
            AboutSection::create($section);
        }
    }
}
