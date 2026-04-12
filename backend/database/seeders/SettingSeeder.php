<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            ['key' => 'site_name', 'value' => 'Paella Experience Valencia', 'group' => 'general'],
            ['key' => 'site_tagline_en', 'value' => 'Authentic Valencian Paella Cooking Experiences', 'group' => 'general'],
            ['key' => 'site_tagline_es', 'value' => 'Experiencias Auténticas de Cocina de Paella Valenciana', 'group' => 'general'],
            ['key' => 'currency', 'value' => 'EUR', 'group' => 'general'],
            ['key' => 'currency_symbol', 'value' => '€', 'group' => 'general'],

            // Contact
            ['key' => 'contact_email', 'value' => 'hello@paellaexperiencevalencia.com', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+34 612 345 678', 'group' => 'contact'],
            ['key' => 'contact_address', 'value' => "Calle de la Paz, 12\nValencia 46002, Spain", 'group' => 'contact'],
            ['key' => 'contact_city', 'value' => 'Valencia, Spain', 'group' => 'contact'],
            ['key' => 'contact_hours', 'value' => 'Mon-Sun: 9:00 AM - 8:00 PM', 'group' => 'contact'],

            // Social
            ['key' => 'social_instagram', 'value' => 'https://instagram.com/paellaexperiencevalencia', 'group' => 'social'],
            ['key' => 'social_facebook', 'value' => 'https://facebook.com/paellaexperiencevalencia', 'group' => 'social'],
            ['key' => 'social_tripadvisor', 'value' => 'https://tripadvisor.com/paellaexperiencevalencia', 'group' => 'social'],
            ['key' => 'social_google', 'value' => 'https://g.page/paellaexperiencevalencia', 'group' => 'social'],

            // Footer
            ['key' => 'footer_text_en', 'value' => 'Paella Experience Valencia — Authentic cooking experiences in the heart of Spain.', 'group' => 'footer'],
            ['key' => 'footer_text_es', 'value' => 'Paella Experience Valencia — Experiencias de cocina auténticas en el corazón de España.', 'group' => 'footer'],
            ['key' => 'footer_copyright', 'value' => '© 2026 Paella Experience Valencia. All rights reserved.', 'group' => 'footer'],

            // Stats / Social proof
            ['key' => 'stat_rating', 'value' => '4.9', 'group' => 'stats'],
            ['key' => 'stat_reviews', 'value' => '2400+', 'group' => 'stats'],
            ['key' => 'stat_guests', 'value' => '5000+', 'group' => 'stats'],
        ];

        foreach ($settings as $s) {
            Setting::create($s);
        }
    }
}
