<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        Location::create([
            'name_en' => 'Bloom Gallery',
            'name_es' => 'Bloom Gallery',
            'description_en' => 'An intimate cooking space nestled in the vibrant heart of Ruzafa, Valencia\'s most creative neighbourhood. Exposed brick meets modern kitchen design.',
            'description_es' => 'Un espacio de cocina íntimo ubicado en el vibrante corazón de Ruzafa, el barrio más creativo de Valencia. El ladrillo visto se encuentra con el diseño moderno de cocina.',
            'address' => 'Carrer de Lluís Oliag, 17, Quatre Carreres, Valencia',
            'image' => 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80',
            'availability_type' => 'weekly',
        ]);

        Location::create([
            'name_en' => 'Casa Magnolia',
            'name_es' => 'Casa Magnolia',
            'description_en' => 'A stunning private villa with panoramic terrace views, surrounded by orange trees. The perfect setting for an unforgettable culinary journey.',
            'description_es' => 'Una impresionante villa privada con vistas panorámicas desde la terraza, rodeada de naranjos. El escenario perfecto para un viaje culinario inolvidable.',
            'address' => 'Carrer del Pintor Salvador Abril, Valencia',
            'image' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'availability_type' => 'weekly',
        ]);
    }
}
