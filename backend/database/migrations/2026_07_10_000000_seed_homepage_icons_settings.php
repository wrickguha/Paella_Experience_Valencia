<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('settings')) {
            $settings = [
                // Highlights Icons
                ['key' => 'highlights_feat1_icon', 'value' => '🗣', 'group' => 'general'],
                ['key' => 'highlights_feat2_icon', 'value' => '🥘', 'group' => 'general'],
                ['key' => 'highlights_feat3_icon', 'value' => '🍷', 'group' => 'general'],
                ['key' => 'highlights_feat4_icon', 'value' => '☀️', 'group' => 'general'],
                ['key' => 'highlights_feat5_icon', 'value' => '👥', 'group' => 'general'],
                ['key' => 'highlights_feat6_icon', 'value' => '🌿', 'group' => 'general'],

                // Flowchart Steps Emojis
                ['key' => 'flow_step1_emoji', 'value' => '👋', 'group' => 'general'],
                ['key' => 'flow_step2_emoji', 'value' => '🗣️', 'group' => 'general'],
                ['key' => 'flow_step3_emoji', 'value' => '🥟', 'group' => 'general'],
                ['key' => 'flow_step4_emoji', 'value' => '🌍', 'group' => 'general'],
                ['key' => 'flow_step5_emoji', 'value' => '🤝', 'group' => 'general'],

                // How It Works Steps Emojis (Empty by default to use SVG icons)
                ['key' => 'howItWorks_step1_emoji', 'value' => '', 'group' => 'general'],
                ['key' => 'howItWorks_step2_emoji', 'value' => '', 'group' => 'general'],
                ['key' => 'howItWorks_step3_emoji', 'value' => '', 'group' => 'general'],
            ];

            foreach ($settings as $s) {
                Setting::updateOrCreate(
                    ['key' => $s['key']],
                    ['value' => $s['value'], 'group' => $s['group']]
                );
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('settings')) {
            $keys = [
                'highlights_feat1_icon', 'highlights_feat2_icon', 'highlights_feat3_icon',
                'highlights_feat4_icon', 'highlights_feat5_icon', 'highlights_feat6_icon',
                'flow_step1_emoji', 'flow_step2_emoji', 'flow_step3_emoji',
                'flow_step4_emoji', 'flow_step5_emoji',
                'howItWorks_step1_emoji', 'howItWorks_step2_emoji', 'howItWorks_step3_emoji',
            ];
            Setting::whereIn('key', $keys)->delete();
        }
    }
};
