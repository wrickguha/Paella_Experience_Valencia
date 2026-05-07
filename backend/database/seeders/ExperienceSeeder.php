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
        $bloom    = Location::where('name_en', 'Bloom Gallery')->first();
        $magnolia = Location::where('name_en', 'Casa Magnolia')->first();
        $speakeasy = Location::where('name_en', 'The Speakeasy')->first();

        // ── Bloom Gallery experience ────────────────────────────────
        if ($bloom) {
            $bloomExp = Experience::firstOrCreate(
                ['location_id' => $bloom->id, 'title_en' => 'The Paella Experience — Bloom Gallery'],
                [
                    'title_es' => 'La Experiencia Paella — Bloom Gallery',
                    'description_en' => 'Saturdays — The Paella Experience from 12–4pm at Bloom Gallery in Ruzafa (Valencia). Market visit, hands-on cooking class, and a full paella feast.',
                    'description_es' => 'Sábados — La Experiencia Paella de 12–16h en Bloom Gallery en Ruzafa (Valencia). Visita al mercado, clase de cocina práctica y un festín completo de paella.',
                    'hero_image' => 'assets/images/speakeasy/GPTempDownload.jpg',
                    'price' => 59.00,
                    'duration' => '4 hours',
                    'sort_order' => 1,
                    'is_active' => true,
                ]
            );

            $bloomFeatures = [
                ['Guided market visit at Mercado Central', 'Visita guiada al Mercado Central'],
                ['Traditional paella cooking class', 'Clase de cocina de paella tradicional'],
                ['Full meal with wine', 'Comida completa con vino'],
                ['Recipe booklet to take home', 'Recetario para llevar a casa'],
                ['Small group (max 12)', 'Grupo pequeño (máx 12)'],
            ];
            foreach ($bloomFeatures as $i => $f) {
                ExperienceFeature::firstOrCreate(
                    ['experience_id' => $bloomExp->id, 'feature_en' => $f[0]],
                    ['feature_es' => $f[1], 'sort_order' => $i]
                );
            }
        }

        // ── Casa Magnolia experience ────────────────────────────────
        if ($magnolia) {
            $magExp = Experience::firstOrCreate(
                ['location_id' => $magnolia->id, 'title_en' => 'The Paella Experience — Casa Magnolia'],
                [
                    'title_es' => 'La Experiencia Paella — Casa Magnolia',
                    'description_en' => 'Weekdays — The premium Paella Experience from 1–5pm at the stunning Casa Magnolia villa. Includes market tour, cooking class, and terrace dining.',
                    'description_es' => 'Días de semana — La Experiencia Paella premium de 13–17h en la impresionante villa Casa Magnolia. Incluye visita al mercado, clase de cocina y comida en terraza.',
                    'hero_image' => 'assets/images/casa-magnolia/Paella valenciana.jpg',
                    'price' => 99.00,
                    'duration' => '4 hours',
                    'sort_order' => 2,
                    'is_active' => true,
                ]
            );

            $magFeatures = [
                ['Guided market tour', 'Visita guiada al mercado'],
                ['Hands-on cooking class', 'Clase de cocina práctica'],
                ['Full meal on panoramic terrace', 'Comida completa en terraza panorámica'],
                ['Welcome drink & tapas', 'Copa de bienvenida y tapas'],
                ['Private villa setting', 'Ambiente de villa privada'],
                ['Recipe booklet to take home', 'Recetario para llevar a casa'],
            ];
            foreach ($magFeatures as $i => $f) {
                ExperienceFeature::firstOrCreate(
                    ['experience_id' => $magExp->id, 'feature_en' => $f[0]],
                    ['feature_es' => $f[1], 'sort_order' => $i]
                );
            }
        }

        // ── The Speakeasy experience ────────────────────────────────
        if ($speakeasy) {
            $speakeasyExp = Experience::firstOrCreate(
                ['location_id' => $speakeasy->id, 'title_en' => 'The Speakeasy Paella Session'],
                [
                    'title_es' => 'La Sesión Paella Speakeasy',
                    'description_en' => 'Friday & Saturday evenings — An exclusive underground paella experience with candlelight, jazz, and the finest local ingredients.',
                    'description_es' => 'Viernes y sábados por la noche — Una exclusiva experiencia de paella subterránea con velas, jazz y los mejores ingredientes locales.',
                    'hero_image' => 'assets/images/speakeasy/GPTempDownload(2).jpg',
                    'price' => 129.00,
                    'duration' => '4 hours',
                    'sort_order' => 3,
                    'is_active' => true,
                ]
            );

            $speakeasyFeatures = [
                ['Exclusive underground venue', 'Local subterráneo exclusivo'],
                ['Candlelight & live jazz', 'Velas y jazz en directo'],
                ['Premium local ingredients', 'Ingredientes locales de primera calidad'],
                ['Full dinner with wine pairing', 'Cena completa con maridaje de vinos'],
                ['Intimate groups only (max 10)', 'Solo grupos íntimos (máx 10)'],
            ];
            foreach ($speakeasyFeatures as $i => $f) {
                ExperienceFeature::firstOrCreate(
                    ['experience_id' => $speakeasyExp->id, 'feature_en' => $f[0]],
                    ['feature_es' => $f[1], 'sort_order' => $i]
                );
            }
        }
    }
}
