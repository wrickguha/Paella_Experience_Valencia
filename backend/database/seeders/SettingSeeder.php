<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::truncate();

        $settings = [
            // General
            ['key' => 'hero_tagline', 'value' => 'Speak. Cook. Connect', 'group' => 'general'],
            ['key' => 'hero_tagline_en', 'value' => 'Speak. Cook. Connect', 'group' => 'general'],
            ['key' => 'hero_tagline_es', 'value' => 'Habla. Cocina. Conecta', 'group' => 'general'],
            ['key' => 'site_name', 'value' => 'Paella Experience Valencia', 'group' => 'general'],
            ['key' => 'hero_video', 'value' => 'video/hero-video.mp4', 'group' => 'general'],
            ['key' => 'community_image_1', 'value' => 'assets/images/speakeasy/GPTempDownload(1).jpg', 'group' => 'general'],
            ['key' => 'community_image_2', 'value' => 'assets/images/casa-magnolia/Sobremesa.jpg', 'group' => 'general'],
            ['key' => 'community_image_3', 'value' => 'assets/images/speakeasy/GPTempDownload(3).jpg', 'group' => 'general'],
            ['key' => 'community_title', 'value' => 'Meet the Community', 'group' => 'general'],
            ['key' => 'community_subtitle', 'value' => 'People from different places come together for more than just food.', 'group' => 'general'],
            ['key' => 'community_card1_title', 'value' => 'Travelers & Locals', 'group' => 'general'],
            ['key' => 'community_card1_desc', 'value' => 'Connect with people from all over the world and Valencia.', 'group' => 'general'],
            ['key' => 'community_card2_title', 'value' => 'Make New Friends', 'group' => 'general'],
            ['key' => 'community_card2_desc', 'value' => 'Our experiences are designed to foster genuine human connections.', 'group' => 'general'],
            ['key' => 'community_card3_title', 'value' => 'Shared Experiences', 'group' => 'general'],
            ['key' => 'community_card3_desc', 'value' => 'Create lasting memories while learning and laughing together.', 'group' => 'general'],
            ['key' => 'site_tagline_en', 'value' => 'Authentic Valencian Paella Cooking Experiences', 'group' => 'general'],
            ['key' => 'site_tagline_es', 'value' => 'Experiencias Auténticas de Cocina de Paella Valenciana', 'group' => 'general'],
            ['key' => 'currency', 'value' => 'EUR', 'group' => 'general'],
            ['key' => 'currency_symbol', 'value' => '€', 'group' => 'general'],
            ['key' => 'testimonial_video_1', 'value' => 'https://www.youtube.com/watch?v=6k8p5_h8WbY', 'group' => 'general'],
            ['key' => 'testimonial_video_2', 'value' => 'https://www.youtube.com/watch?v=Z7n4w0yv5zM', 'group' => 'general'],
            ['key' => 'testimonial_video_3', 'value' => 'https://www.youtube.com/watch?v=Kzszc67N4zY', 'group' => 'general'],

            // Contact
            ['key' => 'contact_email', 'value' => 'info@speakeasyvalencia.com', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+34 612 345 678', 'group' => 'contact'],
            ['key' => 'contact_address', 'value' => "Calle de la Paz, 12\nValencia 46002, Spain", 'group' => 'contact'],
            ['key' => 'contact_city', 'value' => 'Valencia, Spain', 'group' => 'contact'],
            ['key' => 'contact_hours', 'value' => 'Mon-Sun: 9:00 AM - 8:00 PM', 'group' => 'contact'],
            ['key' => 'contact_map_embed', 'value' => '', 'group' => 'contact'],

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
