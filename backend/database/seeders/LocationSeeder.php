<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\LocationImage;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $bloom = Location::firstOrCreate(
            ['name_en' => 'Bloom Gallery'],
            [
                'name_es' => 'Bloom Gallery',
                'description_en' => 'An intimate cooking space nestled in the vibrant heart of Ruzafa, Valencia\'s most creative neighbourhood. Exposed brick meets modern kitchen design.',
                'description_es' => 'Un espacio de cocina íntimo ubicado en el vibrante corazón de Ruzafa, el barrio más creativo de Valencia. El ladrillo visto se encuentra con el diseño moderno de cocina.',
                'address' => 'Carrer de Lluís Oliag, 17, Quatre Carreres, Valencia',
                'image' => 'assets/images/speakeasy/GPTempDownload.jpg',
                'availability_type' => 'weekly',
                'is_active' => true,
            ]
        );

        // Bloom Gallery images (idempotent)
        $bloomImages = [
            'assets/images/speakeasy/GPTempDownload.jpg',
            'assets/images/speakeasy/GPTempDownload(1).jpg',
            'assets/images/speakeasy/GPTempDownload(2).jpg',
            'assets/images/speakeasy/GPTempDownload(3).jpg',
            'assets/images/speakeasy/GPTempDownload(4).jpg',
        ];
        foreach ($bloomImages as $i => $img) {
            LocationImage::firstOrCreate(
                ['location_id' => $bloom->id, 'image' => $img],
                ['sort_order' => $i]
            );
        }

        $magnolia = Location::firstOrCreate(
            ['name_en' => 'Casa Magnolia'],
            [
                'name_es' => 'Casa Magnolia',
                'description_en' => 'A stunning private villa with panoramic terrace views, surrounded by orange trees. The perfect setting for an unforgettable culinary journey.',
                'description_es' => 'Una impresionante villa privada con vistas panorámicas desde la terraza, rodeada de naranjos. El escenario perfecto para un viaje culinario inolvidable.',
                'address' => 'Carrer del Pintor Salvador Abril, Valencia',
                'image' => 'assets/images/casa-magnolia/Sobremesa.jpg',
                'availability_type' => 'weekly',
                'is_active' => true,
            ]
        );

        // Casa Magnolia images (idempotent)
        $magImages = [
            'assets/images/casa-magnolia/Sobremesa.jpg',
            'assets/images/casa-magnolia/Paella 1.jpg',
            'assets/images/casa-magnolia/Paella valenciana.jpg',
            'assets/images/casa-magnolia/Chef Gene.jpg',
            'assets/images/casa-magnolia/Socarrat.jpg',
        ];
        foreach ($magImages as $i => $img) {
            LocationImage::firstOrCreate(
                ['location_id' => $magnolia->id, 'image' => $img],
                ['sort_order' => $i]
            );
        }

        // The Speakeasy
        $speakeasy = Location::firstOrCreate(
            ['name_en' => 'The Speakeasy'],
            [
                'name_es' => 'The Speakeasy',
                'description_en' => 'A hidden underground venue with an exclusive atmosphere. Experience paella like a secret society — candlelight, jazz, and the finest ingredients.',
                'description_es' => 'Un local subterráneo oculto con una atmósfera exclusiva. Vive la paella como una sociedad secreta — velas, jazz e ingredientes de la más alta calidad.',
                'address' => 'Valencia (exact address shared upon booking)',
                'image' => 'assets/images/speakeasy/GPTempDownload.jpg',
                'availability_type' => 'weekly',
                'is_active' => true,
            ]
        );

        // The Speakeasy images (idempotent)
        $speakeasyImages = [
            'assets/images/speakeasy/GPTempDownload.jpg',
            'assets/images/speakeasy/GPTempDownload(1).jpg',
            'assets/images/speakeasy/GPTempDownload(2).jpg',
            'assets/images/speakeasy/GPTempDownload(3).jpg',
            'assets/images/speakeasy/GPTempDownload(4).jpg',
        ];
        foreach ($speakeasyImages as $i => $img) {
            LocationImage::firstOrCreate(
                ['location_id' => $speakeasy->id, 'image' => $img],
                ['sort_order' => $i]
            );
        }
    }
}
