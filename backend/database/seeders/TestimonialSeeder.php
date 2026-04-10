<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            [
                'name' => 'Sarah & James',
                'location_label' => 'London, UK',
                'review_en' => 'Hands down the highlight of our trip to Valencia! The chef was incredibly warm, the food divine, and the terrace views spectacular. Worth every penny.',
                'review_es' => '¡Sin duda lo mejor de nuestro viaje a Valencia! El chef fue increíblemente cálido, la comida divina y las vistas desde la terraza espectaculares. Vale cada céntimo.',
                'rating' => 5,
            ],
            [
                'name' => 'Marco Rossi',
                'location_label' => 'Milan, Italy',
                'review_en' => 'As an Italian, I was skeptical about paella. But this experience completely won me over. The market tour was educational and the cooking class was so much fun!',
                'review_es' => 'Como italiano, era escéptico con la paella. Pero esta experiencia me conquistó por completo. La visita al mercado fue educativa y la clase de cocina fue muy divertida.',
                'rating' => 5,
            ],
            [
                'name' => 'Anna & Thomas',
                'location_label' => 'Berlin, Germany',
                'review_en' => 'We booked the Casa Magnolia experience and it was absolutely magical. The villa, the sunset, the paella — everything was perfect. Already planning to come back!',
                'review_es' => 'Reservamos la experiencia Casa Magnolia y fue absolutamente mágica. La villa, la puesta de sol, la paella — todo fue perfecto. ¡Ya estamos planeando volver!',
                'rating' => 5,
            ],
            [
                'name' => 'Emily Chang',
                'location_label' => 'Toronto, Canada',
                'review_en' => 'Perfect for a solo traveler! I met amazing people, learned authentic recipes, and ate the best paella of my life. The chef made everyone feel like family.',
                'review_es' => '¡Perfecto para un viajero solo! Conocí gente increíble, aprendí recetas auténticas y comí la mejor paella de mi vida. El chef hizo que todos se sintieran como en familia.',
                'rating' => 5,
            ],
        ];

        foreach ($testimonials as $i => $t) {
            Testimonial::create(array_merge($t, ['sort_order' => $i]));
        }
    }
}
