<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class CommunityTestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $maxOrder = Testimonial::max('sort_order') ?? 0;

        $testimonials = [
            [
                'name'           => 'Alex & Maria',
                'location_label' => 'Berlin, Germany',
                'review_en'      => 'Not just a cooking class! We met amazing people from all over the world and even practiced our Spanish. Such a vibrant community feel.',
                'review_es'      => '¡No es solo una clase de cocina! Conocimos a gente increíble de todo el mundo e incluso practicamos nuestro español. Un ambiente comunitario muy vibrante.',
                'rating'         => 5,
                'is_active'      => true,
                'sort_order'     => $maxOrder + 1,
            ],
            [
                'name'           => 'David Wilson',
                'location_label' => 'New York, USA',
                'review_en'      => 'The language exchange part was so natural. I learned more Spanish in 3 hours of cooking than in a week of classes. Plus, the vibe was 10/10!',
                'review_es'      => 'La parte del intercambio de idiomas fue muy natural. Aprendí más español en 3 horas cocinando que en una semana de clases. ¡Además, el ambiente era de 10!',
                'rating'         => 5,
                'is_active'      => true,
                'sort_order'     => $maxOrder + 2,
            ],
            [
                'name'           => 'Sophie Laurent',
                'location_label' => 'Paris, France',
                'review_en'      => 'A wonderful social experience. I came alone and left with three new friends. The laughter and connection were just as good as the paella.',
                'review_es'      => 'Una experiencia social maravillosa. Vine sola y me fui con tres nuevos amigos. Las risas y la conexión fueron tan buenas como la paella.',
                'rating'         => 5,
                'is_active'      => true,
                'sort_order'     => $maxOrder + 3,
            ],
        ];

        foreach ($testimonials as $data) {
            Testimonial::updateOrCreate(
                ['name' => $data['name']],
                $data
            );
        }
    }
}
