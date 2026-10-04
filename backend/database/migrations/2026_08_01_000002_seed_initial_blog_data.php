<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $now = Carbon::now();

        // 1. Insert Categories
        $categories = [
            [
                'name_en' => 'Paella & Gastronomy',
                'name_es' => 'Paella y Gastronomía',
                'slug' => 'paella-gastronomy',
                'description_en' => 'Everything you need to know about traditional Valencian paella recipes, secret ingredients, and culinary traditions.',
                'description_es' => 'Todo sobre recetas tradicionales de paella valenciana, ingredientes secretos y tradiciones culinarias.',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name_en' => 'Language Immersion',
                'name_es' => 'Inmersión Lingüística',
                'slug' => 'language-immersion',
                'description_en' => 'Tips, psychology, and conversational stories on learning Spanish naturally through social dining and culture.',
                'description_es' => 'Consejos y relatos para aprender español de forma natural a través de la comida y la cultura.',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name_en' => 'Valencia Travel & Culture',
                'name_es' => 'Viajes y Cultura de Valencia',
                'slug' => 'valencia-travel-culture',
                'description_en' => 'Local secrets, neighborhood guides, vibrant markets, and cultural festivals across Valencia.',
                'description_es' => 'Secretos locales, guías de barrios, mercados vibrantes y festivales culturales de Valencia.',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name_en' => 'Stories & Experiences',
                'name_es' => 'Historias y Experiencias',
                'slug' => 'stories-experiences',
                'description_en' => 'Heartfelt moments, traveler reflections, and the warmth of the Valencian table.',
                'description_es' => 'Momentos entrañables, reflexiones de viajeros y la calidez de la mesa valenciana.',
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($categories as $cat) {
            DB::table('blog_categories')->updateOrInsert(['slug' => $cat['slug']], $cat);
        }

        $paellaCat = DB::table('blog_categories')->where('slug', 'paella-gastronomy')->first();
        $langCat = DB::table('blog_categories')->where('slug', 'language-immersion')->first();
        $travelCat = DB::table('blog_categories')->where('slug', 'valencia-travel-culture')->first();
        $storiesCat = DB::table('blog_categories')->where('slug', 'stories-experiences')->first();

        // 2. Insert Initial Rich Blog Posts
        $posts = [
            [
                'category_id' => $paellaCat ? $paellaCat->id : null,
                'title_en' => 'The Holy Grail of Paella: The Secret to Perfect Valencian Socarrat',
                'title_es' => 'El Santo Grial de la Paella: El Secreto del Socarrat Valenciano Perfecto',
                'slug' => 'secret-to-perfect-valencian-socarrat',
                'excerpt_en' => 'Discover the science and ancient technique behind the prized crispy caramelized rice crust at the bottom of the pan that every true Valencian treasures.',
                'excerpt_es' => 'Descubre la ciencia y la técnica milenaria detrás de la codiciada capa de arroz crujiente y caramelizada que todo valenciano venera.',
                'content_en' => "## The Soul of the Paella Pan

In Valencia, paella is not simply a dish; it is a ritual, a Sunday gathering with family, and a symbol of identity. And within this sacred culinary universe, no single element commands as much respect, debate, and passionate pursuit as **socarrat**.

The word *socarrat* derives from the Valencian verb *socarrar*, meaning 'to scorch' or 'to lightly singe'. But make no mistake: socarrat is not burnt rice. Burnt rice is bitter, black, and ruined. Socarrat, when achieved by a true *mestre paeller*, is a golden-brown, caramelized, crunchy mosaic of rice that has absorbed all the concentrated oils, saffron, and savory broth of the pan.

### The Science Behind the Crunch

Socarrat occurs during the final two to three minutes of cooking when the liquid has completely evaporated. At this exact moment:
- The natural fats from the chicken, rabbit, and extra virgin olive oil descend to the bottom of the wide steel pan.
- The rice grains touching the metal begin to fry rather than simmer.
- The Maillard reaction and gentle sugar caramelization take place simultaneously, producing an unmistakable toasty aroma.

> \"You do not make socarrat with your eyes; you make socarrat with your ears and your nose.\" — Valencian Proverb

### How to Listen to Your Pan

When you attend our cooking experience in Valencia, one of the first lessons we share around the wood fire is auditory intuition:

1. **The Gentle Simmer:** In the middle stages, the bubbling is soft and rhythmic.
2. **The Evaporation Hush:** As the broth disappears below the grain level, the bubbling quietens.
3. **The Crackle:** This is the magic sound. A distinct, dry sizzle that sounds almost like gentle rainfall on a tin roof.
4. **The Scent Test:** Take a breath above the pan. You should smell toasted starch and fragrant olive oil, never harsh acrid smoke.

### The Spoon Ritual

Traditionally, paella was eaten straight from the pan with wooden spoons (*culleres de fusta*). Diners start at their triangular section of the perimeter and work inward. When the bottom is reached, everyone takes turn gently scraping the bottom to savor the crackling socarrat.

Join us in Valencia to stand over the flame, listen to the sizzle, and scrape your first authentic spoon of gold.",
                'content_es' => "## El Alma de la Paella

En Valencia, la paella no es simplemente un plato; es un ritual, un punto de encuentro dominical en familia y un símbolo de identidad. Y dentro de este universo culinario sagrado, ningún elemento suscita tanto respeto y pasión como el **socarrat**.

La palabra *socarrat* proviene del valenciano *socarrar*, que significa chamuscar ligeramente. Pero no te equivoques: el socarrat no es arroz quemado. El arroz quemado es amargo, negro y arruinado. El socarrat es un mosaico dorado, caramelizado y crujiente de arroz que ha concentrado todos los jugos, el azafrán y el caldo.

### La Escucha del Fuego

Cuando asistes a nuestra experiencia en Valencia, una de las primeras lecciones que compartimos alrededor del fuego de leña es la intuición auditiva:
1. El borboteo suave mientras el caldo evapora.
2. El crujido seco y alegre cuando el arroz empieza a tostarse en el aceite.
3. El aroma inconfundible a cereal tostado y aceite de oliva virgen extra.",
                'featured_image' => 'gallery/socarrat.jpg',
                'author_name' => 'Chef Gene',
                'author_avatar' => 'gallery/chef-gene.jpg',
                'author_role' => 'Head Paella Artisan',
                'reading_time' => '5 min read',
                'is_featured' => true,
                'is_published' => true,
                'published_at' => Carbon::now()->subDays(2),
                'views_count' => 342,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'category_id' => $langCat ? $langCat->id : null,
                'title_en' => 'Why Language Learning at the Dinner Table Works 10x Faster Than Textbooks',
                'title_es' => 'Por Qué Aprender Idiomas Alrededor de la Mesa Funciona 10 Veces Más Rápido',
                'slug' => 'why-language-learning-at-the-dinner-table-works-faster',
                'excerpt_en' => 'Unlocking the neurobiology of conversation: how breaking bread and sharing a relaxed meal removes language anxiety and wires new vocabulary directly into memory.',
                'excerpt_es' => 'La neurobiología de la conversación: cómo compartir una comida relajada elimina la ansiedad y fija el vocabulario directamente en la memoria.',
                'content_en' => "## Beyond the Classroom: The Power of 'Sobremesa'

Have you ever spent months memorizing grammar tables on an app, only to freeze the second a local in a Spanish cafe asks you a rapid-fire question?

You are not alone. Traditional language instruction treats vocabulary like mathematical formulas to be memorized. But human language did not evolve in silent classrooms; it evolved around glowing campfires, communal feasts, and shared culinary experiences.

### The Lowered Affective Filter

In linguistics, Stephen Krashen's *Affective Filter Hypothesis* explains that stress, self-consciousness, and performance anxiety physically block the brain's language acquisition apparatus. When you are nervous:
- Your working memory shrinks.
- You over-monitor your grammar before speaking.
- You hesitate, stumble, and feel exhausted after just ten minutes.

Now, imagine the opposite setting:
You are seated on a sunlit terrace in Valencia. In front of you is a steaming pan of fresh saffron rice, a chilled glass of local wine, and a table of friendly people from five different countries. The host smiles, hands you a wooden spoon, and asks what you smell in the rosemary-scented air.

Instantly, the amygdala relaxes. The affective filter drops to zero. You aren't taking a test; you are simply sharing life.

### The Multi-Sensory Anchor

When you learn the word *romero* (rosemary) from a flashcard, it is an abstract string of letters. When you pick a sprig of fresh rosemary from a Valencian garden, crush it between your fingers, drop it onto simmering rice, and smell the piney burst, your brain forms multi-sensory neural pathways:
1. **Olfactory memory:** Smell is directly connected to the limbic system, the seat of long-term memory.
2. **Tactile feedback:** Chopping, stirring, and tasting create physical muscle anchors.
3. **Emotional context:** Laughter at the table releases dopamine, reinforcing retention.

### The Valencian Art of Sobremesa

In Spain, there is a dedicated word with no direct English translation: **Sobremesa**. It refers to the leisurely time spent lingering around the table long after the meal has ended, conversing, sipping coffee, debating, and bonding.

At SpeakEasy Valencia, our philosophy is rooted in this timeless art. When you cook together and dine together, language flows without fear.",
                'content_es' => "## Más Allá del Aula: El Poder de la Sobremesa

¿Has pasado meses memorizando conjugaciones para quedarte paralizado cuando un camarero en Valencia te pregunta qué deseas tomar?

El lenguaje humano no nació en aulas silenciosas; nació alrededor de fuegos ancestrales y mesas compartidas. En lingüística, cuando el estrés disminuye y las personas comparten una comida con vino y risas, el cerebro asimila el vocabulario diez veces más rápido gracias a la experiencia multisensorial.",
                'featured_image' => 'gallery/sobremesa.jpg',
                'author_name' => 'Elena Martí',
                'author_avatar' => null,
                'author_role' => 'Linguistic Director',
                'reading_time' => '6 min read',
                'is_featured' => false,
                'is_published' => true,
                'published_at' => Carbon::now()->subDays(5),
                'views_count' => 218,
                'sort_order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'category_id' => $paellaCat ? $paellaCat->id : null,
                'title_en' => 'The Authentic Ingredients of Paella Valenciana (And What Never Belongs in the Pan)',
                'title_es' => 'Los Ingredientes Auténticos de la Paella Valenciana (Y lo que Jamás debe Entrar)',
                'slug' => 'authentic-ingredients-of-paella-valenciana',
                'excerpt_en' => 'No chorizo, no peas, no onion. Here is the definitive guide to the 10 canonical ingredients codified by the Valencian Culinary Academy.',
                'excerpt_es' => 'Sin chorizo, sin guisantes, sin cebolla. La guía definitiva de los 10 ingredientes tradicionales de la huerta valenciana.',
                'content_en' => "## The Great Paella Debate

If you mention putting chorizo in a paella in the city of Valencia, you might spark a passionate culinary debate that lasts all afternoon!

While modern fusion paellas exist worldwide, the official **Paella Valenciana Tradicional** is strictly codified and protected as a Cultural Heritage Asset (*Bien de Interés Cultural*). Here is everything you need to know about the authentic recipe.

### The 10 Canonical Ingredients

1. **Arroz Bomba or Senia:** Short-grain round rice grown in the Albufera wetlands, famous for absorbing up to three times its volume in broth without breaking.
2. **Pollo (Chicken):** Free-range chicken cut into bite-sized pieces with bone left in for rich broth.
3. **Conejo (Rabbit):** Essential for authentic countryside depth of flavor.
4. **Bajoqueta (Ferradura):** Wide, flat green beans characteristic of the Valencian orchard (*la huerta*).
5. **Garrofó:** Large, buttery white lima beans unique to eastern Spain that melt in the mouth.
6. **Tomate Rallado:** Freshly grated ripe tomatoes to form the sofrito base.
7. **Aceite de Oliva Virgen Extra:** High-grade Spanish olive oil.
8. **Agua de Valencia (Valencian Water):** Known for its high mineral and calcium content, which alters starch gelatinization.
9. **Azafrán (Saffron):** Real saffron threads lightly bloomed for golden color and earthy aroma.
10. **Sal marina & Romero fresco:** Sea salt and a fresh sprig of rosemary laid on top in the final minutes.

### What Never Belongs in Traditional Paella
- **Chorizo:** The paprika oil overwhelms the delicate saffron.
- **Onion:** Valencians avoid onions in dry paella because they release water and make the rice mushy.
- **Peas or Carrots:** Sweetness clashes with the savory savory profile.

Taste it prepared over roaring orange wood in our hands-on workshop to experience why purity matters.",
                'content_es' => "## El Gran Debate de la Paella

En Valencia, la paella tradicional está protegida y sus diez ingredientes canónicos son respetados con orgullo: arroz de la Albufera, pollo, conejo, bajoqueta, garrofó, tomate rallado, aceite de oliva virgen extra, agua, azafrán y romero fresco. Conoce los detalles de por qué la cebolla y el chorizo nunca entran en la auténtica receta valenciana.",
                'featured_image' => 'gallery/paella-valenciana.jpg',
                'author_name' => 'Chef Gene',
                'author_avatar' => 'gallery/chef-gene.jpg',
                'author_role' => 'Head Paella Artisan',
                'reading_time' => '4 min read',
                'is_featured' => false,
                'is_published' => true,
                'published_at' => Carbon::now()->subDays(8),
                'views_count' => 540,
                'sort_order' => 3,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'category_id' => $travelCat ? $travelCat->id : null,
                'title_en' => 'A Local’s 48-Hour Guide to Valencia: Beyond the Tourist Trail',
                'title_es' => 'Guía de 48 Horas en Valencia por un Local: Más Allá de las Rutas Turísticas',
                'slug' => 'locals-48-hour-guide-to-valencia',
                'excerpt_en' => 'Wandering through the pastel streets of El Carmen, sipping horchata in Alboraya, and enjoying an authentic sunset boat ride on Albufera lake.',
                'excerpt_es' => 'Paseando por las calles de El Carmen, degustando horchata en Alboraya y navegando por la Albufera al atardecer.',
                'content_en' => "## The City of Sunlight, Silk, and Sea

With over 300 days of sunshine each year, Valencia is Spain's best-kept secret. It combines world-class Mediterranean beaches, breathtaking avant-garde architecture, and one of Europe’s largest historic city centers.

### Day 1: Markets, Old Towns, and Turia Gardens
- **Morning:** Start early at *Mercado Central*, one of Europe's oldest operational food markets under a majestic stained-glass dome. Sample fresh jamón ibérico and sweet seasonal oranges.
- **Midday:** Walk through the narrow alleys of *Barrio del Carmen*, admiring street murals and gothic palaces.
- **Afternoon:** Stroll down the *Turia Riverbed Park*—a lush 9km green park transformed from a diverted river that loops around the entire city.
- **Evening:** Join a SpeakEasy social dining session in Ruzafa to practice your Spanish and enjoy warm tapas.

### Day 2: Albufera Lake and Beachfront Vibes
- **Morning:** Rent a bicycle and ride down to *El Cabanyal*, the historic fishermen's quarter with mosaic-tiled facades.
- **Afternoon:** Head south to *L'Albufera Natural Park*, the freshwater lagoon where rice was first planted in Spain during the 8th century.
- **Sunset:** Take a traditional wooden boat (*albuferenc*) across the calm waters as the sky turns shades of orange, violet, and gold.

Valencia welcomes you with open arms and a warm table.",
                'content_es' => "## La Ciudad del Sol y del Mar

Con más de 300 días de sol al año, Valencia ofrece una combinación inigualable de historia, playas y gastronomía. Descubre nuestro itinerario de 48 horas recorriendo el Mercado Central, el Barrio del Carmen, el jardín del Turia y la mágica puesta de sol en la Albufera.",
                'featured_image' => 'gallery/paella-1.jpg',
                'author_name' => 'Wrick Guha',
                'author_avatar' => null,
                'author_role' => 'Founder & Cultural Host',
                'reading_time' => '7 min read',
                'is_featured' => false,
                'is_published' => true,
                'published_at' => Carbon::now()->subDays(12),
                'views_count' => 412,
                'sort_order' => 4,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'category_id' => $storiesCat ? $storiesCat->id : null,
                'title_en' => 'From Strangers to Family: One Evening Around the Fire at Casa Magnolia',
                'title_es' => 'De Desconocidos a Familia: Una Tarde Alrededor del Fuego en Casa Magnolia',
                'slug' => 'from-strangers-to-family-at-casa-magnolia',
                'excerpt_en' => 'How fourteen travelers from five continents sat down as strangers and left with lifelong friendships and a deep love for Spanish culture.',
                'excerpt_es' => 'Cómo catorce viajeros de cinco continentes llegaron como desconocidos y se marcharon como grandes amigos unidos por la cocina.',
                'content_en' => "## The Magic of the Long Table

At 6:30 PM, the garden gate of Casa Magnolia opened. A solo traveler from Tokyo arrived first, slightly nervous about her conversational Spanish. Five minutes later, a couple from Seattle and two digital nomads from Berlin walked in, greeted by the crackle of orange firewood and the aroma of simmering garlic.

By 7:15 PM, everyone had an apron on and a glass of Valencian white wine in hand.

### When Barriers Melt Away

There is something transformative about chopping vegetables side-by-side. You don't have to think about clever icebreakers or awkward small talk. Instead, you're learning how to chop *bajoqueta*, comparing culinary traditions across continents, and laughing as someone learns to pronounce *ferradura*.

When the giant paella pan was placed in the center of the wooden terrace table, silence fell for just a moment—followed by collective applause.

> \"I came to Valencia to learn Spanish, but what I actually found was a community and a feeling of home.\" — Sarah, guest from London

This is what SpeakEasy Valencia is built upon. Not just recipes; human connection through food and language.",
                'content_es' => "## La Magia de la Mesa Larga

Cuando catorce personas de diferentes países se reúnen alrededor del fuego de leña con una copa de vino y delantales puestos, las barreras lingüísticas desaparecen y florecen amistades para toda la vida.",
                'featured_image' => 'gallery/sobremesa.jpg',
                'author_name' => 'Wrick Guha',
                'author_avatar' => null,
                'author_role' => 'Founder & Cultural Host',
                'reading_time' => '5 min read',
                'is_featured' => false,
                'is_published' => true,
                'published_at' => Carbon::now()->subDays(15),
                'views_count' => 195,
                'sort_order' => 5,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($posts as $post) {
            DB::table('blog_posts')->updateOrInsert(['slug' => $post['slug']], $post);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('blog_posts')->truncate();
        DB::table('blog_categories')->truncate();
    }
};
