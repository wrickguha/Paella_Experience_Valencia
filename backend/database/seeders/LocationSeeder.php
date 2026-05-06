<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\LocationImage;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $bloom = Location::create([
            'name_en' => 'Bloom Gallery',
            'name_es' => 'Bloom Gallery',
            'description_en' => 'An intimate cooking space nestled in the vibrant heart of Ruzafa, Valencia\'s most creative neighbourhood. Exposed brick meets modern kitchen design.',
            'description_es' => 'Un espacio de cocina íntimo ubicado en el vibrante corazón de Ruzafa, el barrio más creativo de Valencia. El ladrillo visto se encuentra con el diseño moderno de cocina.',
            'address' => 'Carrer de Lluís Oliag, 17, Quatre Carreres, Valencia',
            'image' => 'gallery/speakeasy-1.jpg',
            'availability_type' => 'weekly',
        ]);

        // Bloom Gallery / Speakeasy location images
        foreach ([
            'gallery/speakeasy-1.jpg',
            'gallery/speakeasy-2.jpg',
            'gallery/speakeasy-3.jpg',
            'gallery/speakeasy-4.jpg',
            'gallery/speakeasy-5.jpg',
        ] as $i => $img) {
            LocationImage::create([
                'location_id' => $bloom->id,
                'image' => $img,
                'sort_order' => $i,
            ]);
        }

        $magnolia = Location::create([
            'name_en' => 'Casa Magnolia',
            'name_es' => 'Casa Magnolia',
            'description_en' => 'A stunning private villa with panoramic terrace views, surrounded by orange trees. The perfect setting for an unforgettable culinary journey.',
            'description_es' => 'Una impresionante villa privada con vistas panorámicas desde la terraza, rodeada de naranjos. El escenario perfecto para un viaje culinario inolvidable.',
            'address' => 'Carrer del Pintor Salvador Abril, Valencia',
            'image' => 'gallery/sobremesa.jpg',
            'availability_type' => 'weekly',
        ]);

        // Casa Magnolia location images
        foreach ([
            'gallery/sobremesa.jpg',
            'gallery/paella-1.jpg',
            'gallery/paella-valenciana.jpg',
            'gallery/chef-gene.jpg',
            'gallery/socarrat.jpg',
        ] as $i => $img) {
            LocationImage::create([
                'location_id' => $magnolia->id,
                'image' => $img,
                'sort_order' => $i,
            ]);
        }
    }
}
