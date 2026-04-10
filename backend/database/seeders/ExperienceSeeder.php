<?php

namespace Database\Seeders;

use App\Models\Experience;
use App\Models\ExperienceFeature;
use App\Models\Location;
use Illuminate\Database\Seeder;

class ExperienceSeeder extends Seeder
{
    public function run(): void
    {
        $bloom = Location::where('name_en', 'Bloom Gallery')->first();

        // ── Bloom Gallery experience ────────────────────────────────
        $bloomExp = Experience::create([
            'title_en' => 'The Paella Experience — Bloom Gallery',
            'title_es' => 'La Experiencia Paella — Bloom Gallery',
            'description_en' => 'Saturdays — The Paella Experience from 12–4pm at Bloom Gallery in Ruzafa (Valencia). Market visit, hands-on cooking class, and a full paella feast.',
            'description_es' => 'Sábados — La Experiencia Paella de 12–16h en Bloom Gallery en Ruzafa (Valencia). Visita al mercado, clase de cocina práctica y un festín completo de paella.',
            'hero_image' => 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&q=80',
            'price' => 59.00,
            'duration' => '4 hours',
            'location_id' => $bloom->id,
            'sort_order' => 1,
        ]);

        $bloomFeatures = [
            ['Guided market visit at Mercado Central', 'Visita guiada al Mercado Central'],
            ['Traditional paella cooking class', 'Clase de cocina de paella tradicional'],
            ['Full meal with wine', 'Comida completa con vino'],
            ['Recipe booklet to take home', 'Recetario para llevar a casa'],
            ['Small group (max 12)', 'Grupo pequeño (máx 12)'],
        ];

        foreach ($bloomFeatures as $i => $f) {
            ExperienceFeature::create([
                'experience_id' => $bloomExp->id,
                'feature_en' => $f[0],
                'feature_es' => $f[1],
                'sort_order' => $i,
            ]);
        }

        // ── Casa Magnolia experience ────────────────────────────────
        $magnolia = Location::where('name_en', 'Casa Magnolia')->first();

        $magExp = Experience::create([
            'title_en' => 'The Paella Experience — Casa Magnolia',
            'title_es' => 'La Experiencia Paella — Casa Magnolia',
            'description_en' => 'Weekdays — The premium Paella Experience from 1–5pm at the stunning Casa Magnolia villa. Includes market tour, cooking class, and terrace dining.',
            'description_es' => 'Días de semana — La Experiencia Paella premium de 13–17h en la impresionante villa Casa Magnolia. Incluye visita al mercado, clase de cocina y comida en terraza.',
            'hero_image' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'price' => 99.00,
            'duration' => '4 hours',
            'location_id' => $magnolia->id,
            'sort_order' => 2,
        ]);

        $magFeatures = [
            ['Guided market tour', 'Visita guiada al mercado'],
            ['Hands-on cooking class', 'Clase de cocina práctica'],
            ['Full meal on panoramic terrace', 'Comida completa en terraza panorámica'],
            ['Welcome drink & tapas', 'Copa de bienvenida y tapas'],
            ['Private villa setting', 'Ambiente de villa privada'],
            ['Recipe booklet to take home', 'Recetario para llevar a casa'],
        ];

        foreach ($magFeatures as $i => $f) {
            ExperienceFeature::create([
                'experience_id' => $magExp->id,
                'feature_en' => $f[0],
                'feature_es' => $f[1],
                'sort_order' => $i,
            ]);
        }
    }
}
