<?php

namespace Database\Seeders;

use App\Models\Gallery;
use Illuminate\Database\Seeder;

class GallerySeeder extends Seeder
{
    public function run(): void
    {
        $images = [
            [
                'image' => 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&q=80',
                'alt_en' => 'Paella cooking over open fire',
                'alt_es' => 'Paella cocinando al fuego',
                'type' => 'homepage',
            ],
            [
                'image' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
                'alt_en' => 'Fresh ingredients at Mercado Central',
                'alt_es' => 'Ingredientes frescos en el Mercado Central',
                'type' => 'homepage',
            ],
            [
                'image' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
                'alt_en' => 'Beautiful terrace dining',
                'alt_es' => 'Hermosa cena en la terraza',
                'type' => 'homepage',
            ],
            [
                'image' => 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80',
                'alt_en' => 'Chef preparing ingredients',
                'alt_es' => 'Chef preparando ingredientes',
                'type' => 'homepage',
            ],
            [
                'image' => 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80',
                'alt_en' => 'Group enjoying the experience',
                'alt_es' => 'Grupo disfrutando de la experiencia',
                'type' => 'homepage',
            ],
            [
                'image' => 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=80',
                'alt_en' => 'Finished paella dish',
                'alt_es' => 'Plato de paella terminado',
                'type' => 'homepage',
            ],
        ];

        foreach ($images as $i => $img) {
            Gallery::create(array_merge($img, ['sort_order' => $i]));
        }
    }
}
