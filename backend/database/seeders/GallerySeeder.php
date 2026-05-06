<?php

namespace Database\Seeders;

use App\Models\Gallery;
use Illuminate\Database\Seeder;

class GallerySeeder extends Seeder
{
    public function run(): void
    {
        Gallery::truncate();

        $images = [
            // Homepage gallery — real event photos
            [
                'image' => 'gallery/chef-gene.jpg',
                'alt_en' => 'Chef Gene presenting the paella at Casa Magnolia',
                'alt_es' => 'Chef Gene presentando la paella en Casa Magnolia',
                'type' => 'homepage',
                'sort_order' => 0,
                'is_active' => true,
            ],
            [
                'image' => 'gallery/paella-valenciana.jpg',
                'alt_en' => 'Traditional Paella Valenciana freshly cooked',
                'alt_es' => 'Paella Valenciana tradicional recién cocinada',
                'type' => 'homepage',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'image' => 'gallery/sobremesa.jpg',
                'alt_en' => 'Guests sharing stories and laughter after the meal',
                'alt_es' => 'Invitados compartiendo historias y risas tras la comida',
                'type' => 'homepage',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'image' => 'gallery/socarrat.jpg',
                'alt_en' => 'The perfect socarrat — crispy caramelised rice base',
                'alt_es' => 'El socarrat perfecto — base de arroz crujiente caramelizado',
                'type' => 'homepage',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'image' => 'gallery/speakeasy-1.jpg',
                'alt_en' => 'The Speakeasy Experience — underground dining atmosphere',
                'alt_es' => 'La Experiencia Speakeasy — ambiente de comedor underground',
                'type' => 'homepage',
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'image' => 'gallery/paella-1.jpg',
                'alt_en' => 'Paella sizzling over the open flame at Casa Magnolia',
                'alt_es' => 'Paella chisporroteando al fuego abierto en Casa Magnolia',
                'type' => 'homepage',
                'sort_order' => 5,
                'is_active' => true,
            ],
            // Experience gallery
            [
                'image' => 'gallery/speakeasy-2.jpg',
                'alt_en' => 'Guests enjoying the Speakeasy paella experience',
                'alt_es' => 'Invitados disfrutando de la experiencia paella Speakeasy',
                'type' => 'experience',
                'sort_order' => 0,
                'is_active' => true,
            ],
            [
                'image' => 'gallery/speakeasy-3.jpg',
                'alt_en' => 'The unique atmosphere of the Speakeasy venue',
                'alt_es' => 'La atmósfera única del local Speakeasy',
                'type' => 'experience',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'image' => 'gallery/speakeasy-4.jpg',
                'alt_en' => 'Speakeasy — intimate gathering around the paella',
                'alt_es' => 'Speakeasy — reunión íntima alrededor de la paella',
                'type' => 'experience',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'image' => 'gallery/speakeasy-5.jpg',
                'alt_en' => 'Magical evening at the Speakeasy paella experience',
                'alt_es' => 'Noche mágica en la experiencia paella Speakeasy',
                'type' => 'experience',
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($images as $img) {
            Gallery::create($img);
        }
    }
}
