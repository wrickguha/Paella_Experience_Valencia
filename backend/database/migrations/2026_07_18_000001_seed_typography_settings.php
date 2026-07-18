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
                [
                    'key'   => 'typography_font_family',
                    'value' => 'Montserrat',
                    'group' => 'typography',
                ],
                [
                    'key'   => 'typography_font_size',
                    'value' => '16',
                    'group' => 'typography',
                ],
            ];

            foreach ($settings as $setting) {
                Setting::updateOrCreate(
                    ['key' => $setting['key']],
                    ['value' => $setting['value'], 'group' => $setting['group']]
                );
            }
        }
    }

    public function down(): void
    {
        Setting::whereIn('key', [
            'typography_font_family',
            'typography_font_size',
        ])->delete();
    }
};
